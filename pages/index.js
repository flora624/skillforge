import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Link from 'next/link';

// --- THIS IS THE DIAGNOSTIC VERSION ---
export async function getStaticProps() {
  console.log(">> DIAGNOSTIC LOG: Starting getStaticProps...");
  const path = require('path');
  const fs = require('fs');
  
  const filePath = path.join(process.cwd(), 'public', 'projects.json');
  console.log(">> DIAGNOSTIC LOG: Attempting to read file from path:", filePath);

  try {
    const jsonData = fs.readFileSync(filePath, 'utf8');
    console.log(">> DIAGNOSTIC LOG: File read successfully.");
    
    const projects = JSON.parse(jsonData);
    console.log(">> DIAGNOSTIC LOG: JSON parsed successfully. Number of projects found:", projects.length);

    return {
      props: {
        projects
      }
    };
  } catch (error) {
    console.error(">> DIAGNOSTIC ERROR in getStaticProps:", error);
    // If there's an error, we return an empty array to prevent a crash
    return {
      props: {
        projects: []
      }
    };
  }
}

export default function Home({ projects }) {
  // This log will tell us what props the component actually receives
  console.log(">> DIAGNOSTIC LOG: Props received by Home component:", projects ? `Array with ${projects.length} items` : "undefined");

  const router = useRouter();

  const handleProjectClick = (projectId) => {
    router.push(`/project/${projectId}`);
  };
  
  const featuredProjects = Array.isArray(projects) ? projects.slice(0, 3) : [];

  return (
    <>
      <Navbar />
      
      <header className="hero-section">
          <h1>Turn Theory into Tangible Skills</h1>
          <p>This is a debug page. The content below is a test.</p>
      </header>

      <main>
          <section id="projects" className="projects-section">
              <div className="container">
                  <h2>Featured Projects (Debug View)</h2>
                  <div id="project-list-container">
                    {featuredProjects.length > 0 ? featuredProjects.map(project => {
                      if (!project || !project.id) {
                        console.log(">> DIAGNOSTIC LOG: Skipping a malformed project entry.");
                        return null;
                      }

                      return (
                        <div key={project.id} className="project-card" onClick={() => handleProjectClick(project.id)}>
                            <div className="card-content">
                                <h3>{project.title || "Untitled Project"}</h3>
                                {project.problemStatement && (
                                    <p>{project.problemStatement.substring(0, 100)}...</p>
                                )}
                                <div className="card-meta">
                                    <span><i className="fas fa-folder"></i> {project.domain || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                      );
                    }) : <p>No projects to display. Check build logs.</p>}
                  </div>
              </div>
          </section>
      </main>
    </>
  )
}