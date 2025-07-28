import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../firebase/config';
import { collection, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';

// This function correctly fetches all projects from your JSON file at build time. No changes needed here.
export async function getStaticProps() {
  const path = require('path');
  const fs = require('fs');
  const filePath = path.join(process.cwd(), 'public', 'projects.json');
  const jsonData = await fs.readFileSync(filePath);
  const allProjects = JSON.parse(jsonData);
  return { props: { allProjects } };
}

// --- ENHANCED PORTFOLIO CUSTOMIZATION COMPONENT ---
const PortfolioCustomizer = ({ user }) => {
    const [profile, setProfile] = useState({
        // Basic Info
        displayName: '',
        bio: '',
        email: '',
        
        // Skills & Tools
        skills: '',
        primaryTools: '',
        
        // Social Links
        githubUrl: '',
        linkedinUrl: '',
        portfolioUrl: '',
        twitterUrl: '',
        
        // Portfolio Content
        portfolioTitle: '',
        portfolioSubtitle: '',
        aboutDescription: '',
        
        // Experience
        currentPosition: '',
        company: '',
        experienceYears: '',
        
        // Contact Info
        location: '',
        availability: '',
        
        // Portfolio Settings
        showEmail: true,
        showLocation: true,
        showExperience: true,
        portfolioTheme: 'dark'
    });
    
    const [status, setStatus] = useState('');
    const [activeTab, setActiveTab] = useState('basic');

    useEffect(() => {
        if (user) {
            const fetchProfile = async () => {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProfile(prev => ({
                        ...prev,
                        ...data,
                        skills: Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || ''),
                        primaryTools: Array.isArray(data.primaryTools) ? data.primaryTools.join(', ') : (data.primaryTools || ''),
                        email: data.email || user.email || ''
                    }));
                }
            };
            fetchProfile();
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfile(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!user) return;
        setStatus('Saving...');
        const docRef = doc(db, "users", user.uid);
        try {
            const dataToSave = {
                ...profile,
                skills: profile.skills.split(',').map(s => s.trim()).filter(s => s),
                primaryTools: profile.primaryTools.split(',').map(s => s.trim()).filter(s => s),
                experienceYears: profile.experienceYears ? parseInt(profile.experienceYears) : 0
            };
            await setDoc(docRef, dataToSave, { merge: true });
            setStatus('Portfolio settings saved successfully!');
            setTimeout(() => setStatus(''), 3000);
        } catch (error) {
            console.error("Error saving profile:", error);
            setStatus('Failed to save portfolio settings.');
        }
    };

    const inputStyle = { 
        width: '100%', 
        padding: '12px', 
        borderRadius: '8px', 
        border: '1px solid #d1d5db', 
        boxSizing: 'border-box',
        fontSize: '14px',
        transition: 'border-color 0.2s ease'
    };
    
    const labelStyle = { 
        display: 'block', 
        marginBottom: '6px', 
        fontWeight: '600',
        color: '#374151',
        fontSize: '14px'
    };

    const tabStyle = (isActive) => ({
        padding: '12px 24px',
        border: 'none',
        background: isActive ? '#6366f1' : '#f3f4f6',
        color: isActive ? 'white' : '#6b7280',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.2s ease'
    });

    return (
        <section className="dashboard-content">
            <h2>🎨 Portfolio Customization</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                Customize how your portfolio appears to visitors. Changes will be reflected on your public portfolio page.
            </p>
            
            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <button type="button" style={tabStyle(activeTab === 'basic')} onClick={() => setActiveTab('basic')}>
                    Basic Info
                </button>
                <button type="button" style={tabStyle(activeTab === 'skills')} onClick={() => setActiveTab('skills')}>
                    Skills & Tools
                </button>
                <button type="button" style={tabStyle(activeTab === 'social')} onClick={() => setActiveTab('social')}>
                    Social Links
                </button>
                <button type="button" style={tabStyle(activeTab === 'content')} onClick={() => setActiveTab('content')}>
                    Portfolio Content
                </button>
                <button type="button" style={tabStyle(activeTab === 'experience')} onClick={() => setActiveTab('experience')}>
                    Experience
                </button>
                <button type="button" style={tabStyle(activeTab === 'settings')} onClick={() => setActiveTab('settings')}>
                    Settings
                </button>
            </div>

            <form onSubmit={handleSave} style={{ 
                background: '#fff', 
                padding: '32px', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
                
                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                    <div>
                        <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Basic Information</h3>
                        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                            <div>
                                <label style={labelStyle}>Display Name *</label>
                                <input style={inputStyle} type="text" name="displayName" value={profile.displayName || ''} onChange={handleChange} placeholder="John Doe" required />
                            </div>
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input style={inputStyle} type="email" name="email" value={profile.email || ''} onChange={handleChange} placeholder="john@example.com" />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Bio / Tagline</label>
                                <input style={inputStyle} type="text" name="bio" value={profile.bio || ''} onChange={handleChange} placeholder="A Software Engineer who has developed countless innovative solutions." />
                            </div>
                            <div>
                                <label style={labelStyle}>Location</label>
                                <input style={inputStyle} type="text" name="location" value={profile.location || ''} onChange={handleChange} placeholder="San Francisco, CA" />
                            </div>
                            <div>
                                <label style={labelStyle}>Availability</label>
                                <select style={inputStyle} name="availability" value={profile.availability || ''} onChange={handleChange}>
                                    <option value="">Select availability</option>
                                    <option value="available">Available for work</option>
                                    <option value="open">Open to opportunities</option>
                                    <option value="busy">Currently busy</option>
                                    <option value="not-looking">Not looking</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Skills & Tools Tab */}
                {activeTab === 'skills' && (
                    <div>
                        <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Skills & Tools</h3>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Skills (comma-separated)</label>
                                <input style={inputStyle} type="text" name="skills" value={profile.skills || ''} onChange={handleChange} placeholder="React, JavaScript, Node.js, Python, Machine Learning" />
                                <small style={{ color: '#6b7280', fontSize: '12px' }}>These will appear in the skills banner on your portfolio</small>
                            </div>
                            <div>
                                <label style={labelStyle}>Primary Tools (comma-separated)</label>
                                <input style={inputStyle} type="text" name="primaryTools" value={profile.primaryTools || ''} onChange={handleChange} placeholder="React, Next.js, MongoDB, AWS, Figma, Git" />
                                <small style={{ color: '#6b7280', fontSize: '12px' }}>These will appear in the tools section</small>
                            </div>
                        </div>
                    </div>
                )}

                {/* Social Links Tab */}
                {activeTab === 'social' && (
                    <div>
                        <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Social Links</h3>
                        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                            <div>
                                <label style={labelStyle}>GitHub URL</label>
                                <input style={inputStyle} type="url" name="githubUrl" value={profile.githubUrl || ''} onChange={handleChange} placeholder="https://github.com/your-username" />
                            </div>
                            <div>
                                <label style={labelStyle}>LinkedIn URL</label>
                                <input style={inputStyle} type="url" name="linkedinUrl" value={profile.linkedinUrl || ''} onChange={handleChange} placeholder="https://linkedin.com/in/your-username" />
                            </div>
                            <div>
                                <label style={labelStyle}>Personal Website</label>
                                <input style={inputStyle} type="url" name="portfolioUrl" value={profile.portfolioUrl || ''} onChange={handleChange} placeholder="https://yourwebsite.com" />
                            </div>
                            <div>
                                <label style={labelStyle}>Twitter URL</label>
                                <input style={inputStyle} type="url" name="twitterUrl" value={profile.twitterUrl || ''} onChange={handleChange} placeholder="https://twitter.com/your-username" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Portfolio Content Tab */}
                {activeTab === 'content' && (
                    <div>
                        <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Portfolio Content</h3>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Portfolio Title</label>
                                <input style={inputStyle} type="text" name="portfolioTitle" value={profile.portfolioTitle || ''} onChange={handleChange} placeholder="SOFTWARE ENGINEER" />
                                <small style={{ color: '#6b7280', fontSize: '12px' }}>Large title displayed prominently on your portfolio</small>
                            </div>
                            <div>
                                <label style={labelStyle}>Portfolio Subtitle</label>
                                <input style={inputStyle} type="text" name="portfolioSubtitle" value={profile.portfolioSubtitle || ''} onChange={handleChange} placeholder="Passionate about creating intuitive and engaging user experiences." />
                            </div>
                            <div>
                                <label style={labelStyle}>About Description</label>
                                <textarea 
                                    style={{...inputStyle, minHeight: '100px', resize: 'vertical'}} 
                                    name="aboutDescription" 
                                    value={profile.aboutDescription || ''} 
                                    onChange={handleChange} 
                                    placeholder="Tell visitors about yourself, your passion, and what drives you as a developer..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Experience Tab */}
                {activeTab === 'experience' && (
                    <div>
                        <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Professional Experience</h3>
                        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                            <div>
                                <label style={labelStyle}>Current Position</label>
                                <input style={inputStyle} type="text" name="currentPosition" value={profile.currentPosition || ''} onChange={handleChange} placeholder="Senior Software Engineer" />
                            </div>
                            <div>
                                <label style={labelStyle}>Company</label>
                                <input style={inputStyle} type="text" name="company" value={profile.company || ''} onChange={handleChange} placeholder="Tech Company Inc." />
                            </div>
                            <div>
                                <label style={labelStyle}>Years of Experience</label>
                                <input style={inputStyle} type="number" name="experienceYears" value={profile.experienceYears || ''} onChange={handleChange} placeholder="5" min="0" max="50" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div>
                        <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Portfolio Settings</h3>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Portfolio Theme</label>
                                <select style={inputStyle} name="portfolioTheme" value={profile.portfolioTheme || 'dark'} onChange={handleChange}>
                                    <option value="dark">Dark Theme</option>
                                    <option value="light">Light Theme</option>
                                </select>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '12px', color: '#374151' }}>Visibility Settings</h4>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" name="showEmail" checked={profile.showEmail} onChange={handleChange} />
                                        <span>Show email address on portfolio</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" name="showLocation" checked={profile.showLocation} onChange={handleChange} />
                                        <span>Show location on portfolio</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" name="showExperience" checked={profile.showExperience} onChange={handleChange} />
                                        <span>Show experience section</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                        💾 Save Portfolio Settings
                    </button>
                    <Link href={`/portfolio/${user?.uid}`}>
                        <a className="btn btn-outline" style={{ padding: '12px 24px' }}>
                            👁️ Preview Portfolio
                        </a>
                    </Link>
                    {status && <p style={{ color: status.includes('success') ? '#10b981' : '#ef4444', fontWeight: '500' }}>{status}</p>}
                </div>
            </form>
        </section>
    );
};


export default function Profile({ allProjects }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [completedProjects, setCompletedProjects] = useState([]);
  const [inProgressProjects, setInProgressProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = async () => {
    try { await auth.signOut(); router.push('/login'); } 
    catch (error) { console.error('Logout failed:', error); }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }

    const fetchUserProjects = async () => {
      try {
        setIsLoading(true);
        const q = query(collection(db, 'userProgress'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const inProgressList = [];
        const completedList = [];

        querySnapshot.forEach(doc => {
          const progressData = doc.data();
          const projectDetails = allProjects.find(p => p.id === progressData.projectId);
          if (projectDetails) {
            if (progressData.isCompleted) {
              completedList.push({ ...projectDetails, submissionUrl: progressData.submissionUrl });
            } else {
              inProgressList.push(projectDetails);
            }
          }
        });
        setInProgressProjects(inProgressList);
        setCompletedProjects(completedList);
      } catch (error) {
        console.error('Error fetching user projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProjects();
  }, [user, loading, router, allProjects]);

  if (loading || isLoading) {
    return <div className="loading-screen">Loading Dashboard...</div>;
  }

  return (
    <>
      <Navbar />
      <main className="container">
        <section className="dashboard-header">
          <h1>My Dashboard</h1>
          <p>Welcome back, <strong>{user?.email || ''}</strong>!</p>
          <Link href={`/portfolio/${user?.uid}`}><a className="btn btn-primary">View My Public Portfolio</a></Link>
          <button onClick={handleLogout} className="btn btn-logout" style={{marginTop: '10px'}}>Logout</button>
        </section>

        <PortfolioCustomizer user={user} />

        <section className="dashboard-content">
          <h2>In Progress</h2>
          {inProgressProjects.length > 0 ? (
            <div className="dashboard-grid">
              {inProgressProjects.map((project) => (
                <ProjectCard key={project.id} project={project} actionButtons={[{ label: 'Resume Project', onClick: () => router.push(`/project/${project.id}`), className: 'btn-primary' }]}/>
              ))}
            </div>
          ) : ( <p className="no-projects-message">No projects in progress. <Link href="/#projects"><a>Find a new challenge!</a></Link></p> )}
        </section>
      </main>
    </>
  );
}