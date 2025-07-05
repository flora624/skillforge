import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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

export default function Profile({ allProjects }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [completedProjects, setCompletedProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If the user data is still loading, do nothing.
    if (loading) {
      return;
    }
    // If the user is not logged in, redirect them to the login page.
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch the completed projects for the logged-in user.
    const fetchCompletedProjects = async () => {
      // 1. Create a query to find all documents in the 'completions' collection
      //    where the 'userId' field matches the current user's ID.
      const q = query(collection(db, 'completions'), where('userId', '==', user.uid));
      
      const querySnapshot = await getDocs(q);
      
      // 2. Map the results to get the project IDs.
      const completedIds = querySnapshot.docs.map(doc => doc.data().projectId);
      
      // 3. Filter the `allProjects` data to get the full details of completed projects.
      const userProjects = allProjects.filter(project => completedIds.includes(project.id));
      
      setCompletedProjects(userProjects);
      setIsLoading(false);
    };

    fetchCompletedProjects();
  }, [user, loading, router, allProjects]);

  if (loading || isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return null; // or a "Please login" message
  }

  return (
    <>
      <Navbar />
      <main className="container">
        <section className="dashboard-header">
          <h1>My Dashboard</h1>
          <p>Welcome back, <strong>{user.email}</strong>!</p>
        </section>

        <section className="dashboard-content">
          <h2>Completed Projects</h2>
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
            <p className="no-projects-message">You haven't completed any projects yet. <Link href="/#projects">Get started!</Link></p>
          )}
        </section>
      </main>
    </>
  );
}