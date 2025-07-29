// pages/portfolio/[uid].js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../firebase/config';
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from '../../components/Navbar';

// --- FIX: Import the JSON data directly. It will be bundled with the code.
import allProjects from '../../data/projects.json';

// Use getServerSideProps for direct link compatibility
export async function getServerSideProps({ params }) {
  const { uid } = params;
  
  console.log('getServerSideProps called with UID:', uid);
  
  // Initialize return data with safe defaults - NEVER return notFound
  let userProfile = {};
  let completedProjects = [];
  let debugInfo = {
    hasUserProfile: false,
    userProfileKeys: [],
    projectCount: 0,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    vercelEnv: process.env.VERCEL_ENV || 'unknown',
    hasFirebaseConfig: false,
    firebaseError: null,
    serverError: null,
    method: 'getServerSideProps',
    uidReceived: uid || 'MISSING'
  };

  // Only try to fetch data if we have a valid UID
  if (uid && typeof uid === 'string') {
    try {
      // Check Firebase configuration
      const hasFirebaseConfig = !!(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
      );
      
      debugInfo.hasFirebaseConfig = hasFirebaseConfig;
      
      console.log('Portfolio SSR - UID:', uid);
      console.log('Portfolio SSR - Environment:', process.env.NODE_ENV);
      console.log('Portfolio SSR - Vercel Env:', process.env.VERCEL_ENV);
      console.log('Portfolio SSR - Has Firebase Config:', hasFirebaseConfig);

      if (hasFirebaseConfig) {
        try {
          // Try to fetch user profile
          const userDocRef = doc(db, 'users', uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            userProfile = userData || {};
            debugInfo.hasUserProfile = true;
            debugInfo.userProfileKeys = Object.keys(userProfile);
            console.log('Portfolio SSR - User profile found with keys:', debugInfo.userProfileKeys);
          } else {
            console.log('Portfolio SSR - User document not found for UID:', uid);
          }
        } catch (userError) {
          console.error('Portfolio SSR - User fetch error:', userError);
          debugInfo.firebaseError = userError.message;
        }

        try {
          // Try to fetch completed projects
          const q = query(
            collection(db, 'userProgress'), 
            where('userId', '==', uid), 
            where('isCompleted', '==', true)
          );
          const querySnapshot = await getDocs(q);

          const projects = [];
          querySnapshot.forEach(docSnap => {
            const progressData = docSnap.data();
            const projectDetails = allProjects.find(p => p.id === progressData.projectId);
            
            if (projectDetails) {
              // Safely serialize Firebase timestamps
              const serializableProject = {
                userId: progressData.userId,
                projectId: progressData.projectId,
                isCompleted: progressData.isCompleted,
                submissionUrl: progressData.submissionUrl || null,
                project: projectDetails,
                completedAt: progressData.completedAt?.toDate?.()?.toISOString() || null,
                startedAt: progressData.startedAt?.toDate?.()?.toISOString() || null,
                lastUpdated: progressData.lastUpdated?.toDate?.()?.toISOString() || null,
                screenshots: progressData.screenshots || null,
              };
              projects.push(serializableProject);
            }
          });
          
          completedProjects = projects;
          debugInfo.projectCount = projects.length;
          console.log('Portfolio SSR - Projects found:', projects.length);
        } catch (projectsError) {
          console.error('Portfolio SSR - Projects fetch error:', projectsError);
          debugInfo.firebaseError = projectsError.message;
        }
      } else {
        console.log('Portfolio SSR - Firebase config missing');
        debugInfo.firebaseError = 'Firebase configuration missing';
      }

    } catch (criticalError) {
      console.error('Portfolio SSR - Critical error:', criticalError);
      debugInfo.serverError = criticalError.message;
    }
  } else {
    console.log('Portfolio SSR - Invalid or missing UID, will rely on client-side fetch');
    debugInfo.serverError = 'Invalid or missing UID';
  }

  // ALWAYS return valid props - NEVER return notFound
  return {
    props: {
      userProfile,
      completedProjects,
      uid: uid || null,
      debugInfo
    }
  };
}

