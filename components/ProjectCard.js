import { useRouter } from 'next/router';

export default function ProjectCard({ project }) {
  const router = useRouter();
  if (!project || !project.id) { return null; }
  const handleProjectClick = () => { router.push(`/project/${project.id}`); };

  const title = project.title || "Untitled Project";
  const problemStatement = project.problemStatement || "No description available.";
  const domain = project.domain || "N/A";
  const difficulty = project.difficulty || "Beginner";

  return (
    <div className="project-card" onClick={handleProjectClick}>
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