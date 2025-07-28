// --- THIS IS THE FIX ---
// We were missing the import for the useState hook.
import { useState } from 'react';

import { db } from '../../firebase/config';
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { promises as fs } from 'fs';
import path from 'path';
import Navbar from '../../components/Navbar';
import ProjectCard from '../../components/ProjectCard';
import ProjectSummaryCard from '../../components/ProjectSummaryCard';
import SubmissionModal from '../../components/SubmissionModal'; // Assuming you have this component

// --- SERVER-SIDE DATA FETCHING (This part is correct) ---
export async function getServerSideProps(context) {
  const { uid } = context.params;
  if (!uid) return { notFound: true };

  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    const userProfile = userDocSnap.exists() ? userDocSnap.data() : null;

    const projectsFilePath = path.join(process.cwd(), 'public', 'projects.json');
    const jsonData = await fs.readFile(projectsFilePath, 'utf8');
    const allProjects = JSON.parse(jsonData);

    const q = query(collection(db, 'userProgress'), where('userId', '==', uid), where('isCompleted', '==', true));
    const querySnapshot = await getDocs(q);

    const completedProjects = [];
    querySnapshot.forEach(doc => {
      const progressData = doc.data();
      const projectDetails = allProjects.find(p => p.id === progressData.projectId);
      
      if (projectDetails) {
        const serializableProject = {
            userId: progressData.userId,
            projectId: progressData.projectId,
            isCompleted: progressData.isCompleted,
            submissionUrl: progressData.submissionUrl || null,
            project: projectDetails,
            completedAt: progressData.completedAt ? progressData.completedAt.toDate().toISOString() : null,
            startedAt: progressData.startedAt ? progressData.startedAt.toDate().toISOString() : null,
            lastUpdated: progressData.lastUpdated ? progressData.lastUpdated.toDate().toISOString() : null,
            screenshots: progressData.screenshots || null,
        };
        completedProjects.push(serializableProject);
      }
    });

    return { 
        props: { 
            userProfile, 
            completedProjects 
        } 
    };
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return { props: { error: "Failed to load portfolio." } };
  }
}

// --- UI SECTIONS (Unchanged) ---
const HeroSection = ({ profile }) => {
    const styles = {
        section: { textAlign: 'center', padding: '80px 20px', background: '#fff' },
        h1: { fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', color: '#111827', lineHeight: 1.2 },
        p: { fontSize: '1.25rem', color: '#4b5563', maxWidth: '600px', margin: '0 auto 2rem auto' },
        buttonContainer: { display: 'flex', justifyContent: 'center', gap: '1rem' },
        button: { textDecoration: 'none', background: '#3b82f6', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', transition: 'background-color 0.2s' },
        secondaryButton: { textDecoration: 'none', background: '#e5e7eb', color: '#1f2937', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', transition: 'background-color 0.2s' },
    };
    return (
        <section style={styles.section}>
            <h1 style={styles.h1}>{profile?.displayName || 'A SkillForge Builder'}</h1>
            <p style={styles.p}>{profile?.bio || 'Passionate developer building real-world projects with SkillForge.'}</p>
            <div style={styles.buttonContainer}>
                {profile?.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" style={styles.secondaryButton}>GitHub</a>}
                {profile?.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" style={styles.button}>LinkedIn</a>}
            </div>
        </section>
    );
};
const SkillsSection = ({ profile }) => {
    if (!profile?.skills || profile.skills.length === 0) return null;
    const styles = {
        section: { padding: '60px 20px', background: '#f9fafb', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' },
        container: { maxWidth: '1100px', margin: '0 auto', textAlign: 'center' },
        h2: { fontSize: '2rem', fontWeight: '700', marginBottom: '30px', color: '#111827' },
        skillsContainer: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px' },
        skillPill: { background: '#eef2ff', color: '#4338ca', padding: '8px 16px', borderRadius: '99px', fontWeight: '500', fontSize: '0.9rem' },
    };
    return (
        <section style={styles.section}>
            <div style={styles.container}>
                <h2 style={styles.h2}>Core Skills</h2>
                <div style={styles.skillsContainer}>
                    {profile.skills.map(skill => (
                        <span key={skill} style={styles.skillPill}>{skill}</span>
                    ))}
                </div>
            </div>
        </section>
    );
};
const ProjectsSection = ({ projects }) => {
    const styles = {
        section: { padding: '80px 20px', background: '#fff' },
        container: { maxWidth: '1100px', margin: '0 auto' },
        h2: { fontSize: '2rem', fontWeight: '700', marginBottom: '40px', textAlign: 'center', color: '#111827' },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' },
        noProjects: { textAlign: 'center', color: '#6b7280', padding: '40px', background: '#f9fafb', borderRadius: '8px' },
    };
    return (
        <section style={styles.section}>
            <div style={styles.container}>
                <h2 style={styles.h2}>Featured Projects</h2>
                {projects.length > 0 ? (
                    <div style={styles.grid}>
                        {projects.map(comp => (
                            <ProjectSummaryCard
                                key={comp.projectId}
                                project={comp.project}
                                submissionUrl={comp.submissionUrl}
                                completedAt={comp.completedAt}
                                screenshotUrl={comp.screenshots && comp.screenshots['milestone_0']}
                                onView={() => window.open(`/portfolio/${comp.userId}/project/${comp.projectId}`, '_self')}
                            />
                        ))}
                    </div>
                ) : (
                    <p style={styles.noProjects}>No completed projects to display yet.</p>
                )}
            </div>
        </section>
    );
};

// --- MAIN PORTFOLIO PAGE ---
export default function PortfolioPage({ userProfile, completedProjects, error }) {
    if (error) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><h1>Error</h1><p>{error}</p></div>;
    }
    
    // These hooks are now correctly defined because we added the import
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState('');

    return (
        <div style={{ background: '#ffffff', fontFamily: 'sans-serif' }}>
            <Navbar />
            <SubmissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} content={modalContent} />
            <main>
                <HeroSection profile={userProfile} />
                <SkillsSection profile={userProfile} />
                <ProjectsSection projects={completedProjects} />
            </main>
            <footer style={{ textAlign: 'center', padding: '40px 20px', background: '#111827', color: '#9ca3af' }}>
                <p>Portfolio hosted by SkillForge. © {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
}