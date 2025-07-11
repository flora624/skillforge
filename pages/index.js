import Navbar from '../components/Navbar';
import Link from 'next/link';
import ProjectCard from '../components/ProjectCard'; // <-- IMPORT THE NEW COMPONENT

// This function remains the same
export async function getStaticProps() {
  const path = require('path');
  const fs = require('fs');
  const filePath = path.join(process.cwd(), 'public', 'projects.json');
  const jsonData = fs.readFileSync(filePath, 'utf8');
  const projects = JSON.parse(jsonData) || [];
  return { props: { projects } };
}

export default function Home({ projects }) {
  const featuredProjects = Array.isArray(projects) ? projects.slice(0, 3) : [];

  return (
    <>
      <Navbar />
      
      <header className="hero-section">
          <div className="container">
              <h1>Turn Theory into Tangible Skills</h1>
              <p className="subtitle">Tackle real-world problems inspired by top tech companies. Build a portfolio that gets you hired.</p>
              <a href="#projects" className="btn btn-large btn-secondary">Browse Featured Projects</a>
          </div>
      </header>

      <main>
          <section id="features" className="features-section">
              <div className="container">
                  <h2>The SkillForge Advantage</h2>
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
                          <p>Get pre-written resume points and showcase your work to accelerate your job search.</p>
                      </div>
                  </div>
              </div>
          </section>

          <section id="projects" className="projects-section">
              <div className="container">
                  <h2>Featured Projects</h2>
                  <div id="project-list-container">
                    {/* --- THIS IS THE NEW, SIMPLIFIED MAPPING LOGIC --- */}
                    {featuredProjects.map(project => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                  
                  <div className="explore-button-container">
                    <Link href="/explore" className="btn btn-primary btn-large">
                      Explore All Projects <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
              </div>
          </section>

          <section className="testimonials-section">
            <div className="container">
                <h2>What Our Students Say</h2>
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