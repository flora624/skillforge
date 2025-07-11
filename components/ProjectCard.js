import Link from 'next/link';

export default function ProjectCard({ project }) {
  // Defensive checks to prevent any crashes from bad data
  if (!project || !project.id) {
    return null; // Render nothing if the project data is invalid
  }

  // Provide default fallbacks for every piece of data
  const title = project.title || "Untitled Project";
  const domain = project.domain || "N/A";
  const difficulty = project.difficulty || "Beginner";
  const problemStatement = project.problemStatement || "No description available.";
  const skillsGained = project.skillsGained || [];

  return (
    // The Link component MUST have an `href` and should wrap the entire card
    <Link href={`/project/${project.id}`} legacyBehavior>
      <a className="project-card">
        <div className="card-content">
          <h3>{title}</h3>
          <p>{problemStatement.substring(0, 100)}...</p>
          <div className="skills-gained-preview">
            <strong>Skills:</strong> {skillsGained.slice(0, 3).join(', ')}...
          </div>
          <div className="card-meta">
            <span><i className="fas fa-folder"></i> {domain}</span>
            <span className={`tag difficulty-${difficulty}`}>{difficulty}</span>
          </div>
        </div>
      </a>
    </Link>
  );
}