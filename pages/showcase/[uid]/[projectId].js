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
    const projectsFilePath = path.join(process.cwd(), 'public', 'projects.json');
    const jsonData = await fs.readFile(projectsFilePath, 'utf8');
    const allProjects = JSON.parse(jsonData);
    const projectDetails = allProjects.find(p => p.id == projectId);

    return {
        props: {
            userProfile,
            project: projectDetails,
            progress: {
                ...progressData,
                completedAt: progressData.completedAt ? progressData.completedAt.toDate().toISOString() : null
            }
        }
    };
}


export default function ShowcasePage({ userProfile, project, progress }) {
    // Styles
    const styles = {
        container: { maxWidth: '900px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' },
        header: { textAlign: 'center', marginBottom: '50px' },
        title: { fontSize: '2.5rem', fontWeight: '700' },
        author: { color: '#6b7280', fontSize: '1.1rem' },
        section: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '30px', marginBottom: '30px' },
        sectionTitle: { fontSize: '1.5rem', fontWeight: '600', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '20px' },
        // ... more styles for quiz answers, etc.
    };

    return (
        <div style={{ background: '#f9fafb', minHeight: '100vh' }}>
            <Navbar />
            <div style={styles.container}>
                <header style={styles.header}>
                    <h1 style={styles.title}>{project.title}</h1>
                    <p style={styles.author}>A case study by {userProfile?.displayName || 'A SkillForge User'}</p>
                </header>

                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Project Summary & Approach</h2>
                    <p style={{ lineHeight: 1.7, color: '#374151' }}>{progress.projectSummary}</p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Quiz Results</h2>
                    <p style={{textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981'}}>
                        Final Score: {progress.quizScore}%
                    </p>
                    <div>
                        {(project.quiz || []).map((q, index) => {
                            const userAnswerIndex = progress.quizAnswers[index];
                            const isCorrect = userAnswerIndex === q.correctAnswer;
                            return (
                                <div key={index} style={{ marginBottom: '20px', padding: '15px', border: `1px solid ${isCorrect ? '#86efac' : '#fca5a5'}`, borderRadius: '6px' }}>
                                    <p style={{ fontWeight: '600' }}>{q.question}</p>
                                    <p>Your Answer: <span style={{ color: isCorrect ? '#166534' : '#991b1b', fontWeight: '500' }}>{q.options[userAnswerIndex]}</span></p>
                                    {!isCorrect && <p>Correct Answer: <span style={{ color: '#166534', fontWeight: '500' }}>{q.options[q.correctAnswer]}</span></p>}
                                </div>
                            );
                        })}
                    </div>
                </section>
                
                 <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Milestone Evidence</h2>
                     {(project.milestones || []).map((milestone, idx) => (
                         <div key={milestone.id} style={{marginBottom: '15px'}}>
                             <h4 style={{margin: '0 0 8px 0'}}>{milestone.title}</h4>
                             {progress.screenshots && progress.screenshots[`milestone_${idx}`] ? (
                                 <a href={progress.screenshots[`milestone_${idx}`]} target="_blank" rel="noopener noreferrer">View Screenshot</a>
                             ) : (
                                 <p>No submission for this milestone.</p>
                             )}
                         </div>
                     ))}
                </section>
            </div>
        </div>
    );
}