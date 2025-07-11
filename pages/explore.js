import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';

// Fetch all projects at build time, just like the homepage
export async function getStaticProps() {
  const path = require('path');
  const fs = require('fs');
  const filePath = path.join(process.cwd(), 'public', 'projects.json');
  const jsonData = fs.readFileSync(filePath);
  const projects = JSON.parse(jsonData);
  return { props: { projects } };
}

export default function ExplorePage({ projects }) {
  const router = useRouter();
  
  // State for our filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Dynamically get unique domains for the filter dropdown
  const domains = ['All', ...new Set(projects.map(p => p.domain))];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Filter logic
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = selectedDomain === 'All' || project.domain === selectedDomain;
    const matchesDifficulty = selectedDifficulty === 'All' || project.difficulty === selectedDifficulty;
    return matchesSearch && matchesDomain && matchesDifficulty;
  });

  const handleProjectClick = (projectId) => {
    router.push(`/project/${projectId}`);
  };

  return (
    <>
      <Navbar />
      <main className="container">
        <section className="explore-header">
          <h1>Explore All Projects</h1>
          <p>Find the perfect challenge to build your skills and expand your portfolio.</p>
        </section>

        <section className="filter-container">
          <div className="filter-group">
            <input 
              type="text" 
              placeholder="Search by project title..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="domain-filter">Domain</label>
            <select id="domain-filter" value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)}>
              {domains.map(domain => <option key={domain} value={domain}>{domain}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="difficulty-filter">Difficulty</label>
            <select id="difficulty-filter" value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
               {difficulties.map(diff => <option key={diff} value={diff}>{diff}</option>)}
            </select>
          </div>
        </section>

        <section className="projects-section">
          <div id="project-list-container">
            {filteredProjects.length > 0 ? (
              filteredProjects.map(project => (
                <div key={project.id} className="project-card" onClick={() => handleProjectClick(project.id)}>
                  <div className="card-content">
                    <h3>{project.title}</h3>
                    <div className="card-meta">
                      <span><i className="fas fa-folder"></i> {project.domain}</span>
                      <span className={`tag difficulty-${project.difficulty}`}>{project.difficulty}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-projects-message">No projects match your filters. Try a different search!</p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}