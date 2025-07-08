import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

// Functions to get project data (getStaticPaths, getStaticProps) remain the same...
export async function getStaticPaths() {
    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(process.cwd(), 'public', 'projects.json');
    const jsonData = fs.readFileSync(filePath);
    const projects = JSON.parse(jsonData);
    const paths = projects.map(project => ({ params: { id: project.id.toString() } }));
    return { paths, fallback: false };
}
export async function getStaticProps({ params }) {
    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(process.cwd(), 'public', 'projects.json');
    const jsonData = fs.readFileSync(filePath);
    const projects = JSON.parse(jsonData);
    const project = projects.find(p => p.id.toString() === params.id);
    return { props: { project } };
}

export default function ProjectPage({ project }) {
    const { user } = useAuth();
    const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);
    
    // State for the final submission
    const [finalSubmission, setFinalSubmission] = useState('');
    const [aiResult, setAiResult] = useState(null);

    const router = useRouter();

    // Effect to load user progress when the page loads
    useEffect(() => {
        const loadProgress = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            // First, check if the project is fully completed
            const completionRef = doc(db, "completions", `${user.uid}_${project.id}`);
            const completionSnap = await getDoc(completionRef);
            if (completionSnap.exists()) {
                setIsCompleted(true);
                setFinalSubmission(completionSnap.data().submissionSummary);
                setActiveMilestoneIndex(project.milestones.length - 1); // Go to last milestone
            } else {
                // If not completed, check for in-progress state
                const progressRef = doc(db, "progress", `${user.uid}_${project.id}`);
                const progressSnap = await getDoc(progressRef);
                if (progressSnap.exists()) {
                    setActiveMilestoneIndex(progressSnap.data().activeMilestoneIndex);
                }
            }
            setIsLoading(false);
        };
        loadProgress();
    }, [user, project.id]);

    const saveProgress = async (newIndex) => {
        if (user) {
            const progressRef = doc(db, "progress", `${user.uid}_${project.id}`);
            await setDoc(progressRef, {
                userId: user.uid,
                projectId: project.id,
                activeMilestoneIndex: newIndex
            });
        }
    };

    const handleNextMilestone = () => {
        if (activeMilestoneIndex < project.milestones.length - 1) {
            const newIndex = activeMilestoneIndex + 1;
            setActiveMilestoneIndex(newIndex);
            saveProgress(newIndex);
        }
    };

    const handleFinalSubmit = async () => {
        if (!user) return alert("Please log in to submit.");
        if (finalSubmission.trim().length < 50) return alert("Please provide a detailed summary.");

        setIsLoading(true);
        // AI Validation
        const response = await fetch('/api/validate-answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentSummary: finalSubmission,
                originalSolution: project.milestones.map(m => m.goal).join(' '), // Combine goals for AI context
            }),
        });
        const data = await response.json();
        setAiResult(data);

        if (data.verdict === 'Correct') {
            // Save to completions collection
            const completionRef = doc(db, "completions", `${user.uid}_${project.id}`);
            await setDoc(completionRef, {
                userId: user.uid,
                projectId: project.id,
                projectTitle: project.title,
                submissionSummary: finalSubmission,
                completedAt: new Date()
            });

            // Delete from progress collection
            const progressRef = doc(db, "progress", `${user.uid}_${project.id}`);
            await deleteDoc(progressRef);
            
            setIsCompleted(true);
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return <div className="loading-screen">Loading Project...</div>;
    }
    
    const activeMilestone = project.milestones[activeMilestoneIndex];
    const isLastMilestone = activeMilestoneIndex === project.milestones.length - 1;

    return (
        <>
            <Navbar />
            <div className="project-page-container">
                <div className="project-header">
                    <h1>{project.title}</h1>
                    <p>{project.problemStatement.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>
                </div>
                <div className="project-page-layout">
                    <aside className="milestone-sidebar">
                        <h2 className="sidebar-title">Milestones</h2>
                        <ul>
                            {project.milestones.map((milestone, index) => (
                                <li key={milestone.id} className={`milestone-item ${index < activeMilestoneIndex || isCompleted ? 'completed' : ''} ${index === activeMilestoneIndex ? 'active' : ''}`}>
                                    <div className="milestone-marker">
                                        {index < activeMilestoneIndex || isCompleted ? <i className="fas fa-check"></i> : index + 1}
                                    </div>
                                    <span>{milestone.title}</span>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    <main className="project-main-content">
                        <div className="milestone-card active-card">
                            <div className="milestone-card-header">
                                <div className="milestone-header-title">
                                    <h3>{activeMilestone.title}</h3>
                                </div>
                            </div>
                            <div className="milestone-card-body">
                                <div className="milestone-box">
                                    <h4>Goal</h4>
                                    <p>{activeMilestone.goal}</p>
                                </div>
                                <div className="milestone-box">
                                    <h4>Step-by-Step Instructions</h4>
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{activeMilestone.instructions}</p>
                                </div>
                                
                                {/* Conditional final submission block */}
                                {isLastMilestone ? (
                                    isCompleted ? (
                                        <div className="milestone-box submission-box">
                                            <h4>Your Completed Submission</h4>
                                            <p className="completed-submission-text">{finalSubmission}</p>
                                        </div>
                                    ) : (
                                        <div className="milestone-box submission-box">
                                            <h4>Final Submission & AI Review</h4>
                                            <p>Summarize your complete approach and how you achieved the project goals. The AI will review your submission.</p>
                                            <textarea 
                                                placeholder="e.g., I designed the system by first modeling the data schemas for users and tests..." 
                                                value={finalSubmission}
                                                onChange={(e) => setFinalSubmission(e.target.value)}
                                            />
                                            <button className="btn btn-secondary btn-large" onClick={handleFinalSubmit} disabled={isLoading}>
                                                {isLoading ? 'AI is Reviewing...' : 'Submit Project'}
                                            </button>
                                            {aiResult && (
                                                <div className={`verdict-box verdict-${aiResult.verdict.toLowerCase()}`}>
                                                    <strong>AI Verdict: {aiResult.verdict}</strong>
                                                </div>
                                            )}
                                        </div>
                                    )
                                ) : (
                                    <div className="milestone-navigation">
                                        <button className="btn btn-primary" onClick={handleNextMilestone}>
                                            Next <i className="fas fa-arrow-right"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}