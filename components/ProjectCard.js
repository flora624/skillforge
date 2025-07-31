import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';

function getDomainIcon(domain) {
  const iconMap = {
    'Web Development': 'code',
    'Data Science': 'chart-bar',
    'Mobile Development': 'mobile-alt',
    'Machine Learning': 'brain',
    'DevOps': 'server',
    'Cybersecurity': 'shield-alt',
    'Game Development': 'gamepad',
    'Blockchain': 'link',
    'UI/UX Design': 'palette',
    'API Development': 'plug',
    'Cloud Computing': 'cloud',
    'Artificial Intelligence': 'robot'
  };
  return iconMap[domain] || 'code';
}

function getEstimatedDuration(difficulty) {
  const durationMap = {
    'Beginner': '8-12 hours',
    'Intermediate': '15-25 hours',
    'Advanced': '25-40 hours'
  };
  return durationMap[difficulty] || '10-15 hours';
}

export default function EnhancedProjectCard({ project, actionButtons }) {
  const { user } = useAuth();

  const handleMarkAsComplete = async () => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        completedProjects: arrayUnion(project.id)
      });
      alert('Project marked as complete!');
    } else {
      alert('You must be logged in to mark a project as complete.');
    }
  };

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
  const estimatedHours = project.estimatedHours || getEstimatedDuration(difficulty);

  return (
    <Link href={`/project/${project.id}`} legacyBehavior>
      <a className="project-card hover-lift">
        <div className="difficulty-badge difficulty-${difficulty.toLowerCase()}">
          {difficulty}
        </div>
        <div className="card-content">
          <div className="project-icon">
            <i className={`fas fa-${getDomainIcon(domain)}`}></i>
          </div>
          <h3>{title}</h3>
          <div className="card-meta">
            <span className="domain-tag">
              <i className="fas fa-folder"></i>
              {domain}
            </span>
            <span className="duration-tag">
              <i className="fas fa-clock"></i>
              {typeof estimatedHours === 'number' ? `${estimatedHours}h` : estimatedHours}
            </span>
          </div>
          <p className="project-description">{problemStatement.substring(0, 120)}...</p>
          <div className="skills-gained-preview">
            <h4><i className="fas fa-hammer"></i> Skills You'll Build:</h4>
            <ul className="skills-list">
              {skillsGained.slice(0, 3).map((skill, index) => (
                <li key={index}>
                  <i className="fas fa-check-circle"></i>
                  {skill}
                </li>
              ))}
              {skillsGained.length > 3 && (
                <li className="more-skills">+{skillsGained.length - 3} more</li>
              )}
            </ul>
          </div>
          <div className="card-footer">
            <div className="project-stats">
              <span className="difficulty-indicator">
                <i className="fas fa-signal"></i>
                {difficulty}
              </span>
              <span className="portfolio-ready">
                <i className="fas fa-star"></i>
                Portfolio Ready
              </span>
            </div>
            {actionButtons && Array.isArray(actionButtons) && actionButtons.length > 0 ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                {actionButtons.map((btn, idx) => (
                  <button
                    key={idx}
                    className={`btn ${btn.className || ''}`}
                    onClick={e => {
                      e.preventDefault();
                      if (btn.onClick) btn.onClick();
                    }}
                  >
                    {btn.icon && <i className={`fas fa-${btn.icon}`}></i>} {btn.label}
                  </button>
                ))}
              </div>
            ) : (
              <button className="btn btn-primary">
                <i className="fas fa-play"></i>
                Start Building
              </button>
            )}
          </div>
        </div> 
      </a>
    </Link>
  );
}