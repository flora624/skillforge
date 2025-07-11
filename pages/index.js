// This function will read the real project file.
export async function getStaticProps() {
  console.log(">> STEP 1: Starting getStaticProps.");
  const path = require('path');
  const fs = require('fs');
  const filePath = path.join(process.cwd(), 'public', 'projects.json');

  try {
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const projects = JSON.parse(jsonData) || [];
    console.log(`>> STEP 1: Successfully read and parsed ${projects.length} projects.`);
    return { props: { projects } };
  } catch (error) {
    console.error(">> STEP 1 ERROR:", error);
    return { props: { projects: [] } };
  }
}

// This is the simplest possible component to display the result.
export default function Home({ projects }) {
  console.log(">> STEP 1: Home component received props. Project count:", projects ? projects.length : "undefined");

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Step 1: Baseline Test</h1>
      <p>This page tests if the application can successfully read and parse `projects.json` during the build.</p>
      <hr />
      <h2>Data Check:</h2>
      {projects && Array.isArray(projects) && projects.length > 0 ? (
        <p style={{ color: 'green', fontWeight: 'bold' }}>
          SUCCESS: Deployed and successfully received {projects.length} projects from the JSON file.
        </p>
      ) : (
        <p style={{ color: 'red', fontWeight: 'bold' }}>
          FAILURE: Could not load projects from JSON file. Check build logs.
        </p>
      )}
    </div>
  );
}