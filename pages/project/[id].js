import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

// This function tells Next.js which project pages to pre-build
export async function getStaticPaths() {
  const path = require('path');
  const fs = require('fs');
  const filePath = path.join(process.cwd(), 'public', 'projects.json');
  const jsonData = fs.readFileSync(filePath);
  const projects = JSON.parse(jsonData);

  const paths = projects.map(project => ({
    params: { id: project.id.toString() },
  }));

  return { paths, fallback: false };
}

// This function gets the specific data for one project page
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
  const [completedMilestones, setCompletedMilestones] = useState([]);
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }
  
  // A simple helper function to extract the company name
  const getCompanyName = (statement) => {
    const match = statement.match(/\*\*(.*?)\*\*/);
    return match ? match[1] : 'Industry';
  };

  const handleCompleteMilestone = () => {
    if (!user) {
      alert("Please log in to save your progress!");
      return;
    }
    
    // In a real app, you would run the AI check here first.
    // For this prototype, we'll assume it's correct.

    const newCompleted = [...completedMilestones, activeMilestoneIndex];
    setCompletedMilestones(newCompleted);

    // Move to the next milestone if it's not the last one
    if (activeMilestoneIndex < project.milestones.length - 1) {
      setActiveMilestoneIndex(activeMilestoneIndex + 1);
    } else {
      alert("Congratulations! You've completed the project!");
    }
  };

  const getMilestoneStatusIcon = (index) => {
    if (completedMilestones.includes(index)) {
      return <i className="fas fa-check-circle icon-completed"></i>;
    }
    if (index === activeMilestoneIndex) {
      return <div className="icon-active">{index + 1}</div>;
    }
    return <i className="fas fa-circle icon-upcoming"></i>;
  };

  return (
    <>
      <Navbar />
      <div className="project-page-container">
        <div className="project-page-layout">
          {/* Left Sidebar */}
          <aside className="milestone-sidebar">
            <h2 className="project-title">{project.title}</h2>
            <p className="company-inspiration">Inspired by {getCompanyName(project.problemStatement)}</p>
            <ul>
              {project.milestones.map((milestone, index) => (
                <li 
                  key={milestone.id}
                  className={`milestone-item ${index === activeMilestoneIndex ? 'active' : ''}`}
                  onClick={() => setActiveMilestoneIndex(index)}
                >
                  <div className="milestone-marker"></div>
                  <span>{milestone.title}</span>
                </li>
              ))}
            </ul>
          </aside>

          {/* Right Main Content */}
          <main className="project-main-content">
            <header className="project-header">
              <h1>{project.title}</h1>
              <p>{project.problemStatement.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>
            </header>

            <div className="milestones-container">
              {project.milestones.map((milestone, index) => (
                <div key={milestone.id} className={`milestone-card ${activeMilestoneIndex === index ? 'active-card' : ''} ${completedMilestones.includes(index) ? 'completed-card' : ''}`}>
                  <div className="milestone-card-header" onClick={() => setActiveMilestoneIndex(index)}>
                    <div className="milestone-header-title">
                      {getMilestoneStatusIcon(index)}
                      <h3>{milestone.title}</h3>
                    </div>
                    {activeMilestoneIndex !== index && <i className="fas fa-chevron-down"></i>}
                  </div>

                  {activeMilestoneIndex === index && (
                    <div className="milestone-card-body">
                      <div className="milestone-box">
                        <h4>Goal</h4>
                        <p>{milestone.goal}</p>
                      </div>
                      <div className="milestone-box">
                        <h4>Step-by-Step Instructions</h4>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{milestone.instructions}</p>
                      </div>
                      <div className="milestone-box submission-box">
                        <h4>Your Submission</h4>
                        <textarea placeholder="Paste your code, summary, or link here..."></textarea>
                        <button className="btn btn-secondary btn-large" onClick={handleCompleteMilestone}>
                          Complete & Continue <i className="fas fa-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}