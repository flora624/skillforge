import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';

// This function runs on the server to get all project data ahead of time
export async function getStaticProps() {
  const path = require('path');
  const fs = require('fs');
  const filePath = path.join(process.cwd(), 'public', 'projects.json');
  const jsonData = fs.readFileSync(filePath);
  const allProjects = JSON.parse(jsonData);
  return { props: { allProjects } };
}

export default function ProfilePage({ allProjects }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [completedProjects, setCompletedProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchCompletedProjects = async () => {
      const q = query(collection(db, 'completions'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const completedIds = querySnapshot.docs.map(doc => doc.data().projectId);
      const userProjects = allProjects.filter(project => completedIds.includes(project.id));
      setCompletedProjects(userProjects);
      setIsLoading(false);
    };

    fetchCompletedProjects();
  }, [user, loading, router, allProjects]);

  if (loading || isLoading) {
    return (
      <div className="loading-container">
        <Navbar />
        <p>Loading Profile...</p>
      </div>
    );
  }
  
  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="container profile-page-container">
        
        {/* --- USER DETAILS SECTION --- */}
        <section className="profile-details-section">
          <div className="profile-header">
            <i className="fas fa-user-circle profile-avatar"></i>
            <h1>My Profile</h1>
          </div>
          <div className="profile-info-card">
            <h3>Account Details</h3>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">User ID</span>
              <span className="info-value user-id">{user.uid}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Joined On</span>
              <span className="info-value">{new Date(user.metadata.creationTime).toLocaleDateString()}</span>
            </div>
            {/* You can add a "Change Password" button here in the future */}
          </div>
        </section>

        {/* --- DASHBOARD SECTION --- */}
        <section className="dashboard-section">
          <h2>Project Dashboard</h2>
          <p>You have completed <strong>{completedProjects.length}</strong> project{completedProjects.length !== 1 ? 's' : ''}.</p>
          
          {completedProjects.length > 0 ? (
            <div className="dashboard-grid">
              {completedProjects.map(project => (
                <div key={project.id} className="completed-project-card">
                  <h3>{project.title}</h3>
                  <p>{project.domain}</p>
                  <span className={`tag difficulty-${project.difficulty}`}>{project.difficulty}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-projects-message">You haven't completed any projects yet. Start a new one today!</p>
          )}
        </section>
        
      </main>
    </>
  );
}