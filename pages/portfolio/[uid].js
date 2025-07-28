import { useState } from 'react';
import { db } from '../../firebase/config';
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from '../../components/Navbar';

// Server-side data fetching
export async function getServerSideProps(context) {
  const { uid } = context.params;
  if (!uid) return { notFound: true };

  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    const userProfile = userDocSnap.exists() ? userDocSnap.data() : null;

    const projectsFilePath = path.join(process.cwd(), 'public', 'projects.json');
    const jsonData = await fs.readFile(projectsFilePath, 'utf8');
    const allProjects = JSON.parse(jsonData);

    const q = query(collection(db, 'userProgress'), where('userId', '==', uid), where('isCompleted', '==', true));
    const querySnapshot = await getDocs(q);

    const completedProjects = [];
    querySnapshot.forEach(doc => {
      const progressData = doc.data();
      const projectDetails = allProjects.find(p => p.id === progressData.projectId);
      
      if (projectDetails) {
        const serializableProject = {
            userId: progressData.userId,
            projectId: progressData.projectId,
            isCompleted: progressData.isCompleted,
            submissionUrl: progressData.submissionUrl || null,
            project: projectDetails,
            completedAt: progressData.completedAt ? progressData.completedAt.toDate().toISOString() : null,
            startedAt: progressData.startedAt ? progressData.startedAt.toDate().toISOString() : null,
            lastUpdated: progressData.lastUpdated ? progressData.lastUpdated.toDate().toISOString() : null,
            screenshots: progressData.screenshots || null,
        };
        completedProjects.push(serializableProject);
      }
    });

    return { 
        props: { 
            userProfile, 
            completedProjects 
        } 
    };
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return { props: { error: "Failed to load portfolio." } };
  }
}

