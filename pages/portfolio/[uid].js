// pages/portfolio/[uid].js

import { useState } from 'react';
import { db } from '../../firebase/config';
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from '../../components/Navbar';

// --- FIX: Import the JSON data directly. It will be bundled with the code.
import allProjects from '../../data/projects.json';

// Server-side data fetching
export async function getServerSideProps(context) {
  const { uid } = context.params;
  if (!uid) return { notFound: true };

  try {
    // Add debugging for production
    console.log('Fetching portfolio for UID:', uid);
    console.log('Firebase config check:', {
      hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });

    // Initialize Firebase connection with better error handling
    let userProfile = null;
    let completedProjects = [];

    try {
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        userProfile = userDocSnap.data();
        console.log('User profile found:', !!userProfile);
        console.log('User profile keys:', userProfile ? Object.keys(userProfile) : 'none');
      } else {
        console.log('User document does not exist for UID:', uid);
      }
    } catch (userError) {
      console.error('Error fetching user profile:', userError);
      // Continue execution even if user profile fails
    }

    try {
      const q = query(collection(db, 'userProgress'), where('userId', '==', uid), where('isCompleted', '==', true));
      const querySnapshot = await getDocs(q);

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
      console.log('Completed projects found:', completedProjects.length);
    } catch (projectsError) {
      console.error('Error fetching user progress:', projectsError);
      // Continue execution even if projects fail
    }

    // Return data with fallbacks
    return { 
        props: { 
            userProfile: userProfile || {},
            completedProjects: completedProjects || [],
            uid: uid, // Pass UID for debugging
            debugInfo: {
              hasUserProfile: !!userProfile,
              userProfileKeys: userProfile ? Object.keys(userProfile) : [],
              projectCount: completedProjects.length,
              timestamp: new Date().toISOString()
            }
        } 
    };
  } catch (error) {
    console.error("Critical error fetching portfolio:", error);
    
    // Return minimal data to prevent complete failure
    return { 
        props: { 
            userProfile: {},
            completedProjects: [],
            uid: uid,
            error: `Failed to load portfolio: ${error.message}`,
            debugInfo: {
              errorType: error.name,
              errorMessage: error.message,
              timestamp: new Date().toISOString()
            }
        } 
    };
  }
}

