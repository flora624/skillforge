import { useRouter } from 'next/router';

export default function ProjectCard({ project }) {
  const router = useRouter();

  // --- THIS IS THE BULLETPROOF GATEKEEPER ---
  // If the project prop itself is missing or doesn't have an ID, render nothing.
  if (!project || !project.id) {
    // This console.log will only show up in the browser's console if bad data gets through.
    console.warn("ProjectCard received invalid project data, skipping render.", project);
    return null; 
  }

  const handleProjectClick = () => {
    // We also check here to prevent navigating to an undefined page.
    if (project && project.id) {
      router.push(`/project/${project.id}`);
    }
  };

  // --- DEFENSIVE RENDERING WITH FALLBACKS ---
  // We provide a default value for every single piece of data we use.
  const title = project.title || "Untitled Project";
  const problemStatement = project.problemStatement || "No description available.";
  const domain = project.domain || "N/A";
  const difficulty = project.difficulty || "Beginner";
  // --- END OF DEFENSIVE RENDERING ---

  return (
    <div className="project-card" onClick={handleProjectClick}>
      <div className="card-content">
        <h3>{title}</h3>
        
        {/* We use the safe 'problemStatement' variable here */}
        <p>{problemStatement.substring(0, 100)}...</p>
        
        <div className="card-meta">
            <span><i className="fas fa-folder"></i> {domain}</span>
            <span className={`tag difficulty-${difficulty}`}>{difficulty}</span>
        </div>
      </div>
    </div>
  );
}