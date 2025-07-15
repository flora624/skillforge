import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import WaitlistPopup from '../components/WaitlistPopup';

function ProjectCard({ project }) {
  return (
    <Link href={`/project/${project.id}`} className="project-card-link">
      <div className="project-card">
        <div className="card-content">
            <h3>{project.title}</h3>
            <div className="card-meta">
                <span>📁 {project.domain}</span>
                <span className={`tag difficulty-${project.difficulty}`}>{project.difficulty}</span>
            </div>
            <p>{project.problemStatement.substring(0, 100)}...</p>
            <div className="skills-gained-preview">
              <strong>Skills:</strong> {project.skillsGained.slice(0, 3).join(', ')}...
            </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home({ projects }) {
  const [isFrozen, setIsFrozen] = useState(false);

  useEffect(() => {
    if (isFrozen) {
      // Disable scrolling
      document.body.style.overflow = 'hidden';
      // Block interactions
      const blockEvents = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };
      document.addEventListener('keydown', blockEvents, true);
      document.addEventListener('click', blockEvents, true);
      
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', blockEvents, true);
        document.removeEventListener('click', blockEvents, true);
      };
    }
  }, [isFrozen]);

  return (
    <>
      <WaitlistPopup />
      
      {/* Blur wrapper - applies to everything except WaitlistPopup */}
      <div className="frozen-page">
      
        <Navbar />

        <header className="hero-section">
          <div className="container">
              <h1>Turn Theory into Tangible Skills</h1>
              <p className="subtitle">Tackle real-world problems from every career domain. Build a portfolio that gets you hired.</p>
              <a href="#projects" className="btn btn-large btn-secondary">Browse Projects</a>
          </div>
        </header>

        <main>
          <section id="features" className="features-section">
              <div className="container">
                  <h2>The SkillForge Advantage</h2>
                  <div className="features-grid">
                      <div className="feature-card">
                          <h3>🚀 Real-World Problems</h3>
                          <p>Our projects are based on actual industry challenges, not just textbook examples.</p>
                      </div>
                      <div className="feature-card">
                          <h3>📁 Portfolio-Ready</h3>
                          <p>Every completed project is a polished piece for your portfolio, ready to impress recruiters.</p>
                      </div>
                      <div className="feature-card">
                          <h3>📚 Guided Learning</h3>
                          <p>Follow structured milestones to build complex projects step-by-step and never get lost.</p>
                      </div>
                  </div>
              </div>
          </section>

          <section id="projects" className="projects-section">
              <div className="container">
                  <h2>Weekly Project Drops</h2>
                  <div id="project-list-container">
                      {projects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Link href="/explore">
                      <a className="btn btn-primary">Explore More Projects</a>
                    </Link>
                  </div>
              </div>
          </section>

          <section className="testimonials-section">
            <div className="container">
                <h2>What Our Students Say</h2>
                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <p>"SkillForge gave me the confidence to apply for my first developer job."</p>
                        <div className="testimonial-author">- Uday Soni</div>
                    </div>
                </div>
            </div>
          </section>
        </main>

        <footer className="footer">
          <div className="container">
              <p>© 2024 SkillForge. All Rights Reserved.</p>
          </div>
        </footer>
      </div>

      {/* Example trigger button - you can remove this */}
      <button 
        onClick={() => setIsFrozen(!isFrozen)} 
        className="fixed bottom-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded"
      >
        {isFrozen ? 'Unfreeze Site' : 'Freeze Site'}
      </button>
    </>
  );
}

export async function getStaticProps() {
  const path = require('path');
  const fs = require('fs');
  const filePath = path.join(process.cwd(), 'public', 'projects.json');
  const jsonData = fs.readFileSync(filePath);
  const projects = JSON.parse(jsonData);
  return {
    props: {
      projects
    }
  }
}