// Main Portfolio Page Component
export default function SawadStylePortfolio({ userProfile, completedProjects, error, uid, debugInfo }) {
    if (error) {
        return (
            <div className="error-container">
                <h1>Error</h1>
                <p>{error}</p>
                {debugInfo && (
                    <div style={{ marginTop: '2rem', padding: '1rem', background: '#222', borderRadius: '8px', textAlign: 'left' }}>
                        <h3>Debug Information:</h3>
                        <pre style={{ color: '#ccc', fontSize: '0.9rem' }}>
                            {JSON.stringify(debugInfo, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        );
    }

    const displayName = userProfile?.displayName || 'Developer';
    const bio = userProfile?.bio || 'A Software Engineer who has developed countless innovative solutions.';
    const projectCount = Array.isArray(completedProjects) ? completedProjects.length : 0;
    // Calculate experience more accurately, supporting months
    let experienceYears;
    if (userProfile?.experienceYears) {
        experienceYears = userProfile.experienceYears;
    } else if (userProfile?.experienceMonths) {
        experienceYears = Math.round((userProfile.experienceMonths / 12) * 10) / 10; // Round to 1 decimal
    } else {
        experienceYears = Math.max(1, Math.floor(projectCount / 4)); // Fallback estimate
    }

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

            {/* Debug Section - Shows in production to help diagnose issues */}
            {debugInfo && (
                <div style={{ 
                    position: 'fixed', 
                    top: '80px', 
                    right: '20px', 
                    background: '#222', 
                    color: '#fff', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    fontSize: '0.8rem', 
                    maxWidth: '300px', 
                    zIndex: 1000,
                    border: '1px solid #444',
                    opacity: 0.9
                }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>Debug Info:</h4>
                    <p style={{ margin: '0.2rem 0', color: '#ccc' }}>UID: {uid}</p>
                    <p style={{ margin: '0.2rem 0', color: '#ccc' }}>Has Profile: {debugInfo.hasUserProfile ? 'Yes' : 'No'}</p>
                    <p style={{ margin: '0.2rem 0', color: '#ccc' }}>Profile Keys: {debugInfo.userProfileKeys.length > 0 ? debugInfo.userProfileKeys.join(', ') : 'None'}</p>
                    <p style={{ margin: '0.2rem 0', color: '#ccc' }}>Projects: {debugInfo.projectCount}</p>
                    <p style={{ margin: '0.2rem 0', color: '#ccc' }}>Time: {new Date(debugInfo.timestamp).toLocaleTimeString()}</p>
                    <p style={{ margin: '0.2rem 0', color: '#ccc' }}>Env: {process.env.NODE_ENV || 'unknown'}</p>
                </div>
            )}

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
                    
                    {/* About Me Section */}
                    {userProfile?.aboutDescription && (
                        <div className="about-me-section">
                            <h3 className="about-me-title">About Me</h3>
                            <p className="about-me-content">{userProfile.aboutDescription}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Large Title Section */}
            <section className="large-title-section">
                <h2 className="large-title">{userProfile?.portfolioTitle || 'SOFTWARE ENGINEER'}</h2>
                <p className="large-subtitle">
                    {userProfile?.portfolioSubtitle || userProfile?.aboutDescription || 
                     'Passionate about creating intuitive and engaging user experiences. Specialize in transforming ideas into beautifully crafted products.'}
                </p>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stat-item">
                    <span className="stat-number">
                        +{experienceYears < 1 ? 
                            (userProfile?.experienceMonths || Math.round(experienceYears * 12)) : 
                            experienceYears
                        }
                    </span>
                    <span className="stat-label">
                        {experienceYears < 1 ? 'MONTHS OF' : 'YEARS OF'}<br/>EXPERIENCE
                    </span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">+{projectCount}</span>
                    <span className="stat-label">PROJECTS<br/>COMPLETED</span>
                </div>
               
            </section>

            {/* Skills Section */}
            <section className="skills-section">
                <h2 className="section-title"><span>MY SKILLS</span></h2>
                <div className="skills-grid">
                    {userProfile?.skills && Array.isArray(userProfile.skills) && userProfile.skills.length > 0 ? (
                        userProfile.skills.map((skill, index) => (
                            <div key={index} className="skill-box">
                                {skill?.trim() || skill}
                            </div>
                        ))
                    ) : (
                        /* Fallback to default skills if no custom skills are available */
                        <>
                            <div className="skill-box">React</div>
                            <div className="skill-box">JavaScript</div>
                            <div className="skill-box">Node.js</div>
                            <div className="skill-box">Python</div>
                            <div className="skill-box">Machine Learning</div>
                            <div className="skill-box">UI/UX Design</div>
                        </>
                    )}
                </div>
            </section>

            {/* Recent Projects */}
            <section id="projects" className="projects-section">
                <h2 className="section-title"><span>RECENT PROJECTS</span></h2>
                <div className="projects-grid">
                    {Array.isArray(completedProjects) && completedProjects.length > 0 ? (
                        completedProjects.slice(0, 6).map((project, index) => (
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
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                            <p>No completed projects yet.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Experience Section */}
            <section id="experience" className="experience-section">
                <h2 className="section-title">
                    {experienceYears < 1 ? 
                        `${userProfile?.experienceMonths || Math.round(experienceYears * 12)} MONTHS OF` : 
                        `${experienceYears} YEARS OF`
                    }<span> EXPERIENCE</span>
                </h2>
                <div className="experience-list">
                    {/* Display detailed experience entries if available */}
                    {userProfile?.experiences && Array.isArray(userProfile.experiences) && userProfile.experiences.length > 0 ? (
                        userProfile.experiences.map((experience, index) => (
                            <div key={experience.id || index} className="experience-item">
                                <div className="experience-header">
                                    <h3>{experience.position}</h3>
                                    <span className="experience-duration">
                                        {experience.startDate && (
                                            <>
                                                {new Date(experience.startDate + '-01').toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    year: 'numeric' 
                                                })}
                                                {' - '}
                                                {experience.current ? 
                                                    'Present' : 
                                                    experience.endDate ? 
                                                        new Date(experience.endDate + '-01').toLocaleDateString('en-US', { 
                                                            month: 'short', 
                                                            year: 'numeric' 
                                                        }) : 
                                                        'Present'
                                                }
                                            </>
                                        )}
                                    </span>
                                </div>
                                <div className="experience-company">
                                    <h4>{experience.company}</h4>
                                    {experience.location && (
                                        <span className="experience-location">{experience.location}</span>
                                    )}
                                </div>
                                {experience.description && (
                                    <p className="experience-description">{experience.description}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        /* Fallback to basic experience display */
                        <>
                            {userProfile?.currentPosition && userProfile?.company ? (
                                <div className="experience-item">
                                    <div className="experience-header">
                                        <h3>{userProfile.currentPosition}</h3>
                                        <span className="experience-duration">Current Position</span>
                                    </div>
                                    <div className="experience-company">
                                        <h4>{userProfile.company}</h4>
                                    </div>
                                </div>
                            ) : null}
                            <div className="experience-item">
                                <div className="experience-header">
                                    <h3>SkillForge Builder</h3>
                                    <span className="experience-duration">Jan 2020 - Present</span>
                                </div>
                                <div className="experience-company">
                                    <h4>SkillForge Platform</h4>
                                </div>
                                <p className="experience-description">
                                    Building real-world projects and developing innovative solutions through hands-on experience.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Tools Section */}
            <section id="tools" className="tools-section">
                <h2 className="section-title"><span>TOOLS</span></h2>
                <div className="tools-grid">
                    {userProfile?.primaryTools && Array.isArray(userProfile.primaryTools) && userProfile.primaryTools.length > 0 ? (
                        userProfile.primaryTools.map((tool, index) => (
                            <div key={index} className="tool-card">
                                <div className="tool-icon">
                                    <i className="fas fa-code"></i>
                                </div>
                                <h3>{tool}</h3>
                                <p>Development Tool</p>
                            </div>
                        ))
                    ) : (
                        /* Fallback to default tools if no custom tools are available */
                        <>
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
                        </>
                    )}
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="contact-section">
                <h2 className="section-title">LET'S WORK<span>TOGETHER</span></h2>
                <div className="contact-content">
                    <div className="contact-info">
                        {userProfile?.showEmail !== false && userProfile?.email && (
                            <p>Email: <a href={`mailto:${userProfile.email}`}>{userProfile.email}</a></p>
                        )}
                        {userProfile?.githubUrl && (
                            <p>GitHub: <a href={userProfile.githubUrl} target="_blank" rel="noopener noreferrer">View Profile</a></p>
                        )}
                        {userProfile?.linkedinUrl && (
                            <p>LinkedIn: <a href={userProfile.linkedinUrl} target="_blank" rel="noopener noreferrer">Connect</a></p>
                        )}
                        {userProfile?.twitterUrl && (
                            <p>Twitter: <a href={userProfile.twitterUrl} target="_blank" rel="noopener noreferrer">Follow</a></p>
                        )}
                        {userProfile?.portfolioUrl && (
                            <p>Website: <a href={userProfile.portfolioUrl} target="_blank" rel="noopener noreferrer">Visit</a></p>
                        )}
                        {userProfile?.showLocation !== false && userProfile?.location && (
                            <p>Location: {userProfile.location}</p>
                        )}
                        {userProfile?.availability && (
                            <p>Status: {userProfile.availability.charAt(0).toUpperCase() + userProfile.availability.slice(1).replace('-', ' ')}</p>
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
                    max-width: 800px;
                    width: 100%;
                    text-align: center;
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
                    margin-bottom: 2rem;
                    text-align: center;
                    max-width: 600px;
                    margin: 0 auto 2rem auto;
                }

                .about-me-section {
                    margin-top: 3rem;
                    padding: 2rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                }

                .about-me-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 1rem;
                    text-align: center;
                }

                .about-me-content {
                    font-size: 1.1rem;
                    color: #ccc;
                    line-height: 1.7;
                    text-align: center;
                    margin: 0;
                    max-width: 600px;
                    margin: 0 auto;
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

                .skills-section {
                    padding: 6rem 2rem;
                    background: #111;
                }

                .skills-grid {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 1rem;
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .skill-box {
                    background: #000;
                    color: #fff;
                    padding: 12px 24px;
                    border-radius: 8px;
                    border: 1px solid #333;
                    font-size: 0.9rem;
                    font-weight: 500;
                    text-align: center;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                }

                .skill-box:hover {
                    background: #222;
                    border-color: #555;
                    transform: translateY(-2px);
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

                .experience-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .experience-item h3 {
                    font-size: 1.5rem;
                    color: #fff;
                    margin: 0;
                    flex: 1;
                }

                .experience-duration {
                    color: #666;
                    font-size: 0.9rem;
                    font-weight: 500;
                    white-space: nowrap;
                }

                .experience-company {
                    margin-bottom: 1rem;
                }

                .experience-company h4 {
                    font-size: 1.2rem;
                    color: #fff;
                    margin: 0 0 0.5rem 0;
                    font-weight: 600;
                }

                .experience-location {
                    color: #888;
                    font-size: 0.9rem;
                    font-style: italic;
                }

                .experience-description {
                    color: #ccc;
                    line-height: 1.6;
                    margin: 0;
                    font-size: 1rem;
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
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 60px;
                }

                .tool-icon-image {
                    width: 48px;
                    height: 48px;
                    object-fit: contain;
                    filter: brightness(1.1);
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

                    .experience-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }

                    .experience-item h3 {
                        font-size: 1.3rem;
                    }

                    .experience-duration {
                        white-space: normal;
                    }

                    .experience-company h4 {
                        font-size: 1.1rem;
                    }
                }
            `}</style>
        </>
    );
}