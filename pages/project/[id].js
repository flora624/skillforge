import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'; 
import Navbar from '../../components/Navbar';
import ChatInterface from '../../components/ChatInterface';
import ScreenshotUpload from '../../components/ScreenshotUpload';
import MCQAssessment from '../../components/MCQAssessment';

// Helper to generate project-specific MCQs
function getProjectMCQs(project) {
    // Safety check for project object
    if (!project) {
        return [
            {
                question: 'Select the correct answer.',
                options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
                answer: 0
            }
        ];
    }

    // 1. Generic MCQ
    const questions = [
        {
            question: 'What is the main purpose of this project?',
            options: [project.problemStatement || 'Unknown', project.solution || 'Unknown', project.title || 'Unknown', project.domain || 'Unknown'],
            answer: 1 // The solution is the correct answer
        }
    ];
    // 2. Project-specific MCQs (example logic, can be improved or made more granular)
    if (project.techStack && Array.isArray(project.techStack) && project.techStack.length > 0) {
        questions.push({
            question: 'Which technology is used in the tech stack for this project?',
            options: project.techStack.slice(0, 4).map(t => t?.name || 'Unknown'),
            answer: 0
        });
    }
    if (project.milestones && Array.isArray(project.milestones) && project.milestones.length > 0) {
        questions.push({
            question: 'What is the first milestone of this project?',
            options: project.milestones.slice(0, 4).map(m => m?.title || 'Unknown'),
            answer: 0
        });
    }
    if (project.skillsGained && Array.isArray(project.skillsGained) && project.skillsGained.length > 0) {
        questions.push({
            question: 'Which of the following is a skill gained from this project?',
            options: project.skillsGained.slice(0, 4),
            answer: 0
        });
    }
    if (project.domain) {
        questions.push({
            question: 'What is the domain of this project?',
            options: [project.domain, 'Frontend', 'Backend', 'Mobile'],
            answer: 0
        });
    }
    // Ensure 5 questions
    while (questions.length < 5) {
        questions.push({
            question: 'Select the correct answer.',
            options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            answer: 0
        });
    }
    return questions;
}

// --- Static Generation & UI Components (Unchanged) ---
// Your UI components are great, no changes needed there.
export async function getStaticPaths() {
    try {
        const path = require('path');
        const fs = require('fs');
        const filePath = path.join(process.cwd(), 'public', 'projects.json');
        
        if (!fs.existsSync(filePath)) {
            return { paths: [], fallback: true };
        }
        
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const projects = JSON.parse(jsonData) || [];
        const paths = projects.map(project => ({ params: { id: project.id.toString() } }));
        return { paths, fallback: true };
    } catch (error) {
        console.error('Error in getStaticPaths:', error);
        return { paths: [], fallback: true };
    }
}

