import Navbar from '../components/Navbar';
import Link from 'next/link';
import ProjectCard from '../components/ProjectCard';

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
          {/* ...omitting for brevity... */}
      </header>

      <main>
          <section id="features" className="features-section">
              {/* ...omitting for brevity... */}
          </section>

          <section id="projects" className="projects-section">
              <div className="container">
                  <h2>Featured Projects</h2>
                  <div id="project-list-container">
                    {featuredProjects.map(project => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                  
                  {/* --- THIS IS THE CORRECTED LINK STRUCTURE --- */}
                  <div className="explore-button-container">
                    <Link href="/explore" passHref>
                      <div className="btn btn-primary btn-large">
                        Explore All Projects <i className="fas fa-arrow-right"></i>
                      </div>
                    </Link>
                  </div>

              </div>
          </section>

          <section className="testimonials-section">
             {/* ...omitting for brevity... */}
          </section>
      </main>

      <footer className="footer">
          {/* ...omitting for brevity... */}
      </footer>
    </>
  )
}