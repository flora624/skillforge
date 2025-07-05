import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Navbar from '../../components/Navbar';

// --- Server-side functions to get project data ---
export async function getStaticProps({ params }) {
  const allProjects = require('../../public/projects.json');
  const project = allProjects.find(p => p.id.toString() === params.id);
  return { props: { project } };
}

export async function getStaticPaths() {
  const allProjects = require('../../public/projects.json');
  const paths = allProjects.map(p => ({ params: { id: p.id.toString() } }));
  return { paths, fallback: false };
}

// --- The Main Page Component ---
export default function ProjectWorkspace({ project }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [progress, setProgress] = useState(null);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(0);
  const [submission, setSubmission] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Effect to fetch or create project progress for the user
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const progressRef = doc(db, 'project_progress', `${user.uid}_${project.id}`);
    
    const getProgress = async () => {
      const docSnap = await getDoc(progressRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProgress(data);
        // Determine which milestone to show
        const firstIncompleteIndex = project.milestones.findIndex(ms => !data.milestone_submissions?.[ms.id]?.status);
        setActiveMilestoneIndex(firstIncompleteIndex >= 0 ? firstIncompleteIndex : project.milestones.length);
      } else {
        // Start new progress
        const newProgress = { userId: user.uid, projectId: project.id, status: 'in_progress', milestone_submissions: {} };
        await setDoc(progressRef, newProgress);
        setProgress(newProgress);
        setActiveMilestoneIndex(0);
      }
      setIsLoading(false);
    };

    getProgress();
  }, [user, loading, project.id, router]);


  // Function to handle milestone submission
  const handleMilestoneSubmit = async () => {
    if (!submission) {
      alert("Please provide a submission.");
      return;
    }

    const milestoneId = project.milestones[activeMilestoneIndex].id;
    
    // In a real app, you would have more complex evaluation logic here.
    // For now, we'll just mark it as completed.
    const evaluationResult = 'pass'; 

    const updatedProgress = {
      ...progress,
      milestone_submissions: {
        ...progress.milestone_submissions,
        [milestoneId]: {
          status: "completed",
          submittedAt: new Date(),
          submissionContent: submission,
          evaluationResult: evaluationResult,
        }
      }
    };

    const progressRef = doc(db, 'project_progress', `${user.uid}_${project.id}`);
    await setDoc(progressRef, updatedProgress, { merge: true });

    setProgress(updatedProgress);
    setSubmission(''); // Clear submission box
    
    // Move to next milestone or quiz
    if (activeMilestoneIndex < project.milestones.length - 1) {
      setActiveMilestoneIndex(activeMilestoneIndex + 1);
    } else {
      setActiveMilestoneIndex(project.milestones.length); // Mark all as done
    }
  };


  if (isLoading || !progress) {
    return <div>Loading Workspace...</div>;
  }

  const allMilestonesCompleted = activeMilestoneIndex >= project.milestones.length;

  return (
    <>
      <Navbar />
      <div className="workspace-container">
        {/* --- Sidebar for Milestones --- */}
        <div className="project-sidebar">
          <h3>{project.title}</h3>
          <ul className="milestone-list">
            {project.milestones.map((ms, index) => {
              const status = progress.milestone_submissions?.[ms.id]?.status;
              return (
                <li key={ms.id} className={`milestone-item ${index === activeMilestoneIndex ? 'active' : ''} ${status === 'completed' ? 'completed' : ''}`}>
                  <span className="milestone-icon">{status === 'completed' ? '✓' : '●'}</span>
                  {ms.title}
                </li>
              );
            })}
             <li className={`milestone-item ${allMilestonesCompleted ? 'active' : ''}`}>
              <span className="milestone-icon">{allMilestonesCompleted ? '●' : '●'}</span>
              Reflection & Quiz
            </li>
          </ul>
        </div>

        {/* --- Main Content Area --- */}
        <div className="milestone-content">
          {!allMilestonesCompleted ? (
            // --- Displaying an Active Milestone ---
            <div>
              <h2>{project.milestones[activeMilestoneIndex].title}</h2>
              <p className="milestone-goal"><strong>Goal:</strong> {project.milestones[activeMilestoneIndex].goal}</p>
              <div className="instructions">
                <h4>Instructions</h4>
                <p>{project.milestones[activeMilestoneIndex].instructions}</p>
              </div>
              <div className="submission-area">
                <h4>Your Submission</h4>
                <textarea 
                  value={submission}
                  onChange={(e) => setSubmission(e.target.value)}
                  placeholder={`Paste your ${project.milestones[activeMilestoneIndex].submissionType} here...`}
                />
                <button onClick={handleMilestoneSubmit} className="btn btn-primary">Submit Milestone</button>
              </div>
            </div>
          ) : (
            // --- Displaying the Reflection & Quiz ---
            <div>
              <h2>Reflection & Quiz</h2>
              <p className="milestone-goal">Complete this final step to unlock your resume text and badge.</p>
              {/* Future implementation: Render the quiz questions here */}
              <div className="resume-box">
                <h3><i className="fas fa-id-card"></i> Your Resume Text is Unlocked!</h3>
                <p>Congratulations on completing all milestones!</p>
                <div className="resume-text-content">
                  {project.resumeText}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}