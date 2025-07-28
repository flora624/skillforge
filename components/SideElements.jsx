// SideElements.jsx
import React, { useEffect, useState } from 'react';

const SideElements = ({ activeMilestoneIndex, isCompleted, totalMilestones }) => {
  const [timeSpent, setTimeSpent] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const skills = [
    { name: 'Problem Solving', progress: Math.min(75, (activeMilestoneIndex + 1) * 25) },
    { name: 'Code Design', progress: Math.min(60, activeMilestoneIndex * 20) },
    { name: 'Testing', progress: Math.min(45, activeMilestoneIndex * 15) }
  ];

  const tips = [
    "Break down complex problems into smaller parts",
    "Test your solution with edge cases",
    "Comment your code for clarity"
  ];

  const achievements = [];
  if (activeMilestoneIndex > 0) achievements.push('Quick Start');
  if (activeMilestoneIndex > 1) achievements.push('Problem Solver');
  if (isCompleted) achievements.push('Completed');

  return (
    <>
      {/* Floating Code Elements */}
      <div className="floating-elements">
        {['function solve() {', '  return result;', '}', 'console.log();'].map((code, index) => (
          <div 
            key={index}
            className="floating-code" 
            style={{
              left: index % 2 === 0 ? `${5 + index * 2}%` : 'auto',
              right: index % 2 === 1 ? `${5 + index * 2}%` : 'auto',
              animationDelay: `-${index * 3}s`
            }}
          >
            {code}
          </div>
        ))}
      </div>

      {/* Side Progress */}
      <div className="side-progress">
        {Array.from({ length: totalMilestones }, (_, i) => (
          <div 
            key={i}
            className={`progress-step ${i < activeMilestoneIndex ? 'completed' : ''} ${i === activeMilestoneIndex ? 'active' : ''}`}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Skills Panel */}
      <div className="skills-panel">
        <h4>Skills Building</h4>
        {skills.map((skill, index) => (
          <div key={index} className="skill-item">
            <span>{skill.name}</span>
            <div className="skill-progress">
              <div 
                className="skill-progress-bar" 
                style={{ '--progress': `${skill.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Tips Panel */}
      <div className="tips-panel">
        <h4>Pro Tips</h4>
        {tips.slice(0, Math.min(3, activeMilestoneIndex + 1)).map((tip, index) => (
          <div key={index} className="tip-item">{tip}</div>
        ))}
      </div>

      {/* Achievement Tracker */}
      <div className="achievement-tracker">
        <div className="time-tracker">Time: {timeSpent} min</div>
        <div className="achievement-badges">
          {achievements.map((badge, index) => (
            <span key={index} className="achievement-badge">{badge}</span>
          ))}
        </div>
      </div>

      {/* Code Widget */}
      <div className="code-widget">
        <div className="code-widget-header">
          <div className="traffic-light red"></div>
          <div className="traffic-light yellow"></div>
          <div className="traffic-light green"></div>
          <span>solution.js</span>
        </div>
        <div className="code-content">
  <div className="code-line">function twoSum(nums, target) {'{'}</div>
  <div className="code-line">  for (let i = 0; i {'<'} nums.length; i++) {'{'}</div>
  <div className="code-line">    // your code here</div>
  <div className="code-line">  {'}'}<span className="cursor"></span></div>
  <div className="code-line">{'}'}</div>
</div>

      </div>
    </>
    
  );
};

export default SideElements;