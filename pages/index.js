import Navbar from '../components/Navbar';
import Link from 'next/link';
import ProjectCard from '../components/ProjectCard'; // We need this component

// This function is confirmed to be working.
export async function getStaticProps() {
  console.log(">> STEP 3: getStaticProps is running.");
  const path = require('path');
  const fs = require('fs');
  const filePath = path.join(process.cwd(), 'public', 'projects.json');
  try {
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const projects = JSON.parse(jsonData) || [];
    console.log(`>> STEP 3: Successfully read and parsed ${projects.length} projects.`);
    return { props: { projects } };
  } catch (error) {
    console.error(">> STEP 3 ERROR:", error);
    return { props: { projects: [] } };
  }
}

export default function Home({ projects }) {
  console.log(">> STEP 3: Home component received props. Project count:", projects ? projects.length : "undefined");
  
  // This defensive check is important.
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
          <section id="projects" className="projects-section">
              <div className="container">
                  <h2>Featured Projects</h2>
                  
                  {/* --- This is the block we are testing now --- */}
                  <div id="project-list-container">
                    {featuredProjects.map(project => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                  
                  {/* Adding the explore button back */}
                  <div className="explore-button-container">
                    <Link href="/explore" className="btn btn-primary btn-large">
                      Explore All Projects <i className="fas fa-arrow-right"></i>
                    </Link>
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