export async function getStaticProps({ params }) {
    try {
        const path = require('path');
        const fs = require('fs');
        const filePath = path.join(process.cwd(), 'public', 'projects.json');
        
        if (!fs.existsSync(filePath)) {
            return { notFound: true };
        }
        
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const projects = JSON.parse(jsonData) || [];
        const project = projects.find(p => p.id.toString() === params.id);
        if (!project) { return { notFound: true }; }
        return { props: { project }, revalidate: 60 };
    } catch (error) {
        console.error('Error in getStaticProps:', error);
        return { notFound: true };
    }
}
const ContentRenderer = ({ block }) => {
    switch (block.type) {
        case 'paragraph': return <p style={{ fontSize: '1.1rem', color: '#374151', lineHeight: '1.8', margin: '0 0 20px 0' }}>{block.value}</p>;
        case 'subheader': return <h3 style={{ fontSize: '1.4rem', fontWeight: '600', color: '#111827', margin: '40px 0 20px 0', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>{block.value}</h3>;
        case 'code': return ( <pre style={{ background: '#f8fafc', color: '#1f2937', padding: '24px', borderRadius: '8px', margin: '0 0 20px 0', whiteSpace: 'pre-wrap', fontFamily: 'Monaco, Consolas, "Courier New", monospace', fontSize: '14px', border: '1px solid #e5e7eb', overflow: 'auto' }}> <code>{block.value}</code> </pre> );
        case 'image': return ( <img src={block.src} alt={block.alt || 'Project visual'} style={{ maxWidth: '100%', borderRadius: '8px', margin: '20px 0', border: '1px solid #e5e7eb' }} /> );
        case 'callout': const calloutColors = { info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' }, warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' }, success: { bg: '#f0fdf4', border: '#86efac', text: '#166534' }, error: { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626' } }; const colors = calloutColors[block.style] || calloutColors.info; return ( <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '16px', margin: '20px 0', color: colors.text }}><p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>{block.value}</p></div> );
        default: return null;
    }
};
const ProjectHeader = ({ project }) => ( 
    <div style={{ marginBottom: '40px' }}>
        <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <div style={{ width: '50px', height: '50px', background: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>🚀</div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: 0 }}>{project.title}</h1>
                    <p style={{ fontSize: '1rem', color: '#6b7280', margin: '5px 0 0 0' }}>{project.tagline}</p>
                </div>
                {project.sourceCodeUrl && ( 
                    <a href={project.sourceCodeUrl} target="_blank" rel="noopener noreferrer" style={{ background: '#f3f4f6', color: '#374151', textDecoration: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '500' }}> 
                        View Code 
                    </a> 
                )}
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <span style={{ background: '#3b82f6', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '500' }}>{project.domain}</span>
                <span style={{ background: '#10b981', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '500' }}>{project.difficulty}</span>
                <span style={{ background: '#8b5cf6', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '500' }}>{project.estimatedHours} Hours</span>
            </div>
            {project.techStack && ( 
                <div style={{ marginTop: '20px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>Tech Stack:</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {project.techStack.map((tech, index) => ( 
                            <span key={index} style={{ background: '#f8fafc', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid #e2e8f0' }}> 
                                {tech.name} 
                            </span> 
                        ))}
                    </div>
                </div> 
            )}
        </div>
    </div> 
);

const TabNavigation = ({ milestones, activeMilestoneIndex, onMilestoneSelect, isCompleted }) => ( 
    <div style={{ marginBottom: '30px' }}>
        <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '10px' }}>
            <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '5px' }}>
                {(milestones || []).map((milestone, index) => { 
                    const isActive = index === activeMilestoneIndex; 
                    const isDone = index < activeMilestoneIndex || isCompleted; 
                    return ( 
                        <button key={milestone.id} onClick={() => onMilestoneSelect(index)} style={{ background: isActive ? '#3b82f6' : 'transparent', color: isActive ? 'white' : '#6b7280', border: 'none', padding: '12px 16px', borderRadius: '6px', fontWeight: '500', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 'fit-content', transition: 'all 0.2s ease' }}>
                            <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: isActive ? 'rgba(255,255,255,0.3)' : isDone ? '#10b981' : '#e5e7eb', color: isActive ? 'white' : isDone ? 'white' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600' }}> 
                                {isDone ? '✓' : index + 1} 
                            </span>
                            <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}> 
                                {milestone.title.replace(/^Phase \d+:\s*/, '')} 
                            </span>
                        </button> 
                    ); 
                })}
            </div>
        </div>
    </div> 
);

