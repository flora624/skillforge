// This function hardcodes data to eliminate all external variables.
export async function getStaticProps() {
  console.log(">> CRASH TEST: Running getStaticProps.");
  const projects = [
    { id: 1, title: "Test Project 1" },
    { id: 2, title: "Test Project 2" },
    { id: 3, title: "Test Project 3" }
  ];

  return {
    props: {
      projects,
    },
  };
}


// This is the simplest possible component that uses the 'projects' prop.
export default function Home({ projects }) {
  // This log will tell us if the component received the props.
  console.log(">> CRASH TEST: Home component received props:", projects);

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Crash Test Page</h1>
      <p>This page is a minimal test to ensure the application can build and deploy.</p>
      <hr />
      <h2>Data Check:</h2>
      {projects && Array.isArray(projects) ? (
        <p style={{ color: 'green', fontWeight: 'bold' }}>
          Successfully received {projects.length} projects.
        </p>
      ) : (
        <p style={{ color: 'red', fontWeight: 'bold' }}>
          FAILED to receive project data. The 'projects' prop is undefined or not an array.
        </p>
      )}
    </div>
  );
}