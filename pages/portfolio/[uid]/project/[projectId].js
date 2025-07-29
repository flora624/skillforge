import { useState } from 'react';
import { db } from '../../../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { promises as fs } from 'fs';
import path from 'path';
import Navbar from '../../../../components/Navbar';

// Generate static paths for all possible combinations
export async function getStaticPaths() {
  // Return empty paths to generate pages on-demand
  return {
    paths: [],
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }) {
  const { uid, projectId } = params;
  
  // Initialize return data with safe defaults
  let project = null;
  let mcq = null;
  let approach = null;
  let screenshots = {};
  let userId = uid;

  if (!uid || !projectId) {
    return { notFound: true };
  }

  try {
    // Get user progress for this project
    const progressRef = doc(db, 'userProgress', `${uid}_${projectId}`);
    const progressSnap = await getDoc(progressRef);
    
    if (!progressSnap.exists()) {
      return { notFound: true };
    }
    
    const progress = progressSnap.data();

    // Get project details
    const projectsFilePath = path.join(process.cwd(), 'data', 'projects.json');
    const jsonData = await fs.readFile(projectsFilePath, 'utf8');
    const allProjects = JSON.parse(jsonData);
    const foundProject = allProjects.find(p => p.id === progress.projectId);
    
    if (!foundProject) {
      return { notFound: true };
    }

    project = foundProject;
    mcq = progress.mcq || null;
    approach = progress.submissionUrl || null;
    screenshots = progress.screenshots || {};

    return {
      props: {
        project,
        mcq,
        approach,
        screenshots,
        userId
      },
      // Revalidate every 60 seconds to keep data fresh
      revalidate: 60
    };
  } catch (error) {
    console.error('Error fetching project portfolio data:', error);
    return { notFound: true };
  }
}

