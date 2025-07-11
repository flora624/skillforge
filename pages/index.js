import Navbar from '../components/Navbar'; // We are adding this back
import Link from 'next/link';

// This function is confirmed to be working.
export async function getStaticProps() {
  console.log(">> STEP 2: getStaticProps is running.");
  const path = require('path');
  const fs = require('fs');
  const filePath = path.join(process.cwd(), 'public', 'projects.json');
  try {
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const projects = JSON.parse(jsonData) || [];
    console.log(`>> STEP 2: Successfully read and parsed ${projects.length} projects.`);
    return { props: { projects } };
  } catch (error) {
    console.error(">> STEP 2 ERROR:", error);
    return { props: { projects: [] } };
  }
}

export default function Home({ projects }) {
  console.log(">> STEP 2: Home component received props. Project count:", projects ? projects.length : "undefined");

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
                  
                  {/* We are NOT rendering the project cards yet. Just a placeholder. */}
                  <div style={{ padding: '20px', border: '2px dashed #ccc', textAlign: 'center' }}>
                    <p style={{ color: 'green', fontWeight: 'bold' }}>Step 2 Test: Page layout and Navbar rendered successfully.</p>
                    <p>Next step is to render the project cards here.</p>
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