// Main Portfolio Page Component
export default function SawadStylePortfolio({ userProfile, completedProjects, error }) {
    if (error) {
        return (
            <div className="error-container">
                <h1>Error</h1>
                <p>{error}</p>
            </div>
        );
    }

    const displayName = userProfile?.displayName || 'Developer';
    const bio = userProfile?.bio || 'A Software Engineer who has developed countless innovative solutions.';
    const projectCount = completedProjects.length;
    const experienceYears = Math.max(1, Math.floor(projectCount / 4)); // Estimate years based on projects

    return (
        <>
            <Head>
                <title>{displayName} | Portfolio</title>
                <meta name="description" content={`Personal portfolio of ${displayName}. ${bio}`} />
                <meta property="og:title" content={`${displayName} | Portfolio`} />
                <meta property="og:description" content={`Personal portfolio of ${displayName}. ${bio}`} />
                <meta property="og:type" content="website" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            
            {/* Main Website Navigation */}
            <Navbar />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="profile-image">
                        {userProfile?.photoURL ? (
                            <img src={userProfile.photoURL} alt={displayName} />
                        ) : (
                            <div className="default-avatar">
                                <i className="fas fa-user"></i>
                            </div>
                        )}
                    </div>
                    <h1 className="hero-name">{displayName}</h1>
                    <p className="hero-description">{bio}</p>
                </div>
            </section>

            {/* Large Title Section */}
            <section className="large-title-section">
                <h2 className="large-title">SOFTWARE ENGINEER</h2>
                <p className="large-subtitle">
                    Passionate about creating intuitive and engaging user experiences. 
                    Specialize in transforming ideas into beautifully crafted products.
                </p>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stat-item">
                    <span className="stat-number">+{experienceYears}</span>
                    <span className="stat-label">YEARS OF<br/>EXPERIENCE</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">+{projectCount}</span>
                    <span className="stat-label">PROJECTS<br/>COMPLETED</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">+{Math.floor(projectCount * 1.5)}</span>
                    <span className="stat-label">WORLDWIDE<br/>CLIENTS</span>
                </div>
            </section>

            {/* Skills Banner */}
            <section className="skills-banner">
                <div className="skills-text">
                    {userProfile?.skills ? 
                        userProfile.skills.join(', ').toUpperCase() : 
                        'DYNAMIC ANIMATION, MOTION DESIGN'
                    }
                </div>
                <div className="tools-text">
                    REACT, NEXTJS, JAVASCRIPT, NODEJS, MONGODB
                </div>
            </section>

            {/* Recent Projects */}
            <section id="projects" className="projects-section">
                <h2 className="section-title">RECENT<span>PROJECTS</span></h2>
                <div className="projects-grid">
                    {completedProjects.slice(0, 6).map((project, index) => (
                        <div key={project.projectId} className="project-card">
                            <div className="project-image">
                                {project.screenshots?.milestone_0 ? (
                                    <img src={project.screenshots.milestone_0} alt={project.project.title} />
                                ) : (
                                    <div className="project-placeholder">
                                        <i className="fas fa-code"></i>
                                    </div>
                                )}
                            </div>
                            <h3>{project.project.title}</h3>
                            <p>{project.project.domain}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Experience Section */}
            <section id="experience" className="experience-section">
                <h2 className="section-title">{experienceYears} YEARS OF<span>EXPERIENCE</span></h2>
                <div className="experience-list">
                    <div className="experience-item">
                        <h3>SkillForge Builder</h3>
                        <p>Building real-world projects and developing innovative solutions through hands-on experience.</p>
                        <span>Jan 2020 - Present</span>
                    </div>
                    <div className="experience-item">
                        <h3>Full-Stack Developer</h3>
                        <p>Developed and implemented solutions for various projects, collaborated with teams and clients.</p>
                        <span>Jun 2018 - Dec 2019</span>
                    </div>
                    <div className="experience-item">
                        <h3>Software Engineer</h3>
                        <p>Designed and built user interfaces and applications, focusing on enhancing usability and performance.</p>
                        <span>Mar 2016 - May 2018</span>
                    </div>
                </div>
            </section>

            {/* Tools Section */}
            <section id="tools" className="tools-section">
                <h2 className="section-title">PREMIUM<span>TOOLS</span></h2>
                <div className="tools-grid">
                    <div className="tool-card">
                        <div className="tool-icon">
                            <i className="fab fa-react"></i>
                        </div>
                        <h3>React</h3>
                        <p>Frontend Framework</p>
                    </div>
                    <div className="tool-card">
                        <div className="tool-icon">
                            <i className="fab fa-node-js"></i>
                        </div>
                        <h3>Node.js</h3>
                        <p>Backend Runtime</p>
                    </div>
                    <div className="tool-card">
                        <div className="tool-icon">
                            <i className="fas fa-database"></i>
                        </div>
                        <h3>MongoDB</h3>
                        <p>Database</p>
                    </div>
                    <div className="tool-card">
                        <div className="tool-icon">
                            <i className="fab fa-figma"></i>
                        </div>
                        <h3>Figma</h3>
                        <p>Design Tool</p>
                    </div>
                    <div className="tool-card">
                        <div className="tool-icon">
                            <i className="fab fa-git-alt"></i>
                        </div>
                        <h3>Git</h3>
                        <p>Version Control</p>
                    </div>
                    <div className="tool-card">
                        <div className="tool-icon">
                            <i className="fab fa-aws"></i>
                        </div>
                        <h3>AWS</h3>
                        <p>Cloud Platform</p>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="contact-section">
                <h2 className="section-title">LET'S WORK<span>TOGETHER</span></h2>
                <div className="contact-content">
                    <div className="contact-info">
                        {userProfile?.email && (
                            <p>Email: <a href={`mailto:${userProfile.email}`}>{userProfile.email}</a></p>
                        )}
                        {userProfile?.githubUrl && (
                            <p>GitHub: <a href={userProfile.githubUrl} target="_blank" rel="noopener noreferrer">View Profile</a></p>
                        )}
                        {userProfile?.linkedinUrl && (
                            <p>LinkedIn: <a href={userProfile.linkedinUrl} target="_blank" rel="noopener noreferrer">Connect</a></p>
                        )}
                    </div>
                </div>
            </section>

            <style jsx>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: #000;
                    color: #fff;
                    overflow-x: hidden;
                }

                .sawad-nav {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    background: rgba(0, 0, 0, 0.9);
                    backdrop-filter: blur(10px);
                    padding: 1rem 0;
                }

                .nav-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 2rem;
                    display: flex;
                    justify-content: center;
                    gap: 3rem;
                }

                .nav-container a {
                    color: #fff;
                    text-decoration: none;
                    font-weight: 500;
                    transition: opacity 0.3s ease;
                }

                .nav-container a:hover {
                    opacity: 0.7;
                }

                .hero-section {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 0 2rem;
                    background: #000;
                }

                .hero-content {
                    max-width: 600px;
                }

                .profile-image {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    margin: 0 auto 2rem;
                    overflow: hidden;
                    background: #333;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .profile-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .default-avatar {
                    font-size: 3rem;
                    color: #666;
                }

                .hero-name {
                    font-size: 3rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    color: #fff;
                }

                .hero-description {
                    font-size: 1.2rem;
                    color: #ccc;
                    line-height: 1.6;
                }

                .large-title-section {
                    padding: 4rem 2rem;
                    text-align: center;
                    background: #000;
                }

                .large-title {
                    font-size: clamp(3rem, 8vw, 8rem);
                    font-weight: 900;
                    color: #fff;
                    margin-bottom: 2rem;
                    letter-spacing: -0.02em;
                }

                .large-subtitle {
                    font-size: 1.2rem;
                    color: #ccc;
                    max-width: 600px;
                    margin: 0 auto;
                    line-height: 1.6;
                }

                .stats-section {
                    display: flex;
                    justify-content: center;
                    gap: 4rem;
                    padding: 4rem 2rem;
                    background: #000;
                    flex-wrap: wrap;
                }

                .stat-item {
                    text-align: center;
                }

                .stat-number {
                    display: block;
                    font-size: 3rem;
                    font-weight: 900;
                    color: #fff;
                    margin-bottom: 0.5rem;
                }

                .stat-label {
                    font-size: 0.9rem;
                    color: #ccc;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    line-height: 1.2;
                }

                .skills-banner {
                    background: #111;
                    padding: 2rem;
                    text-align: center;
                    border-top: 1px solid #333;
                    border-bottom: 1px solid #333;
                }

                .skills-text {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 0.5rem;
                    letter-spacing: 0.1em;
                }

                .tools-text {
                    font-size: 1rem;
                    color: #ccc;
                    letter-spacing: 0.1em;
                }

                .projects-section {
                    padding: 6rem 2rem;
                    background: #000;
                }

                .section-title {
                    font-size: 3rem;
                    font-weight: 900;
                    text-align: center;
                    margin-bottom: 4rem;
                    color: #fff;
                }

                .section-title span {
                    color: #666;
                }

                .projects-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .project-card {
                    background: #111;
                    border-radius: 12px;
                    overflow: hidden;
                    transition: transform 0.3s ease;
                }

                .project-card:hover {
                    transform: translateY(-5px);
                }

                .project-image {
                    width: 100%;
                    height: 200px;
                    background: #222;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }

                .project-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .project-placeholder {
                    font-size: 3rem;
                    color: #666;
                }

                .project-card h3 {
                    padding: 1rem 1rem 0.5rem;
                    font-size: 1.2rem;
                    color: #fff;
                }

                .project-card p {
                    padding: 0 1rem 1rem;
                    color: #ccc;
                    font-size: 0.9rem;
                }

                .experience-section {
                    padding: 6rem 2rem;
                    background: #111;
                }

                .experience-list {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .experience-item {
                    background: #000;
                    padding: 2rem;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                    border: 1px solid #333;
                }

                .experience-item h3 {
                    font-size: 1.5rem;
                    color: #fff;
                    margin-bottom: 1rem;
                }

                .experience-item p {
                    color: #ccc;
                    line-height: 1.6;
                    margin-bottom: 1rem;
                }

                .experience-item span {
                    color: #666;
                    font-size: 0.9rem;
                }

                .tools-section {
                    padding: 6rem 2rem;
                    background: #000;
                }

                .tools-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 2rem;
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .tool-card {
                    background: #111;
                    padding: 2rem;
                    border-radius: 12px;
                    text-align: center;
                    transition: transform 0.3s ease;
                    border: 1px solid #333;
                }

                .tool-card:hover {
                    transform: translateY(-5px);
                }

                .tool-icon {
                    font-size: 3rem;
                    color: #fff;
                    margin-bottom: 1rem;
                }

                .tool-card h3 {
                    font-size: 1.2rem;
                    color: #fff;
                    margin-bottom: 0.5rem;
                }

                .tool-card p {
                    color: #ccc;
                    font-size: 0.9rem;
                }

                .contact-section {
                    padding: 6rem 2rem;
                    background: #111;
                    text-align: center;
                }

                .contact-content {
                    max-width: 600px;
                    margin: 0 auto;
                }

                .contact-info p {
                    margin-bottom: 1rem;
                    color: #ccc;
                    font-size: 1.1rem;
                }

                .contact-info a {
                    color: #fff;
                    text-decoration: none;
                }

                .contact-info a:hover {
                    opacity: 0.7;
                }

                .error-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 2rem;
                    background: #000;
                    color: #fff;
                }

                @media (max-width: 768px) {
                    .nav-container {
                        gap: 1.5rem;
                        padding: 0 1rem;
                    }

                    .hero-name {
                        font-size: 2rem;
                    }

                    .large-title {
                        font-size: 3rem;
                    }

                    .stats-section {
                        gap: 2rem;
                    }

                    .stat-number {
                        font-size: 2rem;
                    }

                    .section-title {
                        font-size: 2rem;
                    }

                    .projects-grid {
                        grid-template-columns: 1fr;
                    }

                    .tools-grid {
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    }
                }
            `}</style>
        </>
    );
}