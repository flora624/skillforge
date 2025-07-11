import Link from 'next/link';
import Navbar from '../components/Navbar';

// This is the component for a single project card
// It now correctly links to the dynamic project workspace page
function ProjectCard({ project }) {
  return (
    <Link href={`/project/${project.id}`} className="project-card-link">
      <div className="project-card">
        <div className="card-content">
            <h3>{project.title}</h3>
            <div className="card-meta">
                {/* Font Awesome icons might not work if you removed the script, so we use text/emoji */}
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


// This is the main Homepage component
export default function Home({ projects }) {
  return (
    <>
      <Navbar />
      
      {/* --- HERO SECTION (RESTORED) --- */}
      <header className="hero-section">
          <div className="container">
              <h1>Turn Theory into Tangible Skills</h1>
              <p className="subtitle">Tackle real-world problems from every career domain. Build a portfolio that gets you hired.</p>
              <a href="#projects" className="btn btn-large btn-secondary">Browse Projects</a>
          </div>
      </header>

      <main>
          {/* --- FEATURES/PERKS SECTION (RESTORED) --- */}
          <section id="features" className="features-section">
              <div className="container">
                  <h2>The SkillForge Advantage</h2>
                  <div className="features-grid">
                      <div className="feature-card">
                          <h3><i className="fas fa-briefcase"></i> Real-World Problems</h3>
                          <p>Our projects are based on actual industry challenges, not just textbook examples.</p>
                      </div>
                      <div className="feature-card">
                          <h3><i className="fas fa-file-alt"></i> Portfolio-Ready</h3>
                          <p>Every completed project is a polished piece for your portfolio, ready to impress recruiters.</p>
                      </div>
                      <div className="feature-card">
                          <h3><i className="fas fa-rocket"></i> Guided Learning</h3>
                          <p>Follow structured milestones to build complex projects step-by-step and never get lost.</p>
                      </div>
                  </div>
              </div>
          </section>

          {/* --- PROJECTS SECTION (AS BEFORE) --- */}
          <section id="projects" className="projects-section">
              <div className="container">
                  <h2>Weekly Project Drops</h2>
                  <div id="project-list-container">
                      {projects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                   </div>

    {/* -- Explore More Projects Button -- */}
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <Link href="/explore">
        <a className="btn btn-primary">Explore More Projects</a>
      </Link>
    </div>
  </div>
</section>

          {/* --- TESTIMONIALS/REVIEWS SECTION (RESTORED) --- */}
          <section className="testimonials-section">
            <div className="container">
                <h2>What Our Students Say</h2>
                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <p>"SkillForge gave me the confidence to apply for my first developer job. The milestone-based project was the centerpiece of my portfolio."</p>
                        <div className="testimonial-author">- Uday Soni, Frontend Developer</div>
                    </div>
                    <div className="testimonial-card">
                        <p>"As a marketing student, the content strategy project was invaluable. It helped me talk intelligently about real-world execution in my interviews."</p>
                        <div className="testimonial-author">- Abhay Yadav, Marketing Coordinator</div>
                    </div>
                     <div className="testimonial-card">
                        <p>"I finally understood what 'data analysis' actually meant after completing the milestones. It's so much better than just getting the final solution."</p>
                        <div className="testimonial-author">- Aryan Soni, Aspiring Data Analyst</div>
                    </div>
                </div>
            </div>
        </section>
      </main>

      {/* --- FOOTER (RESTORED) --- */}
      <footer className="footer">
          <div className="container">
              <p>© 2024 SkillForge. All Rights Reserved.</p>
          </div>
      </footer>
    </>
  )
}

// This server-side part remains the same
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