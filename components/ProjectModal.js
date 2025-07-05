import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function ProjectModal({ project, onClose }) {
  const [studentSummary, setStudentSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    // Reset state when project changes or modal opens
    setStudentSummary('');
    setIsLoading(false);
    setAiResult(null);
    setIsCompleted(false);

    const checkCompletion = async () => {
      if (user && project) {
        const completionRef = doc(db, 'completions', `${user.uid}_${project.id}`);
        const docSnap = await getDoc(completionRef);
        if (docSnap.exists()) {
          setIsCompleted(true);
        }
      }
    };
    checkCompletion();
  }, [user, project]);

  const handleCheckWork = async () => {
    if (!user) {
      alert('Please log in or sign up to submit your work!');
      return;
    }
    if (studentSummary.trim().length < 50) {
      alert('Please provide a more detailed summary of your approach (at least 50 characters).');
      return;
    }

    setIsLoading(true);
    setAiResult(null);

    try {
      const response = await fetch('/api/validate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentSummary: studentSummary,
          originalSolution: project.solution.approach,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a response from the AI.');
      }
      
      const data = await response.json();
      setAiResult(data);

      if (data.verdict === 'Correct') {
        const completionRef = doc(db, 'completions', `${user.uid}_${project.id}`);
        await setDoc(completionRef, {
          userId: user.uid,
          projectId: project.id,
          completedAt: new Date(),
        });
        setIsCompleted(true);
      }
    } catch (error) {
      console.error("Error during validation: ", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!project) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>×</span>
        <h2 id="modal-title">{project.title}</h2>
        <div className="modal-meta">
          <span><i className="fas fa-folder"></i> {project.domain}</span> | <span className={`tag difficulty-${project.difficulty}`}>{project.difficulty}</span>
        </div>
        <hr />
        <h3><i className="fas fa-bullseye"></i> Problem Statement</h3>
        <p>{project.problemStatement}</p>
        <h3><i className="fas fa-check-circle"></i> Key Objectives</h3>
        <ul>{project.objectives.map((obj, i) => <li key={i}>{obj}</li>)}</ul>
        <h3><i className="fas fa-clipboard-list"></i> Required Deliverables</h3>
        <ul>{project.deliverables.map((del, i) => <li key={i}>{del}</li>)}</ul>
        <h3><i className="fas fa-book"></i> Helpful Resources</h3>
        <ul>{project.resources.map((res, i) => <li key={i}><a href={res.link} target="_blank" rel="noopener noreferrer">{res.title}</a></li>)}</ul>

        <hr />
        
        {isCompleted ? (
          <div className="verdict-box verdict-correct">
            <strong><i className="fas fa-check-circle"></i> Project Completed!</strong>
            <p>You've successfully completed this project and this achievement is saved to your account.</p>
          </div>
        ) : !aiResult ? (
          <div id="submission-section">
            <h3>Describe Your Approach</h3>
            <p>Briefly explain the steps you took. The AI will compare your process to the ideal solution. (Min. 50 characters)</p>
            <textarea
              placeholder="e.g., I started by cleaning the data using Pandas, then grouped by customer ID to calculate total sales..."
              value={studentSummary}
              onChange={(e) => setStudentSummary(e.target.value)}
              disabled={isLoading}
            />
            <button onClick={handleCheckWork} disabled={isLoading} className="btn btn-primary btn-block">
              {isLoading ? 'AI is Thinking...' : 'Check My Work'}
            </button>
          </div>
        ) : null}

        {aiResult && (
          <div id="solution-section">
            <div className={`verdict-box verdict-${aiResult.verdict.toLowerCase()}`}>
              <strong>AI Verdict:</strong> Your approach seems to be <strong>{aiResult.verdict}</strong>!
            </div>
            
            <div className="solution-box">
              <h3><i className="fas fa-lightbulb"></i> Project Solution & Approach</h3>
              <p dangerouslySetInnerHTML={{ __html: `<strong>Approach:</strong><br>${project.solution.approach.replace(/\n/g, '<br>')}<br><br><strong>Key Takeaways:</strong><br>${project.solution.keyTakeaways}` }}></p>
            </div>
            
            {aiResult.verdict === 'Correct' && (
              <div className="resume-box">
                <h3><i className="fas fa-id-card"></i> Add to Your Resume</h3>
                <p>Congratulations! Copy this text for your resume or LinkedIn.</p>
                <div className="resume-text-content">
                  {project.resumeText}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}