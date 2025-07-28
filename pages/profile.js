import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../firebase/config';
import { collection, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';

// This function correctly fetches all projects from your JSON file at build time. No changes needed here.
export async function getStaticProps() {
  const path = require('path');
  const fs = require('fs');
  const filePath = path.join(process.cwd(), 'public', 'projects.json');
  const jsonData = await fs.readFileSync(filePath);
  const allProjects = JSON.parse(jsonData);
  return { props: { allProjects } };
}

// --- NEW COMPONENT: Profile Editor ---
const ProfileEditor = ({ user }) => {
    const [profile, setProfile] = useState({ displayName: '', bio: '', skills: '', githubUrl: '', linkedinUrl: '' });
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (user) {
            const fetchProfile = async () => {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // If skills is an array, join it back to a string for editing
                    setProfile({ ...data, skills: Array.isArray(data.skills) ? data.skills.join(', ') : '' });
                }
            };
            fetchProfile();
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!user) return;
        setStatus('Saving...');
        const docRef = doc(db, "users", user.uid);
        try {
            await setDoc(docRef, { 
                ...profile, 
                skills: profile.skills.split(',').map(s => s.trim()).filter(s => s) 
            }, { merge: true });
            setStatus('Profile saved successfully!');
            setTimeout(() => setStatus(''), 3000);
        } catch (error) {
            console.error("Error saving profile:", error);
            setStatus('Failed to save profile.');
        }
    };

    // --- Basic Inline Styles for the Form ---
    const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: '500' };

    return (
        <section className="dashboard-content">
            <h2>Edit Your Public Portfolio</h2>
            <form onSubmit={handleSave} style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={labelStyle}>Display Name</label>
                    <input style={inputStyle} type="text" name="displayName" value={profile.displayName || ''} onChange={handleChange} placeholder="Your Name" required />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={labelStyle}>Bio / Tagline</label>
                    <input style={inputStyle} type="text" name="bio" value={profile.bio || ''} onChange={handleChange} placeholder="Full-Stack Developer | Lifelong Learner" />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={labelStyle}>Skills (comma-separated)</label>
                    <input style={inputStyle} type="text" name="skills" value={profile.skills || ''} onChange={handleChange} placeholder="React, Next.js, Firebase, Node.js" />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={labelStyle}>GitHub URL</label>
                    <input style={inputStyle} type="url" name="githubUrl" value={profile.githubUrl || ''} onChange={handleChange} placeholder="https://github.com/your-username" />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={labelStyle}>LinkedIn URL</label>
                    <input style={inputStyle} type="url" name="linkedinUrl" value={profile.linkedinUrl || ''} onChange={handleChange} placeholder="https://linkedin.com/in/your-username" />
                </div>
                <button type="submit" className="btn btn-primary">Save Profile</button>
                {status && <p style={{ marginTop: '10px', color: '#3b82f6' }}>{status}</p>}
            </form>
        </section>
    );
};


export default function Profile({ allProjects }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [completedProjects, setCompletedProjects] = useState([]);
  const [inProgressProjects, setInProgressProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = async () => {
    try { await auth.signOut(); router.push('/login'); } 
    catch (error) { console.error('Logout failed:', error); }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }

    const fetchUserProjects = async () => {
      try {
        setIsLoading(true);
        const q = query(collection(db, 'userProgress'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const inProgressList = [];
        const completedList = [];

        querySnapshot.forEach(doc => {
          const progressData = doc.data();
          const projectDetails = allProjects.find(p => p.id === progressData.projectId);
          if (projectDetails) {
            if (progressData.isCompleted) {
              completedList.push({ ...projectDetails, submissionUrl: progressData.submissionUrl });
            } else {
              inProgressList.push(projectDetails);
            }
          }
        });
        setInProgressProjects(inProgressList);
        setCompletedProjects(completedList);
      } catch (error) {
        console.error('Error fetching user projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProjects();
  }, [user, loading, router, allProjects]);

  if (loading || isLoading) {
    return <div className="loading-screen">Loading Dashboard...</div>;
  }

  return (
    <>
      <Navbar />
      <main className="container">
        <section className="dashboard-header">
          <h1>My Dashboard</h1>
          <p>Welcome back, <strong>{user?.email || ''}</strong>!</p>
          <Link href={`/portfolio/${user?.uid}`}><a className="btn btn-primary">View My Public Portfolio</a></Link>
          <button onClick={handleLogout} className="btn btn-logout" style={{marginTop: '10px'}}>Logout</button>
        </section>

        <ProfileEditor user={user} />

        <section className="dashboard-content">
          <h2>In Progress</h2>
          {inProgressProjects.length > 0 ? (
            <div className="dashboard-grid">
              {inProgressProjects.map((project) => (
                <ProjectCard key={project.id} project={project} actionButtons={[{ label: 'Resume Project', onClick: () => router.push(`/project/${project.id}`), className: 'btn-primary' }]}/>
              ))}
            </div>
          ) : ( <p className="no-projects-message">No projects in progress. <Link href="/#projects"><a>Find a new challenge!</a></Link></p> )}
        </section>
      </main>
    </>
  );
}