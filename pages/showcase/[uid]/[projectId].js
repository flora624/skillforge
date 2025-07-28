import { db } from '../../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { promises as fs } from 'fs';
import path from 'path';
import Navbar from '../../../components/Navbar';

// Fetch all data for this specific project completion
export async function getServerSideProps(context) {
    const { uid, projectId } = context.params;
    
    // Fetch user profile
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    const userProfile = userDocSnap.exists() ? userDocSnap.data() : null;

    // Fetch the specific progress document
    const progressRef = doc(db, "userProgress", `${uid}_${projectId}`);
    const progressSnap = await getDoc(progressRef);

    if (!progressSnap.exists() || !progressSnap.data().isCompleted) {
        return { notFound: true }; // Only show completed projects
    }
    const progressData = progressSnap.data();

    // Fetch all projects from JSON to get questions and details
    const projectsFilePath = path.join(process.cwd(), 'data', 'projects.json');
    const jsonData = await fs.readFile(projectsFilePath, 'utf8');
    const allProjects = JSON.parse(jsonData);
    const projectDetails = allProjects.find(p => p.id == projectId);

    return {
        props: {
            userProfile,
            project: projectDetails,
            progress: {
                ...progressData,
                completedAt: progressData.completedAt ? progressData.completedAt.toDate().toISOString() : null,
                startedAt: progressData.startedAt ? progressData.startedAt.toDate().toISOString() : null,
                lastUpdated: progressData.lastUpdated ? progressData.lastUpdated.toDate().toISOString() : null
            }
        }
    };
}