function MCQAnswersView({ project, mcq }) {
  if (!mcq || !mcq.answers || !Array.isArray(mcq.answers)) return <p>No MCQ answers found.</p>;
  // Rebuild the questions for this project (same logic as in main app)
  function getProjectMCQs(project) {
    const questions = [
      {
        question: 'What is the main purpose of this project?',
        options: [project.problemStatement, project.solution, project.title, project.domain],
        answer: 1
      }
    ];
    if (project.techStack && project.techStack.length > 0) {
      questions.push({
        question: 'Which technology is used in the tech stack for this project?',
        options: project.techStack.slice(0, 4).map(t => t.name),
        answer: 0
      });
    }
    if (project.milestones && project.milestones.length > 0) {
      questions.push({
        question: 'What is the first milestone of this project?',
        options: project.milestones.slice(0, 4).map(m => m.title),
        answer: 0
      });
    }
    if (project.skillsGained && project.skillsGained.length > 0) {
      questions.push({
        question: 'Which of the following is a skill gained from this project?',
        options: project.skillsGained.slice(0, 4),
        answer: 0
      });
    }
    if (project.domain) {
      questions.push({
        question: 'What is the domain of this project?',
        options: [project.domain, 'Frontend', 'Backend', 'Mobile'],
        answer: 0
      });
    }
    while (questions.length < 5) {
      questions.push({
        question: 'Select the correct answer.',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        answer: 0
      });
    }
    return questions;
  }
  const questions = getProjectMCQs(project);
  return (
    <div style={{ marginTop: 32 }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>MCQ Answers</h3>
      {questions.map((q, idx) => (
        <div key={idx} style={{ marginBottom: 18, background: '#f3f4f6', borderRadius: 8, padding: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>{idx + 1}. {q.question}</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {q.options.map((opt, oIdx) => (
              <li key={oIdx} style={{
                color: mcq.answers[idx] === oIdx ? (oIdx === q.answer ? '#16a34a' : '#dc2626') : '#334155',
                fontWeight: mcq.answers[idx] === oIdx ? 600 : 400
              }}>
                {opt} {oIdx === q.answer ? <span style={{ color: '#16a34a', fontWeight: 700 }}> (Correct)</span> : null}
                {mcq.answers[idx] === oIdx ? <span style={{ color: oIdx === q.answer ? '#16a34a' : '#dc2626', fontWeight: 700 }}> {oIdx === q.answer ? '✓' : '✗'}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div style={{ marginTop: 18, fontWeight: 600, color: mcq.score >= 60 ? '#16a34a' : '#dc2626' }}>
        Score: {mcq.score}%
      </div>
    </div>
  );
}

function ContentRenderer({ block }) {
  switch (block.type) {
    case 'paragraph':
      return <p style={{ fontSize: '1.05rem', color: '#374151', lineHeight: '1.7', margin: '0 0 16px 0' }}>{block.value}</p>;
    case 'subheader':
      return <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', margin: '28px 0 12px 0', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px' }}>{block.value}</h4>;
    case 'code':
      return (
        <pre style={{ background: '#f8fafc', color: '#1f2937', padding: '16px', borderRadius: '6px', margin: '0 0 16px 0', whiteSpace: 'pre-wrap', fontFamily: 'Monaco, Consolas, "Courier New", monospace', fontSize: '13px', border: '1px solid #e5e7eb', overflow: 'auto' }}>
          <code>{block.value}</code>
        </pre>
      );
    case 'image':
      return (
        <img src={block.src} alt={block.alt || 'Project visual'} style={{ maxWidth: '100%', borderRadius: '8px', margin: '16px 0', border: '1px solid #e5e7eb' }} />
      );
    case 'callout':
      const calloutColors = {
        info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
        warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' },
        success: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
        error: { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626' }
      };
      const colors = calloutColors[block.style] || calloutColors.info;
      return (
        <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '12px', margin: '16px 0', color: colors.text }}>
          <p style={{ margin: 0, fontSize: '0.97rem', lineHeight: '1.6' }}>{block.value}</p>
        </div>
      );
    default:
      return null;
  }
}

export default function ProjectPortfolioView({ project, mcq, approach, screenshots }) {
  const [expandedImage, setExpandedImage] = useState(null);

  const openImageModal = (imageUrl) => {
    setExpandedImage(imageUrl);
  };

  const closeImageModal = () => {
    setExpandedImage(null);
  };

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 40 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>{project.title}</h1>
        <p style={{ color: '#475569', fontSize: '1.1rem', marginBottom: 18 }}>{project.tagline}</p>
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 12 }}>Project Approach & Milestones</h3>
          {project.milestones && project.milestones.length > 0 ? (
            project.milestones.map((ms, idx) => (
              <div key={ms.id} style={{ marginBottom: 32, borderBottom: '1px solid #e5e7eb', paddingBottom: 24 }}>
                <h4 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#2563eb', marginBottom: 6 }}>{ms.title}</h4>
                <div style={{ color: '#334155', fontSize: '1rem', marginBottom: 8 }}><strong>Goal:</strong> {ms.goal}</div>
                {ms.content && ms.content.map((block, i) => <ContentRenderer key={i} block={block} />)}
                {(screenshots && (screenshots[`milestone_${idx}`] || screenshots[ms.id])) && (
                  <div style={{
                    marginTop: 18,
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 8,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ color: '#166534', fontWeight: 600, marginBottom: 8, fontSize: '1.05rem' }}>Student's Answer</div>
                    <img 
                      src={screenshots[`milestone_${idx}`] || screenshots[ms.id]} 
                      alt={`Milestone ${idx + 1} Screenshot`} 
                      style={{ 
                        maxWidth: 340, 
                        borderRadius: 8, 
                        border: '1px solid #e5e7eb', 
                        marginBottom: 4,
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                      }}
                      onClick={() => openImageModal(screenshots[`milestone_${idx}`] || screenshots[ms.id])}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                    <p style={{ fontSize: '0.85rem', color: '#166534', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                      Click to expand
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : <p>No milestones found.</p>}
        </div>
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 12 }}>MCQ Answers</h3>
          <MCQAnswersLineView project={project} mcq={mcq} />
        </div>
      </div>

      {/* Image Modal */}
      {expandedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'pointer'
          }}
          onClick={closeImageModal}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img 
              src={expandedImage} 
              alt="Expanded screenshot" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
                borderRadius: 8,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={closeImageModal}
              style={{
                position: 'absolute',
                top: -10,
                right: -10,
                background: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                color: '#333'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MCQAnswersLineView({ project, mcq }) {
  if (!mcq || !mcq.answers || !Array.isArray(mcq.answers)) return <p>No MCQ answers found.</p>;
  function getProjectMCQs(project) {
    const questions = [
      {
        question: 'What is the main purpose of this project?',
        options: [project.problemStatement, project.solution, project.title, project.domain],
        answer: 1
      }
    ];
    if (project.techStack && project.techStack.length > 0) {
      questions.push({
        question: 'Which technology is used in the tech stack for this project?',
        options: project.techStack.slice(0, 4).map(t => t.name),
        answer: 0
      });
    }
    if (project.milestones && project.milestones.length > 0) {
      questions.push({
        question: 'What is the first milestone of this project?',
        options: project.milestones.slice(0, 4).map(m => m.title),
        answer: 0
      });
    }
    if (project.skillsGained && project.skillsGained.length > 0) {
      questions.push({
        question: 'Which of the following is a skill gained from this project?',
        options: project.skillsGained.slice(0, 4),
        answer: 0
      });
    }
    if (project.domain) {
      questions.push({
        question: 'What is the domain of this project?',
        options: [project.domain, 'Frontend', 'Backend', 'Mobile'],
        answer: 0
      });
    }
    while (questions.length < 5) {
      questions.push({
        question: 'Select the correct answer.',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        answer: 0
      });
    }
    return questions;
  }
  const questions = getProjectMCQs(project);
  return (
    <div>
      {questions.map((q, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, fontSize: '1rem', color: '#334155' }}>
          <span style={{ fontWeight: 600, marginRight: 8 }}>{idx + 1}.</span>
          <span style={{ flex: 1 }}>{q.question}</span>
          <span style={{ marginLeft: 12, color: mcq.answers[idx] === q.answer ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
            {q.options[mcq.answers[idx]] || 'No answer'}
            {typeof mcq.answers[idx] === 'number' ? (mcq.answers[idx] === q.answer ? ' ✓' : ' ✗') : ''}
          </span>
        </div>
      ))}
      <div style={{ marginTop: 10, fontWeight: 600, color: mcq.score >= 60 ? '#16a34a' : '#dc2626' }}>
        Score: {mcq.score}%
      </div>
    </div>
  );
}