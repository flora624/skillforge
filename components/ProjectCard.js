// This is the new, simpler, and more stable version.
// It is only responsible for DISPLAYING data, not for navigation.

export default function ProjectCard({ project }) {
  // Gatekeeper check
  if (!project || !project.id) {
    return null;
  }

  // Defensive variables
  const title = project.title || "Untitled Project";
  const problemStatement = project.problemStatement || "No description available.";
  const domain = project.domain || "N/A";
  const difficulty = project.difficulty || "Beginner";

  return (
    // We remove the Link and onClick from here.
    // The card itself is now just a plain div.
    <div className="project-card">
      <div className="card-content">
        <h3>{title}</h3>
        <p>{problemStatement.substring(0, 100)}...</p>
        <div className="card-meta">
          <span><i className="fas fa-folder"></i> {domain}</span>
          <span className={`tag difficulty-${difficulty}`}>{difficulty}</span>
        </div>
      </div>
    </div>
  );
}