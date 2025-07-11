import Link from 'next/link';

export default function ProjectCard({ project }) {
  if (!project || !project.id) {
    return null;
  }

  const title = project.title || "Untitled Project";
  const problemStatement = project.problemStatement || "No description available.";
  const domain = project.domain || "N/A";
  const difficulty = project.difficulty || "Beginner";

  return (
    // We wrap the entire card content in a Link component
    <Link href={`/project/${project.id}`} passHref>
        <div className="project-card">
          <div className="card-content">
            <h3>{title}</h3>
            <p>{problemStatement.substring(0, 100)}...</p>
            <div className="card-meta">
                <span><i className="fas fa-folder"></i> {domain}</span>
                <span className={`tag difficulty-${project.difficulty}`}>{difficulty}</span>
            </div>
          </div>
        </div>
    </Link>
  );
}