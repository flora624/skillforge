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
                          <i className="fas fa-briefcase"></i>
                          <h3>Real-World Problems</h3>
                          <p>Our AI curates projects based on actual industry challenges, not just textbook examples.</p>
                      </div>
                      <div className="feature-card">
                          <i className="fas fa-file-alt"></i>
                          <h3>Portfolio-Ready</h3>
                          <p>Every completed project is a polished piece for your portfolio, ready to impress recruiters.</p>
                      </div>
                      <div className="feature-card">
                          <i className="fas fa-rocket"></i>
                          <h3>Career Focused</h3>
                          <p>Get pre-written resume points and showcase your work to accelerate your job search.</p>
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
                              <p>{project.problemStatement.substring(0, 100)}...</p>
                            </div>
                        </div>
                      ))}
                  </div>
              </div>
          </section>

          <section className="testimonials-section">
            <div className="container">
                <h2>What Our Students Say</h2>
                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <p>"SkillForge gave me the confidence to apply for my first developer job. The landing page project was the centerpiece of my portfolio."</p>
                        <div className="testimonial-author">- Sarah J., Frontend Developer</div>
                    </div>
                    <div className="testimonial-card">
                        <p>"As a marketing student, the content strategy project was invaluable. It helped me talk intelligently about real-world execution in my interviews."</p>
                        <div className="testimonial-author">- Michael B., Marketing Coordinator</div>
                    </div>
                     <div className="testimonial-card">
                        <p>"I finally understood what 'data analysis' actually meant after completing the churn project. Seeing the solution helped connect all the dots."</p>
                        <div className="testimonial-author">- Chloe L., Aspiring Data Analyst</div>
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