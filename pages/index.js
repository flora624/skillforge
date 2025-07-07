import { useState } from 'react';
import Navbar from '../components/Navbar';
import ProjectModal from '../components/ProjectModal';

export default function Home({ projects }) {
  const [selectedProject, setSelectedProject] = useState(null);

  const openModal = (project) => {
    setSelectedProject(project);
  };

  const closeModal = () => {
    setSelectedProject(null);
  };

  return (
    <>
      <Navbar />
      {selectedProject && <ProjectModal project={selectedProject} onClose={closeModal} />}
      
      <header className="hero-section">
          <div className="container">
              <h1>Turn Theory into Tangible Skills</h1>
              <p className="subtitle">Tackle real-world problems sourced from the tech industry's biggest players. Build a portfolio that gets you hired.</p>
              <a href="#projects" className="btn btn-large btn-secondary">Browse Projects</a>
          </div>
      </header>

      <main>
          <section id="features" className="features-section">
              <div className="container">
                  <h2>The SkillForge Advantage</h2>
                  {/* --- UPDATED MARKETING TEXT --- */}
                  <div className="features-grid">
                      <div className="feature-card">
                          <i className="fas fa-industry"></i>
                          <h3>Industry-Sourced Problems</h3>
                          <p>Projects are inspired by real challenges from top company engineering blogs and case studies.</p>
                      </div>
                      <div className="feature-card">
                          <i className="fas fa-file-alt"></i>
                          <h3>Portfolio-Ready</h3>
                          <p>Every completed project is a polished piece for your portfolio, ready to impress recruiters.</p>
                      </div>
                      <div className="feature-card">
                          <i className="fas fa-rocket"></i>
                          <h3>Career-Focused Solutions</h3>
                          <p>Understand the 'why' behind solutions and get resume-ready text to showcase your work.</p>
                      </div>
                  </div>
              </div>
          </section>

          <section id="projects" className="projects-section">
              <div className="container">
                  <h2>Weekly Project Drops</h2>
                  <div id="project-list-container">
                      {projects.map(project => (
                          <div key={project.id} className="project-card" onClick={() => openModal(project)}>
                              <div className="card-content">
                                  <h3>{project.title}</h3>
                                  <div className="card-meta">
                                      <span><i className="fas fa-folder"></i> {project.domain}</span>
                                      <span className={`tag difficulty-${project.difficulty}`}>{project.difficulty}</span>
                                  </div>
                                  {project.problemStatement && (
                                      <p>{project.problemStatement.substring(0, 100)}...</p>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </section>

          <section className="testimonials-section">
            <div className="container">
                <h2>What Our Students Say</h2>
                 {/* --- UPDATED TESTIMONIALS --- */}
                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <p>"Solving a problem inspired by a Netflix tech blog post was a game-changer for my resume. It was the main talking point in my interviews."</p>
                        <div className="testimonial-author">- Sarah J., System Designer</div>
                    </div>
                    <div className="testimonial-card">
                        <p>"The Stripe-inspired checkout design project gave me a concrete UX portfolio piece that immediately demonstrated my skills to potential employers."</p>
                        <div className="testimonial-author">- Michael B., UX/UI Designer</div>
                    </div>
                     <div className="testimonial-card">
                        <p>"Instead of a generic project, I got to tackle a recommendation engine problem similar to Spotify's. This is an incredible learning experience."</p>
                        <div className="testimonial-author">- Chloe L., Aspiring Data Scientist</div>
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
    </>
  )
}

// This part stays the same, it correctly reads your projects.json file
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