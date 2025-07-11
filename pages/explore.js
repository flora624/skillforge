import { useState } from 'react';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import Link from 'next/link';

export async function getStaticProps() {
  const path = require('path');
  const fs = require('fs');
  const filePath = path.join(process.cwd(), 'public', 'projects.json');
  const jsonData = fs.readFileSync(filePath, 'utf8');
  const projects = JSON.parse(jsonData) || [];
  return { props: { projects } };
}

export default function ExplorePage({ projects }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const safeProjects = Array.isArray(projects) ? projects : [];

  const domains = ['All', ...new Set(safeProjects.map(p => p.domain).filter(Boolean))];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredProjects = safeProjects.filter(project => {
    if (!project || !project.title) return false;
    const title = project.title || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = selectedDomain === 'All' || project.domain === selectedDomain;
    const matchesDifficulty = selectedDifficulty === 'All' || project.difficulty === selectedDifficulty;
    return matchesSearch && matchesDomain && matchesDifficulty;
  });

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
                <Link key={project.id} href={`/project/${project.id}`} passHref>
                  <ProjectCard project={project} />
                </Link>
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