export default function ShowcasePage({ userProfile, project, progress }) {
    return (
        <>
            <Navbar />
            <div className="showcase-container">
                {/* Header Section */}
                <header className="showcase-header">
                    <div className="header-content">
                        <h1 className="project-title">{project.title}</h1>
                        <div className="project-meta">
                            <div className="author-info">
                                <div className="author-avatar">
                                    {userProfile?.photoURL ? (
                                        <img src={userProfile.photoURL} alt={userProfile.displayName} />
                                    ) : (
                                        <div className="default-avatar">
                                            {(userProfile?.displayName || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="author-details">
                                    <p className="author-name">{userProfile?.displayName || 'SkillForge User'}</p>
                                    <p className="completion-date">
                                        Completed on {new Date(progress.completedAt).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="project-domain">
                                <span className="domain-badge">{project.domain}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Project Overview */}
                {progress.projectSummary && (
                    <section className="project-overview">
                        <h2 className="section-title">Project Overview</h2>
                        <div className="overview-content">
                            <p>{progress.projectSummary}</p>
                        </div>
                    </section>
                )}

                {/* Milestones Section */}
                <section className="milestones-section">
                    <h2 className="section-title">Project Milestones</h2>
                    <div className="milestones-grid">
                        {(project.milestones || []).map((milestone, idx) => (
                            <div key={milestone.id} className="milestone-card">
                                <div className="milestone-header">
                                    <div className="milestone-number">
                                        <span>{idx + 1}</span>
                                    </div>
                                    <div className="milestone-info">
                                        <h3 className="milestone-title">{milestone.title}</h3>
                                        <p className="milestone-description">{milestone.description}</p>
                                    </div>
                                </div>
                                
                                <div className="milestone-submission">
                                    {progress.screenshots && progress.screenshots[`milestone_${idx}`] ? (
                                        <div className="screenshot-container">
                                            <img 
                                                src={progress.screenshots[`milestone_${idx}`]} 
                                                alt={`${milestone.title} submission`}
                                                className="milestone-screenshot"
                                            />
                                            <div className="screenshot-overlay">
                                                <a 
                                                    href={progress.screenshots[`milestone_${idx}`]} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="view-full-btn"
                                                >
                                                    <i className="fas fa-expand"></i>
                                                    View Full Size
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="no-submission">
                                            <i className="fas fa-image"></i>
                                            <p>No submission provided</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Knowledge Assessment */}
                {project.quiz && project.quiz.length > 0 && (
                    <section className="quiz-section">
                        <h2 className="section-title">Knowledge Assessment</h2>
                        <div className="quiz-grid">
                            {project.quiz.map((question, index) => {
                                const userAnswerIndex = progress.quizAnswers[index];
                                const isCorrect = userAnswerIndex === question.correctAnswer;
                                
                                return (
                                    <div key={index} className={`quiz-card ${isCorrect ? 'correct' : 'incorrect'}`}>
                                        <div className="question-header">
                                            <div className="question-number">Q{index + 1}</div>
                                            <div className={`result-indicator ${isCorrect ? 'correct' : 'incorrect'}`}>
                                                <i className={`fas ${isCorrect ? 'fa-check' : 'fa-times'}`}></i>
                                            </div>
                                        </div>
                                        
                                        <div className="question-content">
                                            <h4 className="question-text">{question.question}</h4>
                                            
                                            <div className="answer-options">
                                                {question.options.map((option, optionIndex) => {
                                                    const isUserAnswer = optionIndex === userAnswerIndex;
                                                    const isCorrectAnswer = optionIndex === question.correctAnswer;
                                                    
                                                    let optionClass = 'option';
                                                    if (isUserAnswer && isCorrectAnswer) {
                                                        optionClass += ' user-correct';
                                                    } else if (isUserAnswer && !isCorrectAnswer) {
                                                        optionClass += ' user-incorrect';
                                                    } else if (isCorrectAnswer) {
                                                        optionClass += ' correct-answer';
                                                    }
                                                    
                                                    return (
                                                        <div key={optionIndex} className={optionClass}>
                                                            <span className="option-letter">
                                                                {String.fromCharCode(65 + optionIndex)}
                                                            </span>
                                                            <span className="option-text">{option}</span>
                                                            {isUserAnswer && (
                                                                <span className="user-choice">Your Answer</span>
                                                            )}
                                                            {isCorrectAnswer && !isUserAnswer && (
                                                                <span className="correct-choice">Correct Answer</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Live Project Section */}
                <section className="submission-section">
                    <div className={`submission-card ${!progress.submissionUrl ? 'no-submission' : ''}`}>
                        <div className="submission-icon">
                            <i className={`fas ${progress.submissionUrl ? 'fa-external-link-alt' : 'fa-info-circle'}`}></i>
                        </div>
                        <div className="submission-content">
                            <h3>Live Project</h3>
                            {progress.submissionUrl ? (
                                <>
                                    <p>View the completed project implementation</p>
                                    <a 
                                        href={progress.submissionUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="submission-link"
                                    >
                                        Visit Project <i className="fas fa-arrow-right"></i>
                                    </a>
                                </>
                            ) : (
                                <p>User has not uploaded any live project link</p>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <style jsx>{`
                .showcase-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                    background: rgba(209, 210, 255, 0.39);
                    min-height: 100vh;
                }

                .showcase-header {
                    background: linear-gradient(135deg, #ffffffff 0%, #f8ecffb7 100%);
                    border-radius: 16px;
                    padding: 3rem 2rem;
                    margin-bottom: 3rem;
                    color: white;
                }

                .header-content {
                    max-width: 800px;
                    margin: 0 auto;
                    text-align: center;
                }

                .project-title {
                    font-size: 3rem;
                    font-weight: 700;
                    margin-bottom: 2rem;
                    line-height: 1.2;
                }

                .project-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .author-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .author-avatar {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 3px solid rgba(223, 155, 255, 1);
                }

                .author-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .default-avatar {
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: 600;
                }

                .author-details {
                    text-align: left;
                }

                .author-name {
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin: 0;
                }

                .completion-date {
                    font-size: 0.9rem;
                    opacity: 0.8;
                    margin: 0;
                }

                .domain-badge {
                    background: rgba(0, 0, 0, 1);
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .project-overview {
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    margin-bottom: 3rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                }

                .section-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 1.5rem;
                    border-bottom: 3px solid #667eea;
                    padding-bottom: 0.5rem;
                    display: inline-block;
                }

                .overview-content p {
                    font-size: 1.1rem;
                    line-height: 1.7;
                    color: #4b5563;
                    margin: 0;
                }

                .milestones-section {
                    margin-bottom: 3rem;
                }

                .milestones-grid {
                    display: grid;
                    gap: 2rem;
                }

                .milestone-card {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    transition: transform 0.2s ease;
                }

                .milestone-card:hover {
                    transform: translateY(-2px);
                }

                .milestone-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    padding: 1.5rem;
                    border-bottom: 1px solid #e5e7eb;
                }

                .milestone-number {
                    width: 40px;
                    height: 40px;
                    background: #667eea;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    flex-shrink: 0;
                }

                .milestone-info {
                    flex: 1;
                }

                .milestone-title {
                    font-size: 1.3rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0 0 0.5rem 0;
                }

                .milestone-description {
                    color: #6b7280;
                    margin: 0;
                    line-height: 1.5;
                }

                .milestone-submission {
                    position: relative;
                }

                .screenshot-container {
                    position: relative;
                    overflow: hidden;
                }

                .milestone-screenshot {
                    width: 100%;
                    height: 300px;
                    object-fit: cover;
                    display: block;
                }

                .screenshot-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .screenshot-container:hover .screenshot-overlay {
                    opacity: 1;
                }

                .view-full-btn {
                    color: white;
                    text-decoration: none;
                    background: #667eea;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: background 0.2s ease;
                }

                .view-full-btn:hover {
                    background: #5a67d8;
                }

                .no-submission {
                    padding: 3rem;
                    text-align: center;
                    color: #9ca3af;
                    background: #f9fafb;
                }

                .no-submission i {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    display: block;
                }

                .quiz-section {
                    margin-bottom: 3rem;
                }

                .quiz-grid {
                    display: grid;
                    gap: 1.5rem;
                }

                .quiz-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    border-left: 4px solid #e5e7eb;
                }

                .quiz-card.correct {
                    border-left-color: #10b981;
                }

                .quiz-card.incorrect {
                    border-left-color: #ef4444;
                }

                .question-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .question-number {
                    background: #f3f4f6;
                    color: #374151;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .result-indicator {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 0.9rem;
                }

                .result-indicator.correct {
                    background: #10b981;
                }

                .result-indicator.incorrect {
                    background: #ef4444;
                }

                .question-text {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 1rem;
                    line-height: 1.5;
                }

                .answer-options {
                    display: grid;
                    gap: 0.75rem;
                }

                .option {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                    background: #f9fafb;
                }

                .option.user-correct {
                    background: #d1fae5;
                    border-color: #10b981;
                }

                .option.user-incorrect {
                    background: #fee2e2;
                    border-color: #ef4444;
                }

                .option.correct-answer {
                    background: #ecfdf5;
                    border-color: #10b981;
                }

                .option-letter {
                    width: 24px;
                    height: 24px;
                    background: #6b7280;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    font-weight: 600;
                    flex-shrink: 0;
                }

                .option.user-correct .option-letter,
                .option.correct-answer .option-letter {
                    background: #10b981;
                }

                .option.user-incorrect .option-letter {
                    background: #ef4444;
                }

                .option-text {
                    flex: 1;
                    color: #374151;
                }

                .user-choice,
                .correct-choice {
                    font-size: 0.8rem;
                    font-weight: 500;
                    padding: 0.25rem 0.5rem;
                    border-radius: 12px;
                }

                .user-choice {
                    background: #dbeafe;
                    color: #000000ff;
                }

                .correct-choice {
                    background: #d1fae5;
                    color: #065f46;
                }

                .submission-section {
                    margin-bottom: 3rem;
                }

                .submission-card {
                    background: linear-gradient(135deg, #ffffffff 0%, #f5eaff88 100%);
                    border-radius: 12px;
                    padding: 2rem;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .submission-card.no-submission {
                    background: linear-gradient(135deg, #000000ff 0%, #6b7280 100%);
                    opacity: 0.8;
                }

                .submission-card.no-submission .submission-icon {
                background: rgba(0, 0, 0, 1);
                    opacity: 0.6;
                }

                .submission-card.no-submission .submission-content p {
                    opacity: 0.8;
                    font-style: italic;
                }

                .submission-icon {
                color: rgba(0, 0, 0, 1);
                    font-size: 3rem;
                    opacity: 0.8;
                }

                .submission-content h3 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin: 0 0 0.5rem 0;
                }

                .submission-content p {
                    margin: 0 0 1rem 0;
                    opacity: 0.9;
                }

                .submission-link {
                    color: white;
                    text-decoration: none;
                    background: rgba(0, 0, 0, 1);
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 500;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: background 0.2s ease;
                }

                .submission-link:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                @media (max-width: 768px) {
                    .showcase-container {
                        padding: 1rem;
                    }

                    .project-title {
                        font-size: 2rem;
                    }

                    .project-meta {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .milestone-header {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .milestone-number {
                        align-self: flex-start;
                    }

                    .submission-card {
                        flex-direction: column;
                        text-align: center;
                    }
                }
            `}</style>
        </>
    );
}