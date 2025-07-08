import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

// Static generation functions (getStaticPaths, getStaticProps) remain the same...
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
    
    // State for the submission inputs
    const [submissionText, setSubmissionText] = useState('');
    const [submissionFile, setSubmissionFile] = useState(null);

    const [aiResult, setAiResult] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const loadProgress = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }
            const completionRef = doc(db, "completions", `${user.uid}_${project.id}`);
            const completionSnap = await getDoc(completionRef);
            if (completionSnap.exists()) {
                setIsCompleted(true);
                setSubmissionText(completionSnap.data().submissionSummary);
                setActiveMilestoneIndex(project.milestones.length - 1);
            } else {
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

    // NEW: Function to handle clicking any milestone in the sidebar
    const handleMilestoneSelect = (index) => {
        // Allow navigation only if project is not yet completed
        if (!isCompleted) {
            setActiveMilestoneIndex(index);
            saveProgress(index); // Save progress even when going backward
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
        
        // This part would be expanded to handle file uploads to Firebase Storage
        if(submissionFile) {
            alert("File submission logic would go here. For now, we'll mark as complete.");
        }
        
        if (submissionText.trim().length < 20) return alert("Please provide a valid URL or a more detailed summary (at least 20 characters).");

        setIsLoading(true);
        // In a real app, AI validation and file upload would happen here.
        // For this prototype, we'll simulate a correct verdict.
        const verdict = 'Correct';
        setAiResult({ verdict });

        if (verdict === 'Correct') {
            const completionRef = doc(db, "completions", `${user.uid}_${project.id}`);
            await setDoc(completionRef, {
                userId: user.uid,
                projectId: project.id,
                projectTitle: project.title,
                submissionSummary: submissionText, // This would be a URL for file uploads
                completedAt: new Date()
            });
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
    
    // Determine the submission type for the final milestone
    const finalSubmissionType = project.milestones[project.milestones.length - 1].submissionType || 'text';

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
                                <li 
                                    key={milestone.id} 
                                    className={`milestone-item ${index < activeMilestoneIndex || isCompleted ? 'completed' : ''} ${index === activeMilestoneIndex ? 'active' : ''}`}
                                    onClick={() => handleMilestoneSelect(index)} // <-- NEW CLICK HANDLER
                                >
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
                                <div className="milestone-header-title"><h3>{activeMilestone.title}</h3></div>
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
                                
                                {/* Conditional UI for last milestone vs. others */}
                                {isLastMilestone ? (
                                    isCompleted ? (
                                        <div className="milestone-box submission-box">
                                            <h4>Your Completed Submission</h4>
                                            <p className="completed-submission-text">{submissionText}</p>
                                        </div>
                                    ) : (
                                        <div className="milestone-box submission-box">
                                            <h4>Final Submission & AI Review</h4>
                                            
                                            {/* NEW: Smart Submission UI */}
                                            {finalSubmissionType === 'file' ? (
                                                <div className="submission-input-group">
                                                    <p>This project requires a file submission (e.g., PDF, ZIP, image).</p>
                                                    <input type="file" onChange={(e) => setSubmissionFile(e.target.files[0])} />
                                                    <textarea 
                                                        placeholder="Add any notes about your submission here..."
                                                        value={submissionText}
                                                        onChange={(e) => setSubmissionText(e.target.value)}
                                                    />
                                                </div>
                                            ) : finalSubmissionType === 'link' ? (
                                                <div className="submission-input-group">
                                                    <p>This project requires a URL submission (e.g., GitHub repo, live website, Figma prototype).</p>
                                                    <input 
                                                        type="url"
                                                        placeholder="https://github.com/your-username/project"
                                                        value={submissionText}
                                                        onChange={(e) => setSubmissionText(e.target.value)}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="submission-input-group">
                                                     <p>Summarize your complete approach and how you achieved the project goals.</p>
                                                     <textarea 
                                                        placeholder="e.g., I designed the system by first modeling the data schemas..." 
                                                        value={submissionText}
                                                        onChange={(e) => setSubmissionText(e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            <button className="btn btn-secondary btn-large" onClick={handleFinalSubmit} disabled={isLoading}>
                                                {isLoading ? 'Submitting...' : 'Submit Project'}
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
                                            Next Milestone <i className="fas fa-arrow-right"></i>
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