const ProgressBar = ({ current, total }) => { 
    const percentage = total > 0 ? ((current + 1) / total) * 100 : 0; 
    return ( 
        <div style={{ marginBottom: '30px' }}>
            <div style={{ background: '#f3f4f6', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ background: '#3b82f6', height: '100%', width: `${percentage}%`, transition: 'width 0.3s ease', borderRadius: '3px' }}></div>
            </div>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.875rem', margin: '8px 0 0 0' }}> 
                Step {current + 1} of {total} • {Math.round(percentage)}% Complete 
            </p>
        </div> 
    ); 
};
const ProjectWorkspace = ({ project, activeMilestoneIndex, onMilestoneSelect, isCompleted, onCompleteProject, userId, projectId, screenshots, setScreenshots }) => {
    const activeMilestone = project.milestones[activeMilestoneIndex];
    const [screenshotUploaded, setScreenshotUploaded] = useState(!!(screenshots && screenshots[`milestone_${activeMilestoneIndex}`]));
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [showMCQ, setShowMCQ] = useState(false);
    const [mcqResult, setMcqResult] = useState(null);
    const [mcqSubmitted, setMcqSubmitted] = useState(false);
    const [showLiveProjectInput, setShowLiveProjectInput] = useState(false);
    const [liveProjectUrl, setLiveProjectUrl] = useState('');
    const isLastMilestone = activeMilestoneIndex === project.milestones.length - 1;

    // Update screenshotUploaded if screenshots prop changes
    useEffect(() => {
        setScreenshotUploaded(!!(screenshots && screenshots[`milestone_${activeMilestoneIndex}`]));
    }, [screenshots, activeMilestoneIndex]);

    // Remove automatic MCQ display after screenshot upload
    // MCQ will be shown only after clicking Next on the last milestone

    const handleScreenshotUpload = (url) => {
        setScreenshotUploaded(true);
        setScreenshots(prev => ({ ...prev, [`milestone_${activeMilestoneIndex}`]: url }));
    };

    const handleNext = () => {
        if (!screenshotUploaded) {
            setShowPopup(true);
            return;
        }
        if (activeMilestoneIndex < project.milestones.length - 1) {
            onMilestoneSelect(activeMilestoneIndex + 1);
        } else if (activeMilestoneIndex === project.milestones.length - 1) {
            // On last milestone, show MCQ after clicking Next
            setShowMCQ(true);
        }
    };

    // Handle MCQ submission - now shows live project input instead of completing directly
    const handleMCQSubmit = async (result) => {
        setMcqResult(result);
        setShowMCQ(false);
        setMcqSubmitted(true);
        setShowLiveProjectInput(true);
        
        if (userId && projectId) {
            const progressRef = doc(db, 'userProgress', `${userId}_${projectId}`);
            await setDoc(progressRef, {
                mcq: result,
                quizAnswers: result.answers,
                quizScore: result.score
            }, { merge: true });
        }
    };

    // Handle final project submission with optional live project URL
    const handleFinalSubmit = async () => {
        if (userId && projectId) {
            const progressRef = doc(db, 'userProgress', `${userId}_${projectId}`);
            await setDoc(progressRef, {
                isCompleted: true,
                submissionUrl: liveProjectUrl || null,
                completedAt: serverTimestamp()
            }, { merge: true });
        }
        
        // Complete the project
        onCompleteProject(liveProjectUrl || 'Project Completed');
    };

    // Validate URL format
    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    // Handle final submission attempt (for validation)
    const handleFinalSubmissionAttempt = () => {
        if (!screenshotUploaded) {
            setPopupMessage('Please upload a screenshot before submitting the project.');
            setShowPopup(true);
            return;
        }
        if (!mcqSubmitted) {
            setPopupMessage('Please complete the MCQ assessment before submitting the project.');
            setShowPopup(true);
            return;
        }
        // This shouldn't be reached since MCQ submission completes the project
        onCompleteProject('Project Completed');
    };

    return (
        <div>
            <ProgressBar current={activeMilestoneIndex} total={project.milestones.length} />
            <TabNavigation
                milestones={project.milestones}
                activeMilestoneIndex={activeMilestoneIndex}
                onMilestoneSelect={index => {
                    if (index === activeMilestoneIndex) return;
                    if (index > activeMilestoneIndex && !screenshotUploaded) {
                        setShowPopup(true);
                        return;
                    }
                    onMilestoneSelect(index);
                }}
                isCompleted={isCompleted}
            />
            <div>
                {activeMilestone && (
                <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '40px', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#111827', margin: '0 0 15px 0' }}>{activeMilestone.title}</h2>
                    <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe', marginBottom: '30px' }}>
                        <p style={{ fontSize: '1rem', color: '#1e40af', lineHeight: '1.6', margin: 0, fontWeight: '500' }}><strong>🎯 Goal:</strong> {activeMilestone.goal}</p>
                        {activeMilestone.estimatedHours && (
                            <p style={{ fontSize: '0.9rem', color: '#3730a3', margin: '8px 0 0 0', fontWeight: '500' }}>
                                ⏱️ Estimated Time: {activeMilestone.estimatedHours} hours
                            </p>
                        )}
                    </div>
                    <div style={{ marginBottom: '30px' }}>
                        {activeMilestone.content && activeMilestone.content.map((block, index) => (
                            <ContentRenderer key={index} block={block} />
                        ))}
                    </div>
                    {/* Screenshot Upload Enforcement */}
                    {!isCompleted && (
                        <>
                            <ScreenshotUpload
                                userId={userId}
                                projectId={projectId}
                                milestoneIndex={activeMilestoneIndex}
                                onUpload={handleScreenshotUpload}
                            />
                            {/* Always show Next/Complete button on last milestone if not completed */}
                            {(activeMilestone.showNext !== false || activeMilestoneIndex === project.milestones.length - 1) && !isCompleted && (
                                <button
                                    onClick={handleNext}
                                    disabled={!screenshotUploaded}
                                    style={{
                                        marginTop: 10,
                                        padding: '10px 28px',
                                        borderRadius: 6,
                                        background: screenshotUploaded ? '#3b82f6' : '#d1d5db',
                                        color: screenshotUploaded ? 'white' : '#6b7280',
                                        border: 'none',
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        cursor: screenshotUploaded ? 'pointer' : 'not-allowed',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    {activeMilestoneIndex === project.milestones.length - 1 ? 'Show MCQ' : 'Next'}
                                </button>
                            )}
                        </>
                    )}
                </div>
                )}
                
                {/* Popup for screenshot enforcement */}
                {showPopup && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: 'white',
                            padding: '32px 40px',
                            borderRadius: 10,
                            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                            textAlign: 'center',
                            minWidth: 320
                        }}>
                            <h3 style={{ color: '#ef4444', marginBottom: 12 }}>Required Action</h3>
                            <p style={{ color: '#374151', fontSize: '1.05rem', marginBottom: 20 }}>
                                {popupMessage || 'Please upload a screenshot before proceeding to the next milestone.'}
                            </p>
                            <button
                                onClick={() => {
                                    setShowPopup(false);
                                    setPopupMessage('');
                                }}
                                style={{
                                    background: '#3b82f6',
                                    color: 'white',
                                    padding: '8px 24px',
                                    borderRadius: 6,
                                    border: 'none',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    cursor: 'pointer'
                                }}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}
                
                {/* MCQ Assessment after clicking Next on last milestone */}
                {activeMilestoneIndex === project.milestones.length - 1 && !isCompleted && showMCQ && !mcqSubmitted && (
                    <div style={{ margin: '40px 0' }}>
                        <MCQAssessment 
                            questions={getProjectMCQs(project)}
                            onSubmit={handleMCQSubmit} 
                        />
                    </div>
                )}

                {/* Live Project Link Input Section */}
                {activeMilestoneIndex === project.milestones.length - 1 && !isCompleted && (showLiveProjectInput || true) && (mcqSubmitted || true) && (
                    <div style={{ 
                        background: '#ffffff', 
                        borderRadius: '12px', 
                        border: '1px solid #e5e7eb', 
                        padding: '32px', 
                        margin: '40px 0',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
                            <h3 style={{ 
                                fontSize: '1.5rem', 
                                fontWeight: '700', 
                                color: '#111827', 
                                margin: '0 0 8px 0' 
                            }}>
                                Share Your Live Project (Optional)
                            </h3>
                            <p style={{ 
                                color: '#6b7280', 
                                fontSize: '1rem', 
                                margin: 0,
                                lineHeight: '1.5'
                            }}>
                                If you've deployed your project online, share the link to showcase your work!
                            </p>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '0.9rem', 
                                fontWeight: '600', 
                                color: '#374151', 
                                marginBottom: '8px' 
                            }}>
                                Live Project URL
                            </label>
                            <input
                                type="url"
                                value={liveProjectUrl}
                                onChange={(e) => setLiveProjectUrl(e.target.value)}
                                placeholder="https://your-project.netlify.app or https://your-project.vercel.app"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: `1px solid ${liveProjectUrl && !isValidUrl(liveProjectUrl) ? '#ef4444' : '#d1d5db'}`,
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    boxSizing: 'border-box',
                                    transition: 'border-color 0.2s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#3b82f6';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = liveProjectUrl && !isValidUrl(liveProjectUrl) ? '#ef4444' : '#d1d5db';
                                }}
                            />
                            {liveProjectUrl && !isValidUrl(liveProjectUrl) && (
                                <p style={{ 
                                    color: '#ef4444', 
                                    fontSize: '0.875rem', 
                                    margin: '8px 0 0 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <span>⚠️</span>
                                    Please enter a valid URL (e.g., https://example.com)
                                </p>
                            )}
                            <div style={{ 
                                background: '#f8fafc', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '6px', 
                                padding: '12px', 
                                marginTop: '12px' 
                            }}>
                                <p style={{ 
                                    fontSize: '0.875rem', 
                                    color: '#64748b', 
                                    margin: 0,
                                    lineHeight: '1.4'
                                }}>
                                    <strong>💡 Tip:</strong> You can deploy your project for free using platforms like:
                                </p>
                                <ul style={{ 
                                    fontSize: '0.875rem', 
                                    color: '#64748b', 
                                    margin: '8px 0 0 20px',
                                    lineHeight: '1.4'
                                }}>
                                    <li>Netlify, Vercel (for frontend projects)</li>
                                    <li>GitHub Pages (for static sites)</li>
                                    <li>Heroku, Railway (for full-stack apps)</li>
                                </ul>
                            </div>
                        </div>

                        <div style={{ 
                            display: 'flex', 
                            gap: '12px', 
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={handleFinalSubmit}
                                disabled={liveProjectUrl && !isValidUrl(liveProjectUrl)}
                                style={{
                                    padding: '12px 32px',
                                    borderRadius: '8px',
                                    background: (liveProjectUrl && !isValidUrl(liveProjectUrl)) ? '#d1d5db' : '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: '600',
                                    fontSize: '1rem',
                                    cursor: (liveProjectUrl && !isValidUrl(liveProjectUrl)) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                onMouseOver={(e) => {
                                    if (!(liveProjectUrl && !isValidUrl(liveProjectUrl))) {
                                        e.target.style.background = '#059669';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!(liveProjectUrl && !isValidUrl(liveProjectUrl))) {
                                        e.target.style.background = '#10b981';
                                    }
                                }}
                            >
                                <span>🎉</span>
                                Complete Project
                            </button>
                            
                            <button
                                onClick={() => {
                                    setLiveProjectUrl('');
                                    handleFinalSubmit();
                                }}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    background: 'transparent',
                                    color: '#6b7280',
                                    border: '1px solid #d1d5db',
                                    fontWeight: '500',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.background = '#f9fafb';
                                    e.target.style.borderColor = '#9ca3af';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.background = 'transparent';
                                    e.target.style.borderColor = '#d1d5db';
                                }}
                            >
                                Skip & Complete
                            </button>
                        </div>
                    </div>
                )}
                
                                
                {/* Completion message */}
                {isCompleted && (
                    <div style={{ padding: '30px', background: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎉</div>
                        <h4 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#166534', margin: 0 }}>
                            Congratulations!
                        </h4>
                        <p style={{ color: '#166534', margin: '10px 0 0 0' }}>
                            You've completed the project!
                        </p>
                    </div>
                )}
                </div>
            </div>
    );
};

// --- Main Page Component ---
export default function ProjectPage({ project }) {
    const router = useRouter();
    const { user } = useAuth();
    
    // State
    const [hasStarted, setHasStarted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [screenshots, setScreenshots] = useState({});

    // --- CORRECTED LOGIC: useEffect ---
    // This now ONLY looks at the 'userProgress' collection for the single source of truth.
    useEffect(() => {
        if (!project) return; // Wait for project data
        if (!user) {
            setIsLoading(false);
            setHasStarted(false); // Reset for logged-out users
            return;
        }

        const checkProgress = async () => {
            setIsLoading(true);
            const progressRef = doc(db, "userProgress", `${user.uid}_${project.id}`);
            const progressSnap = await getDoc(progressRef);

            if (progressSnap.exists()) {
                const data = progressSnap.data();
                setHasStarted(true);
                setIsCompleted(data.isCompleted || false);
                setActiveMilestoneIndex(data.activeMilestoneIndex || 0);
                setScreenshots((data.screenshots && typeof data.screenshots === 'object') ? data.screenshots : {});
            } else {
                setHasStarted(false);
                setIsCompleted(false);
                setScreenshots({});
            }
            setIsLoading(false);
        };

        checkProgress();
    }, [user, project]); // Reruns when user logs in or project changes

    // --- CORRECTED LOGIC: handleStartProject ---
    // Creates the initial document in the 'userProgress' collection.
    const handleStartProject = async () => {
        if (!user) { alert("Please log in to start the project."); return; }
        
        setHasStarted(true);
        setActiveMilestoneIndex(0);

        const progressRef = doc(db, "userProgress", `${user.uid}_${project.id}`);
        await setDoc(progressRef, { 
            userId: user.uid,
            projectId: project.id,
            project: project, // Storing project data makes portfolio pages much easier
            activeMilestoneIndex: 0,
            isCompleted: false,
            hasStarted: true,
            startedAt: serverTimestamp()
        });
    };
    
    // --- CORRECTED LOGIC: handleMilestoneSelect ---
    // Updates the 'activeMilestoneIndex' in the existing 'userProgress' document.
    const handleMilestoneSelect = async (index) => {
        if (isCompleted || !user) return; // Don't allow changes if completed

        setActiveMilestoneIndex(index);
        const progressRef = doc(db, "userProgress", `${user.uid}_${project.id}`);
        await setDoc(progressRef, { activeMilestoneIndex: index }, { merge: true });
    };

    // --- CORRECTED LOGIC: handleCompleteProject ---
    // Sets 'isCompleted' to true in the existing 'userProgress' document.
    const handleCompleteProject = async (submission) => {
        if (!user) return;

        const progressRef = doc(db, "userProgress", `${user.uid}_${project.id}`);
        await setDoc(progressRef, {
            isCompleted: true,
            submissionUrl: submission, // Standardized field name
            completedAt: serverTimestamp()
        }, { merge: true });

        // Update local state to immediately reflect the change
        setIsCompleted(true);
    };

    // --- Render Logic ---
    if (router.isFallback || !project) { 
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><h2>Loading Project...</h2></div>;
    }
    
    // Scroll to top when component mounts or project changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [project]);

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
            <Navbar />
            <div style={{ 
                display: 'flex', 
                minHeight: 'calc(100vh - 80px)', // Account for navbar height
                paddingTop: '20px',
                gap: '20px'
            }}>
                
                {/* Left Column: Scrollable Project Content */}
                <div style={{ 
                    flex: '1 1 55%', 
                    maxHeight: 'calc(100vh - 100px)',
                    overflowY: 'auto',
                    paddingLeft: '20px',
                    paddingRight: '10px'
                }}>
                    <ProjectHeader project={project} />
                    
                    {isLoading ? (
                        <div style={{ padding: '0 20px', textAlign: 'center' }}><h2>Loading Your Progress...</h2></div>
                    ) : !hasStarted ? (
                        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
                            <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '40px' }}>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Ready to start this project?</h3>
                                <button onClick={handleStartProject} style={{ background: '#3b82f6', color: 'white', fontWeight: '600', padding: '12px 24px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                                    Start Project
                                </button>
                            </div>
                        </div>
                    ) : (
                        <ProjectWorkspace 
                            project={project}
                            activeMilestoneIndex={activeMilestoneIndex}
                            onMilestoneSelect={handleMilestoneSelect}
                            isCompleted={isCompleted}
                            onCompleteProject={handleCompleteProject}
                            userId={user?.uid}
                            projectId={project.id}
                            screenshots={screenshots}
                            setScreenshots={setScreenshots}
                        />
                    )}
                </div>

                {/* Right Column: Fixed Chat Interface */}
                <div style={{
                    flex: '1 1 45%',
                    height: 'calc(100vh - 100px)',
                    position: 'sticky',
                    top: '20px',
                    paddingRight: '20px',
                    paddingLeft: '10px'
                }}>
                    <ChatInterface channelId={`project_${project.id}`} user={user} />
                </div>

            </div>
        </div>
    );
}