import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';

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
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(0);
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }
  
  const activeMilestone = project.milestones[activeMilestoneIndex];

  // A simple helper function to extract the company name from the problem statement
  const getCompanyName = (statement) => {
    const match = statement.match(/\*\*(.*?)\*\*/);
    return match ? match[1] : 'Industry';
  };

  return (
    <>
      <Navbar />
      <div className="project-page-container">
        <div className="project-page-layout">
          {/* Left Sidebar - Kept the original style, just added company name */}
          <aside className="milestone-sidebar">
            <h2 className="project-title">{project.title}</h2>
            {/* THIS IS THE ONLY ADDITION TO THE SIDEBAR */}
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

          {/* Right Main Content - Kept the original style, just added problem statement */}
          <main className="milestone-content">
            {/* THIS IS THE ONLY ADDITION TO THE MAIN CONTENT */}
            <div className="milestone-box problem-statement-header">
                <h3>The Challenge</h3>
                <p>{project.problemStatement.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>
            </div>
            
            <hr className="milestone-divider"/>

            <h1>Milestone {activeMilestoneIndex + 1}: {activeMilestone.title}</h1>

            <div className="milestone-box">
              <h3>Goal:</h3>
              <p>{activeMilestone.goal}</p>
            </div>

            <div className="milestone-box">
              <h3>Instructions:</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{activeMilestone.instructions}</p>
            </div>

            <div className="milestone-box submission-box">
              <h3>Your Submission</h3>
              <textarea placeholder="Paste your code, summary, or link here..."></textarea>
              <button className="btn btn-primary">Submit Milestone</button>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}