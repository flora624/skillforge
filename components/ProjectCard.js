import { useRouter } from 'next/router';

export default function ProjectCard({ project }) {
  const router = useRouter();

  // This is the "gatekeeper". If the project data is bad, render nothing.
  if (!project || !project.id) {
    return null;
  }

  const handleProjectClick = () => {
    router.push(`/project/${project.id}`);
  };

  return (
    <div className="project-card" onClick={handleProjectClick}>
      <div className="card-content">
        <h3>{project.title || "Untitled Project"}</h3>
        
        {project.problemStatement && (
            <p>{project.problemStatement.substring(0, 100)}...</p>
        )}
        
        <div className="card-meta">
            <span><i className="fas fa-folder"></i> {project.domain || "N/A"}</span>
            <span className={`tag difficulty-${project.difficulty || 'Beginner'}`}>{project.difficulty || "Beginner"}</span>
        </div>
      </div>
    </div>
  );
}