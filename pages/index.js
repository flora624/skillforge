import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

// --- THE CORRECTED ProjectCard Component ---
function ProjectCard({ project }) {
  const router = useRouter();
  const { user } = useAuth();

  // Safety check for project object
  if (!project) {
    return null;
  }

  const handleStartClick = (e) => {
    e.preventDefault();
    if (user) {
      router.push(`/project/${project.id}`);
    } else {
      router.push('/login');
    }
  };

  // --- THIS IS THE FIX ---
  // We define 'hasSkills' right here inside the component.
  // It checks if 'skillsGained' exists and is a non-empty array.
  const hasSkills = Array.isArray(project.skillsGained) && project.skillsGained.length > 0;

  return (
    <Link href={`/project/${project.id}`} className="project-card-link">
      <div className="project-card hover-lift">
        <div className={`difficulty-badge difficulty-${project.difficulty.toLowerCase()}`}>
          {project.difficulty}
        </div>
        <div className="card-content">
          <div className="project-icon">
            <i className={`fas fa-${getDomainIcon(project.domain)}`}></i>
          </div>
          <h3>{project.title}</h3>
          <div className="card-meta">
            <span className="domain-tag"><i className="fas fa-folder"></i>{project.domain}</span>
            <span className="duration-tag"><i className="fas fa-clock"></i>{project.estimatedHours}h</span>
          </div>
          <p className="project-description">{project.problemStatement.substring(0, 120)}...</p>
          
          {/* --- It now correctly uses the 'hasSkills' variable --- */}
          {hasSkills && (
            <div className="skills-gained-preview">
              <h4><i className="fas fa-hammer"></i> Skills You'll Build:</h4>
              <ul className="skills-list">
                {project.skillsGained.slice(0, 3).map((skill, index) => (
                  <li key={index}><i className="fas fa-check-circle"></i>{skill}</li>
                ))}
                {project.skillsGained.length > 3 && (
                  <li className="more-skills">+{project.skillsGained.length - 3} more</li>
                )}
              </ul>
            </div>
          )}
          
          <div className="card-footer">
            <button className="btn btn-primary" onClick={handleStartClick}>
              <i className="fas fa-play"></i>
              Start Building
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

function getDomainIcon(domain) {
  const iconMap = {
    'Web Development': 'code', 'Data Science': 'chart-bar', 'Mobile Development': 'mobile-alt',
    'Machine Learning': 'brain', 'DevOps': 'server', 'Cybersecurity': 'shield-alt',
    'Game Development': 'gamepad', 'Blockchain': 'link', 'UI/UX Design': 'palette', 'API Development': 'plug'
  };
  return iconMap[domain] || 'code';
}

import Head from 'next/head';

export default function Home({ projects = [] }) {
  const [filterDomain, setFilterDomain] = useState('all');
  const featuredProjects = projects.slice(0, 3);
  
  // This useEffect is for the floating background elements and can be kept as is.
  useEffect(() => {
    const createFloatingElements = () => {
      const existingBg = document.querySelector('.floating-background');
      if (existingBg) existingBg.remove();
      const floatingBg = document.createElement('div');
      floatingBg.className = 'floating-background';
      for (let i = 1; i <= 8; i++) {
        const circle = document.createElement('div');
        circle.className = `floating-circle circle-${i}`;
        floatingBg.appendChild(circle);
      }
      document.body.appendChild(floatingBg);
    };
    createFloatingElements();
    return () => {
      const floatingBg = document.querySelector('.floating-background');
      if (floatingBg) floatingBg.remove();
    };
  }, []);

  const filteredProjects = filterDomain === 'all' 
    ? featuredProjects 
    : featuredProjects.filter(project => project && project.domain === filterDomain);

  const uniqueDomains = [...new Set(featuredProjects?.map(p => p?.domain).filter(Boolean) || [])];

  return (
    <>
      <Head>
        <title>SkillForge | Build Real-World Tech Skills</title>
        <meta name="description" content="SkillForge helps you turn theory into real-world skills with hands-on projects. Build your portfolio, get hired, and join a thriving tech community." />
        <meta property="og:title" content="SkillForge | Build Real-World Tech Skills" />
        <meta property="og:description" content="SkillForge helps you turn theory into real-world skills with hands-on projects. Build your portfolio, get hired, and join a thriving tech community." />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://skillforgeprojects.vercel.app" />
        <link rel="icon" href="/favicon.ico" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "SkillForgeProjects",
            "url": "https://skillforgeprojects.vercel.app",
            "logo": "https://skillforgeprojects.vercel.app/logo.png"
          })
        }} />
      </Head>
        <Navbar />
        <header className="hero-section">
          <div className="container hero-content">
              <h1>Turn Theory into Tangible Skills</h1>
              <p className="subtitle">Tackle real-world problems from every career domain. Build a portfolio that gets you hired.</p>
              <div className="hero-buttons">
                <a href="#projects" className="btn btn-primary btn-large float-cta float-advantage"><i className="fas fa-rocket"></i>Start Building</a>
                <a href="#features" className="btn btn-outline btn-large float-advantage"><i className="fas fa-play"></i>See Advantages
                </a>
              </div>
              <div className="hero-stats">
                <div className="stat-item"><span className="stat-number">500+</span><span className="stat-label">Real Projects</span></div>
                <div className="stat-item"><span className="stat-number">25k+</span><span className="stat-label">Builders</span></div>
                <div className="stat-item"><span className="stat-number">95%</span><span className="stat-label">Hire Rate</span></div>
              </div>
          </div>
        </header>
        <main>
          <section id="features" className="features-section">
            <div className="container">
              <h2>The SkillForge Advantage</h2>
              <div className="features-grid">
                <div className="feature-card hover-glow"><i className="fas fa-rocket float-advantage"></i><h3>Real-World Problems</h3><p>Our projects are based on actual industry challenges, not just textbook examples. Build solutions that matter.</p></div>
                <div className="feature-card hover-glow"><i className="fas fa-briefcase float-advantage"></i><h3>Portfolio-Ready</h3><p>Every completed project is a polished piece for your portfolio, ready to impress recruiters and hiring managers.</p></div>
                <div className="feature-card hover-glow"><i className="fas fa-users float-advantage"></i><h3>Community Driven</h3><p>Join thousands of builders, get feedback, collaborate, and grow together in our supportive community.</p></div>
                <div className="feature-card hover-glow"><i className="fas fa-chart-line float-advantage"></i><h3>Skills That Pay</h3><p>Focus on in-demand skills with clear career paths. Our data shows 95% of active builders get hired.</p></div>
                <div className="feature-card hover-glow"><i className="fas fa-clock float-advantage"></i><h3>Weekly Drops</h3><p>New projects released every week, keeping you engaged with fresh challenges across different domains.</p></div>
                <div className="feature-card hover-glow"><i className="fas fa-award float-advantage"></i><h3>Industry Recognition</h3><p>Projects designed with input from industry professionals. Build what companies actually need.</p></div>
              </div>
            </div>
          </section>
          <section id="projects" className="projects-section">
            <div className="container">
              <h2>Project Drops</h2>
              <p className="section-subtitle">Real challenges from real companies. Build your portfolio while solving actual problems.</p>
              <div className="projects-filter">
                <button className={`filter-btn ${filterDomain === 'all' ? 'active' : ''}`} onClick={() => setFilterDomain('all')}>All Featured</button>
                {uniqueDomains.map(domain => (
                  <button key={domain} className={`filter-btn ${filterDomain === domain ? 'active' : ''}`} onClick={() => setFilterDomain(domain)}>{domain}</button>
                ))}
              </div>
              <div className="projects-grid">
                {filteredProjects.map((project, index) => (
                  <div key={project.id} className="project-wrapper" style={{animationDelay: `${index * 0.1}s`}}>
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
              <div className="btn btn-primary9 btn-small">
                <Link href="/explore"><a><div>Explore More Projects</div></a></Link>
              </div>
            </div>
          </section>
          <section className="community-section">
            <div className="container">
              <h2>Explore Community</h2>
              <p className="section-subtitle">Connect with fellow Students, share your projects, and grow together.</p>
              <div className="community-stats">
                <div className="stat-card"><i className="fas fa-users"></i><h3>25,000+</h3><p>Active Students</p></div>
                <div className="stat-card"><i className="fas fa-project-diagram"></i><h3>50,000+</h3><p>Projects Built</p></div>
                <div className="stat-card"><i className="fas fa-handshake"></i><h3>95%</h3><p>Success Rate</p></div>
              </div>
              <div className="cta-section">
                <h3>Ready to Build Your Future?</h3>
                <p>Join thousands of Students who've transformed their careers through hands-on project experience.</p>
                <div className="cta-buttons">
                  <Link href="/signup"><a><span>Join</span><i className="icon" /></a></Link>
                  <Link href="/community"><a><span>Explore Community</span><i className="icon" /></a></Link>
                </div>
              </div>
            </div>
          </section>
        </main>
        <footer className="footer-section">
          <div className="container">
            <div className="footer-content">
              <div className="footer-brand"><h3>SkillForge</h3><p>Building the future, one project at a time.</p></div>
              <div className="footer-links">
                <div className="link-group"><h4>Platform</h4><Link href="/projects">Projects</Link><Link href="/domains">Domains</Link><Link href="/community">Community</Link></div>
                <div className="link-group"><h4>Resources</h4><Link href="/docs">Documentation</Link><Link href="/blog">Blog</Link><Link href="/help">Help Center</Link></div>
                <div className="link-group"><h4>Company</h4><Link href="/about">About</Link><Link href="/careers">Careers</Link><Link href="/contact">Contact</Link></div>
              </div>
            </div>
            <div className="footer-bottom"><p>© 2024 SkillForge. All rights reserved.</p></div>
          </div>
        </footer>
    </>
  );
}

// This is now correct and pulls data from projects.json
export async function getStaticProps() {
  try {
    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(process.cwd(), 'public', 'projects.json');
    
    if (!fs.existsSync(filePath)) {
      console.warn('projects.json file not found');
      return {
        props: {
          projects: [],
        },
      };
    }
    
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const projects = JSON.parse(jsonData) || [];

    return {
      props: {
        projects,
      },
    };
  } catch (error) {
    console.error('Error loading projects:', error);
    return {
      props: {
        projects: [],
      },
    };
  }
}