// Main Portfolio Page Component
export default function SawadStylePortfolio({ userProfile = {}, completedProjects = [], uid, debugInfo }) {
    const router = useRouter();
    const [clientDebugInfo, setClientDebugInfo] = useState(null);
    const [clientData, setClientData] = useState({ userProfile: {}, completedProjects: [] });

    // Client-side fallback for additional debugging and data fetching
    useEffect(() => {
        const currentUid = uid || router.query.uid;
        
        setClientDebugInfo({
            isClient: true,
            hasWindow: typeof window !== 'undefined',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
            timestamp: new Date().toISOString(),
            routerReady: router.isReady,
            routerQuery: router.query,
            currentUid: currentUid,
            propsReceived: {
                hasUserProfile: !!userProfile && Object.keys(userProfile).length > 0,
                hasCompletedProjects: Array.isArray(completedProjects) && completedProjects.length > 0,
                hasUid: !!uid,
                hasDebugInfo: !!debugInfo
            }
        });

        // If server-side data is missing and we have a UID, try client-side fetch
        if (currentUid && router.isReady) {
            const needsUserProfile = !userProfile || Object.keys(userProfile).length === 0;
            const needsProjects = !Array.isArray(completedProjects) || completedProjects.length === 0;
            
            if (needsUserProfile || needsProjects) {
                console.log('Client-side fallback: Attempting to fetch data for UID:', currentUid);
                
                // Client-side Firebase fetch as fallback
                const fetchClientData = async () => {
                    try {
                        // Fetch user profile if needed
                        if (needsUserProfile) {
                            const userDocRef = doc(db, 'users', currentUid);
                            const userDocSnap = await getDoc(userDocRef);
                            
                            if (userDocSnap.exists()) {
                                const userData = userDocSnap.data();
                                setClientData(prev => ({ ...prev, userProfile: userData }));
                                console.log('Client-side: User profile fetched successfully');
                            }
                        }

                        // Fetch completed projects if needed
                        if (needsProjects) {
                            const q = query(
                                collection(db, 'userProgress'), 
                                where('userId', '==', currentUid), 
                                where('isCompleted', '==', true)
                            );
                            const querySnapshot = await getDocs(q);

                            const projects = [];
                            querySnapshot.forEach(docSnap => {
                                const progressData = docSnap.data();
                                const projectDetails = allProjects.find(p => p.id === progressData.projectId);
                                
                                if (projectDetails) {
                                    const serializableProject = {
                                        userId: progressData.userId,
                                        projectId: progressData.projectId,
                                        isCompleted: progressData.isCompleted,
                                        submissionUrl: progressData.submissionUrl || null,
                                        project: projectDetails,
                                        completedAt: progressData.completedAt?.toDate?.()?.toISOString() || null,
                                        startedAt: progressData.startedAt?.toDate?.()?.toISOString() || null,
                                        lastUpdated: progressData.lastUpdated?.toDate?.()?.toISOString() || null,
                                        screenshots: progressData.screenshots || null,
                                    };
                                    projects.push(serializableProject);
                                }
                            });
                            
                            setClientData(prev => ({ ...prev, completedProjects: projects }));
                            console.log('Client-side: Completed projects fetched successfully:', projects.length);
                        }
                    } catch (error) {
                        console.error('Client-side: Error fetching data:', error);
                    }
                };

                fetchClientData();
            }
        }
    }, [router.isReady, router.query, uid, userProfile, completedProjects, debugInfo]);

    // Use client data if server data is missing
    const effectiveUserProfile = (userProfile && Object.keys(userProfile).length > 0) ? userProfile : clientData.userProfile;
    const effectiveCompletedProjects = (Array.isArray(completedProjects) && completedProjects.length > 0) ? completedProjects : clientData.completedProjects;
    const effectiveUid = uid || router.query.uid;

    const displayName = effectiveUserProfile?.displayName || 'Developer';
    const bio = effectiveUserProfile?.bio || 'A Software Engineer who has developed countless innovative solutions.';
    const projectCount = Array.isArray(effectiveCompletedProjects) ? effectiveCompletedProjects.length : 0;
    
    // Calculate experience more accurately, supporting months
    let experienceYears;
    if (effectiveUserProfile?.experienceYears) {
        experienceYears = effectiveUserProfile.experienceYears;
    } else if (effectiveUserProfile?.experienceMonths) {
        experienceYears = Math.round((effectiveUserProfile.experienceMonths / 12) * 10) / 10; // Round to 1 decimal
    } else {
        experienceYears = Math.max(1, Math.floor(projectCount / 4)); // Fallback estimate
    }

    // Share functionality
    const handleShare = async () => {
        const shareData = {
            title: `${displayName} | Portfolio - SkillForge`,
            text: `Check out ${displayName}'s professional portfolio showcasing ${projectCount} completed projects.`,
            url: `https://skillforgeprojects.vercel.app/portfolio/${effectiveUid}`
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing:', err);
                // Fallback to copying URL
                copyToClipboard(shareData.url);
            }
        } else {
            // Fallback to copying URL
            copyToClipboard(shareData.url);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Portfolio link copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Portfolio link copied to clipboard!');
        });
    };

    return (
        <>
            <Head>
                <title>{displayName} | Portfolio - SkillForge</title>
                <meta name="description" content={`${displayName}'s professional portfolio showcasing ${projectCount} completed projects. ${bio}`} />
                
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`https://skillforgeprojects.vercel.app/portfolio/${effectiveUid}`} />
                <meta property="og:title" content={`${displayName} | Portfolio - SkillForge`} />
                <meta property="og:description" content={`${displayName}'s professional portfolio showcasing ${projectCount} completed projects. ${bio}`} />
                <meta property="og:image" content={effectiveUserProfile?.photoURL || "https://skillforgeprojects.vercel.app/logo.png"} />
                <meta property="og:site_name" content="SkillForge" />
                
                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content={`https://skillforgeprojects.vercel.app/portfolio/${effectiveUid}`} />
                <meta property="twitter:title" content={`${displayName} | Portfolio - SkillForge`} />
                <meta property="twitter:description" content={`${displayName}'s professional portfolio showcasing ${projectCount} completed projects. ${bio}`} />
                <meta property="twitter:image" content={effectiveUserProfile?.photoURL || "https://skillforgeprojects.vercel.app/logo.png"} />
                
                {/* Additional SEO */}
                <meta name="robots" content="index, follow" />
                <meta name="author" content={displayName} />
                <meta name="keywords" content={`${displayName}, portfolio, developer, projects, ${effectiveUserProfile?.skills?.join(', ') || 'programming, web development'}`} />
                <link rel="canonical" href={`https://skillforgeprojects.vercel.app/portfolio/${effectiveUid}`} />
                <link rel="icon" href="/favicon.ico" />
                
                {/* Structured Data for Portfolio */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Person",
                            "name": displayName,
                            "description": bio,
                            "url": `https://skillforgeprojects.vercel.app/portfolio/${effectiveUid}`,
                            "image": effectiveUserProfile?.photoURL,
                            "jobTitle": effectiveUserProfile?.currentPosition || "Developer",
                            "worksFor": effectiveUserProfile?.company ? {
                                "@type": "Organization",
                                "name": effectiveUserProfile.company
                            } : undefined,
                            "knowsAbout": effectiveUserProfile?.skills || ["Programming", "Web Development"],
                            "alumniOf": effectiveUserProfile?.education ? {
                                "@type": "EducationalOrganization",
                                "name": effectiveUserProfile.education
                            } : undefined
                        })
                    }}
                />
            </Head>
            
            {/* Main Website Navigation */}
            <Navbar />

            {/* Share Button - Fixed position for easy access */}
            <button
                onClick={handleShare}
                style={{
                    position: 'fixed',
                    top: '50%',
                    right: '20px',
                    transform: 'translateY(-50%)',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                    zIndex: 1000,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-50%) scale(1.1)';
                    e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(-50%) scale(1)';
                    e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                }}
                title="Share this portfolio"
            >
                <i className="fas fa-share-alt"></i>
            </button>

            {/* Debug Section - Only show in development */}
            {process.env.NODE_ENV === 'development' && debugInfo && (
                <div style={{ 
                    position: 'fixed', 
                    top: '80px', 
                    left: '20px', 
                    background: '#222', 
                    color: '#fff', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    fontSize: '0.75rem', 
                    maxWidth: '320px', 
                    zIndex: 1000,
                    border: '1px solid #444',
                    opacity: 0.95,
                    maxHeight: '400px',
                    overflowY: 'auto'
                }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '0.9rem' }}>Debug Info:</h4>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Server ({debugInfo?.method || 'unknown'}):</strong>
                        <p style={{ margin: '0.1rem 0', color: '#ccc' }}>UID: {uid || 'MISSING'}</p>
                        <p style={{ margin: '0.1rem 0', color: '#ccc' }}>Profile: {debugInfo?.hasUserProfile ? 'Yes' : 'No'}</p>
                        <p style={{ margin: '0.1rem 0', color: '#ccc' }}>Keys: {debugInfo?.userProfileKeys?.length > 0 ? debugInfo.userProfileKeys.join(', ') : 'None'}</p>
                        <p style={{ margin: '0.1rem 0', color: '#ccc' }}>Projects: {debugInfo?.projectCount || 0}</p>
                        <p style={{ margin: '0.1rem 0', color: '#ccc' }}>Env: {debugInfo?.environment || 'MISSING'}</p>
                        <p style={{ margin: '0.1rem 0', color: '#ccc' }}>Vercel: {debugInfo?.vercelEnv || 'MISSING'}</p>
                        <p style={{ margin: '0.1rem 0', color: '#ccc' }}>Firebase: {debugInfo?.hasFirebaseConfig ? 'Yes' : 'No'}</p>
                        {debugInfo?.firebaseError && (
                            <p style={{ margin: '0.1rem 0', color: '#ff6b6b', fontSize: '0.7rem' }}>FB Error: {debugInfo.firebaseError}</p>
                        )}
                        {debugInfo?.serverError && (
                            <p style={{ margin: '0.1rem 0', color: '#ff6b6b', fontSize: '0.7rem' }}>Server Error: {debugInfo.serverError}</p>
                        )}
                    </div>
                    {clientDebugInfo && (
                        <div>
                            <strong>Client:</strong>
                            <p style={{ margin: '0.1rem 0', color: '#ccc' }}>Hydrated: {clientDebugInfo.isClient ? 'Yes' : 'No'}</p>
                            <p style={{ margin: '0.1rem 0', color: '#ccc' }}>Window: {clientDebugInfo.hasWindow ? 'Yes' : 'No'}</p>
                            <p style={{ margin: '0.1rem 0', color: '#ccc' }}>Router Ready: {clientDebugInfo.routerReady ? 'Yes' : 'No'}</p>
                            <p style={{ margin: '0.1rem 0', color: '#ccc' }}>Current UID: {clientDebugInfo.currentUid || 'None'}</p>
                            <p style={{ margin: '0.1rem 0', color: '#ccc' }}>URL: {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</p>
                            <p style={{ margin: '0.1rem 0', color: '#ccc' }}>Client Profile: {Object.keys(clientData.userProfile).length > 0 ? 'Yes' : 'No'}</p>
                            <p style={{ margin: '0.1rem 0', color: '#ccc' }}>Client Projects: {Array.isArray(clientData.completedProjects) ? clientData.completedProjects.length : 0}</p>
                        </div>
                    )}
                    <p style={{ margin: '0.5rem 0 0 0', color: '#888', fontSize: '0.7rem' }}>
                        Time: {new Date(debugInfo?.timestamp || Date.now()).toLocaleTimeString()}
                    </p>
                </div>
            )}

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="profile-image">
                        {effectiveUserProfile?.photoURL ? (
                            <img src={effectiveUserProfile.photoURL} alt={displayName} />
                        ) : (
                            <div className="default-avatar">
                                <i className="fas fa-user"></i>
                            </div>
                        )}
                    </div>
                    <h1 className="hero-name">{displayName}</h1>
                    <p className="hero-description">{bio}</p>
                    
                    {/* About Me Section */}
                    {effectiveUserProfile?.aboutDescription && (
                        <div className="about-me-section">
                            <h3 className="about-me-title">About Me</h3>
                            <p className="about-me-content">{effectiveUserProfile.aboutDescription}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Large Title Section */}
            <section className="large-title-section">
                <h2 className="large-title">{effectiveUserProfile?.portfolioTitle || 'SOFTWARE ENGINEER'}</h2>
                <p className="large-subtitle">
                    {effectiveUserProfile?.portfolioSubtitle || effectiveUserProfile?.aboutDescription || 
                     'Passionate about creating intuitive and engaging user experiences. Specialize in transforming ideas into beautifully crafted products.'}
                </p>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stat-item">
                    <span className="stat-number">
                        +{experienceYears < 1 ? 
                            (effectiveUserProfile?.experienceMonths || Math.round(experienceYears * 12)) : 
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
                    {effectiveUserProfile?.skills && Array.isArray(effectiveUserProfile.skills) && effectiveUserProfile.skills.length > 0 ? (
                        effectiveUserProfile.skills.map((skill, index) => (
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
                    {Array.isArray(effectiveCompletedProjects) && effectiveCompletedProjects.length > 0 ? (
                        effectiveCompletedProjects.slice(0, 6).map((project, index) => (
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
                        `${effectiveUserProfile?.experienceMonths || Math.round(experienceYears * 12)} MONTHS OF` : 
                        `${experienceYears} YEARS OF`
                    }<span> EXPERIENCE</span>
                </h2>
                <div className="experience-list">
                    {/* Display detailed experience entries if available */}
                    {effectiveUserProfile?.experiences && Array.isArray(effectiveUserProfile.experiences) && effectiveUserProfile.experiences.length > 0 ? (
                        effectiveUserProfile.experiences.map((experience, index) => (
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
                            {effectiveUserProfile?.currentPosition && effectiveUserProfile?.company ? (
                                <div className="experience-item">
                                    <div className="experience-header">
                                        <h3>{effectiveUserProfile.currentPosition}</h3>
                                        <span className="experience-duration">Current Position</span>
                                    </div>
                                    <div className="experience-company">
                                        <h4>{effectiveUserProfile.company}</h4>
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
                    {effectiveUserProfile?.primaryTools && Array.isArray(effectiveUserProfile.primaryTools) && effectiveUserProfile.primaryTools.length > 0 ? (
                        effectiveUserProfile.primaryTools.map((tool, index) => (
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
                        {effectiveUserProfile?.showEmail !== false && effectiveUserProfile?.email && (
                            <p>Email: <a href={`mailto:${effectiveUserProfile.email}`}>{effectiveUserProfile.email}</a></p>
                        )}
                        {effectiveUserProfile?.githubUrl && (
                            <p>GitHub: <a href={effectiveUserProfile.githubUrl} target="_blank" rel="noopener noreferrer">View Profile</a></p>
                        )}
                        {effectiveUserProfile?.linkedinUrl && (
                            <p>LinkedIn: <a href={effectiveUserProfile.linkedinUrl} target="_blank" rel="noopener noreferrer">Connect</a></p>
                        )}
                        {effectiveUserProfile?.twitterUrl && (
                            <p>Twitter: <a href={effectiveUserProfile.twitterUrl} target="_blank" rel="noopener noreferrer">Follow</a></p>
                        )}
                        {effectiveUserProfile?.portfolioUrl && (
                            <p>Website: <a href={effectiveUserProfile.portfolioUrl} target="_blank" rel="noopener noreferrer">Visit</a></p>
                        )}
                        {effectiveUserProfile?.showLocation !== false && effectiveUserProfile?.location && (
                            <p>Location: {effectiveUserProfile.location}</p>
                        )}
                        {effectiveUserProfile?.availability && (
                            <p>Status: {effectiveUserProfile.availability.charAt(0).toUpperCase() + effectiveUserProfile.availability.slice(1).replace('-', ' ')}</p>
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

                @media (max-width: 768px) {
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