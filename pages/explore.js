import { useState } from 'react';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import Link from 'next/link'; // Import Link

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
          {/* ... filter inputs ... */}
        </section>

        <section className="projects-section">
          <div id="project-list-container">
            {filteredProjects.length > 0 ? (
              filteredProjects.map(project => (
                // We wrap the ProjectCard in a Link here as well
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