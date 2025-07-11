import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';

export async function getStaticProps() {
  const path = require('path');
  const fs = require('fs');
  const filePath = path.join(process.cwd(), 'public', 'projects.json');
  const jsonData = fs.readFileSync(filePath, 'utf8');
  const allProjects = JSON.parse(jsonData) || [];
  return { props: { allProjects } };
}

export default function Profile({ allProjects }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [completedProjects, setCompletedProjects] = useState([]);
  const [inProgressProjects, setInProgressProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchUserProjects = async () => {
      // Fetch Completed Projects
      const completionsQuery = query(collection(db, 'completions'), where('userId', '==', user.uid));
      const completionSnap = await getDocs(completionsQuery);
      const completedData = completionSnap.docs.map(doc => ({ ...doc.data(), id: doc.data().projectId }));
      setCompletedProjects(completedData);

      // Fetch In-Progress Projects
      const progressQuery = query(collection(db, 'progress'), where('userId', '==', user.uid));
      const progressSnap = await getDocs(progressQuery);
      const inProgressIds = progressSnap.docs.map(doc => doc.data().projectId);
      const inProgressData = allProjects.filter(project => inProgressIds.includes(project.id));
      setInProgressProjects(inProgressData);

      setIsLoading(false);
    };

    fetchUserProjects();
  }, [user, loading, router, allProjects]);

  if (loading || isLoading) {
    return <div className="loading-screen">Loading Dashboard...</div>;
  }

  const handleShare = (userId, projectId) => {
    const shareableLink = `${window.location.origin}/share/${userId}/${projectId}`;
    navigator.clipboard.writeText(shareableLink);
    alert('Shareable link copied to clipboard!');
  };

  return (
    <>
      <Navbar />
      <main className="container">
        <section className="dashboard-header">
          <h1>My Dashboard</h1>
          <p>Welcome back, <strong>{user.email}</strong>!</p>
        </section>

        <section className="dashboard-content">
          <h2>In Progress</h2>
          {inProgressProjects.length > 0 ? (
            <div className="dashboard-grid">
              {inProgressProjects.map(project => (
                <Link href={`/project/${project.id}`} key={project.id} passHref>
                  <div className="project-card-resume">
                    <h3>{project.title}</h3>
                    <p>{project.domain}</p>
                    <div className="btn btn-primary">Resume Project</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="no-projects-message">No projects in progress. <Link href="/#projects">Find a new challenge!</Link></p>
          )}
        </section>

        <section className="dashboard-content">
          <h2>Completed</h2>
          {completedProjects.length > 0 ? (
            <div className="dashboard-grid">
              {completedProjects.map(project => (
                <div key={project.id} className="project-card-completed">
                  <h3>{project.projectTitle}</h3>
                  <p className="completed-submission-text">"{project.submissionSummary.substring(0, 120)}..."</p>
                  <div className="card-actions">
                    <button className="btn" onClick={() => handleShare(user.uid, project.id)}>Share</button>
                    <Link href={`/project/${project.id}`} passHref>
                      <div className="btn btn-secondary">View</div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-projects-message">You haven't completed any projects yet.</p>
          )}
        </section>
      </main>
    </>
  );
}