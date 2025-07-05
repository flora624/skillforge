import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Home({ projects }) {
  // We no longer need the modal state on the homepage
  return (
    <>
      <Navbar />
      
      <header className="hero-section">
        {/* ... hero section content ... */}
      </header>

      <main>
        {/* ... features section content ... */}
        <section id="projects" className="projects-section">
          <div className="container">
            <h2>Weekly Project Drops</h2>
            <div id="project-list-container">
              {projects.map(project => (
                // This Link component now directs to the dynamic project page
                <Link key={project.id} href={`/project/${project.id}`} className="project-card-link">
                  <div className="project-card">
                    <div className="card-content">
                        <h3>{project.title}</h3>
                        <div className="card-meta">
                            <span><i className="fas fa-folder"></i> {project.domain}</span>
                            <span className={`tag difficulty-${project.difficulty}`}>{project.difficulty}</span>
                        </div>
                        <p>{project.problemStatement.substring(0, 100)}...</p>
                        <div className="skills-gained-preview">
                          <strong>Skills:</strong> {project.skillsGained.slice(0, 3).join(', ')}...
                        </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        {/* ... testimonials section content ... */}
      </main>

      <footer className="footer">
        {/* ... footer content ... */}
      </footer>
    </>
  )
}

// This part remains the same
export async function getStaticProps() {
  const path = require('path');
  const fs = require('fs');
  const filePath = path.join(process.cwd(), 'public', 'projects.json');
  const jsonData = fs.readFileSync(filePath);
  const projects = JSON.parse(jsonData);
  return { props: { projects } };
}