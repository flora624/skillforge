// pages/explore.js
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import fs from 'fs';
import path from 'path';

export default function Explore({ projects }) {
  return (
    <>
      <Navbar />
      <main className="container">
        <h1>Explore All Projects</h1>
        <div className="project-list">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </main>
    </>
  );
}

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'public', 'projects.json');
  const jsonData = fs.readFileSync(filePath);
  const projects = JSON.parse(jsonData);
  return { props: { projects } };
}
