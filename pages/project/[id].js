import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

// Static generation functions (getStaticPaths, getStaticProps) are correct and remain the same.
export async function getStaticPaths() {
    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(process.cwd(), 'public', 'projects.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const projects = JSON.parse(jsonData) || [];
    const paths = projects.map(project => ({ params: { id: project.id.toString() } }));
    return { paths, fallback: false };
}
export async function getStaticProps({ params }) {
    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(process.cwd(), 'public', 'projects.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const projects = JSON.parse(jsonData) || [];
    const project = projects.find(p => p.id.toString() === params.id);
    return { props: { project } };
}

export default function ProjectPage({ project }) {
    const { user } = useAuth();
    const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);
    
    const [submissionText, setSubmissionText] = useState('');
    const [submissionFile, setSubmissionFile] = useState(null);

    const [aiResult, setAiResult] = useState(null);
    const router = useRouter();

    // The useEffect for loading progress is correct.
    useEffect(() => {
        const loadProgress = async () => {
            if (!user) { setIsLoading(false); return; }
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

    const handleMilestoneSelect = (index) => {
        if (!isCompleted) {
            setActiveMilestoneIndex(index);
            saveProgress(index);
        }
    };

    const handleNextMilestone = () => {
        if (activeMilestoneIndex < project.milestones.length - 1) {
            const newIndex = activeMilestoneIndex + 1;
            setActiveMilestoneIndex(newIndex);
            saveProgress(newIndex);
        }
    };

    // --- THIS IS THE FULLY CORRECTED SUBMISSION FUNCTION ---
    const handleFinalSubmit = async () => {
        if (!user) return alert("Please log in to submit.");
        
        let finalSubmissionSummary = submissionText;
        if (submissionFile) {
            finalSubmissionSummary = `File submitted: ${submissionFile.name}. Notes: ${submissionText}`;
        }

        if (finalSubmissionSummary.trim().length < 20) {
            return alert("Please provide a valid URL, file, or a more detailed summary (at least 20 characters).");
        }

        setIsLoading(true);
        setAiResult(null);

        try {
            // 1. CALL THE AI BRAIN (THE BACKEND API)
            const response = await fetch('/api/validate-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentSummary: finalSubmissionSummary,
                    // We combine all milestone goals to give the AI context of the whole project
                    originalSolution: project.milestones.map(m => m.goal).join(' '),
                }),
            });

            if (!response.ok) {
                throw new Error('The AI server could not be reached. Please try again later.');
            }

            // 2. GET THE AI'S VERDICT FROM THE RESPONSE
            const data = await response.json();
            setAiResult(data); // This makes the verdict appear in the UI

            // 3. ONLY PROCEED IF THE VERDICT IS "Correct"
            if (data.verdict === 'Correct') {
                const completionRef = doc(db, "completions", `${user.uid}_${project.id}`);
                await setDoc(completionRef, {
                    userId: user.uid,
                    projectId: project.id,
                    projectTitle: project.title,
                    submissionSummary: finalSubmissionSummary,
                    completedAt: new Date()
                });

                const progressRef = doc(db, "progress", `${user.uid}_${project.id}`);
                await deleteDoc(progressRef);
                
                setIsCompleted(true);
            }
        } catch (error) {
            console.error("Error submitting project:", error);
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // The rest of the file (the JSX rendering part) is identical to the last correct version.
    // ... all the JSX from the return statement goes here ...
    const activeMilestone = project.milestones[activeMilestoneIndex];
    const isLastMilestone = activeMilestoneIndex === project.milestones.length - 1;
    const finalSubmissionType = project.milestones[project.milestones.length - 1].submissionType || 'text';

    return (
        <>
            {/* The Navbar is now in _app.js, so we don't need it here */}
            <div className="project-page-container">
                <div className="project-header">
                    <h1>{project.title}</h1>
                    <p dangerouslySetInnerHTML={{ __html: project.problemStatement.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
                <div className="project-page-layout">
                    <aside className="milestone-sidebar">
                        <h2 className="sidebar-title">Milestones</h2>
                        <ul>
                            {project.milestones.map((milestone, index) => (
                                <li key={milestone.id} className={`milestone-item ${index < activeMilestoneIndex || isCompleted ? 'completed' : ''} ${index === activeMilestoneIndex ? 'active' : ''}`}
                                    onClick={() => handleMilestoneSelect(index)}>
                                    <div className="milestone-marker">{index < activeMilestoneIndex || isCompleted ? <i className="fas fa-check"></i> : index + 1}</div>
                                    <span>{milestone.title}</span>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    <main className="project-main-content">
                        <div className="milestone-card active-card">
                            <div className="milestone-card-header"><div className="milestone-header-title"><h3>{activeMilestone.title}</h3></div></div>
                            <div className="milestone-card-body">
                                <div className="milestone-box"><h4>Goal</h4><p>{activeMilestone.goal}</p></div>
                                <div className="milestone-box"><h4>Step-by-Step Instructions</h4><p style={{ whiteSpace: 'pre-wrap' }}>{activeMilestone.instructions}</p></div>
                                
                                {isLastMilestone ? (
                                    isCompleted ? (
                                        <>
                                            <div className="milestone-box submission-box">
                                                <h4>Your Completed Submission</h4>
                                                <p className="completed-submission-text">{submissionText}</p>
                                            </div>
                                            <div className="resume-box">
                                                <h3><i className="fas fa-id-card"></i> Add to Your Resume</h3>
                                                <p>Congratulations! Copy this text for your resume or LinkedIn.</p>
                                                <div className="resume-text-content">{project.resumeText}</div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="milestone-box submission-box">
                                            <h4>Final Submission & AI Review</h4>
                                            
                                            {/* Smart Submission UI */}
                                            {finalSubmissionType === 'file' ? (
                                                <div className="submission-input-group">
                                                    <p>This project requires a file submission (e.g., PDF, ZIP, image).</p>
                                                    <input type="file" onChange={(e) => setSubmissionFile(e.target.files[0])} />
                                                    <textarea placeholder="Add any notes about your submission here..." value={submissionText} onChange={(e) => setSubmissionText(e.target.value)}/>
                                                </div>
                                            ) : finalSubmissionType === 'link' ? (
                                                <div className="submission-input-group">
                                                    <p>This project requires a URL submission (e.g., GitHub repo, live website, Figma prototype).</p>
                                                    <input type="url" placeholder="https://github.com/your-username/project" value={submissionText} onChange={(e) => setSubmissionText(e.target.value)} />
                                                </div>
                                            ) : (
                                                <div className="submission-input-group">
                                                     <p>Summarize your complete approach and how you achieved the project goals.</p>
                                                     <textarea placeholder="e.g., I designed the system by first modeling the data schemas..." value={submissionText} onChange={(e) => setSubmissionText(e.target.value)} />
                                                </div>
                                            )}
                                            <button className="btn btn-secondary btn-large" onClick={handleFinalSubmit} disabled={isLoading}>{isLoading ? 'AI is Reviewing...' : 'Submit Project for Review'}</button>
                                            
                                            {/* This block will now work correctly */}
                                            {aiResult && (
                                                <>
                                                    <div className={`verdict-box verdict-${aiResult.verdict.toLowerCase()}`}><strong>AI Verdict: {aiResult.verdict}</strong></div>
                                                    {aiResult.verdict === 'Correct' && (
                                                        <div className="resume-box">
                                                            <h3><i className="fas fa-id-card"></i> Add to Your Resume</h3>
                                                            <p>Congratulations! Copy this text for your resume or LinkedIn.</p>
                                                            <div className="resume-text-content">{project.resumeText}</div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )
                                ) : (
                                    <div className="milestone-navigation"><button className="btn btn-primary" onClick={handleNextMilestone}>Next Milestone <i className="fas fa-arrow-right"></i></button></div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}