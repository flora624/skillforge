import { useState } from 'react';

// Example MCQs (should be passed as props or fetched in a real app)
const defaultQuestions = [
  {
    question: 'What is the main purpose of this project?',
    options: ['To learn React', 'To practice CSS', 'To build a portfolio', 'To deploy a backend'],
    answer: 0,
  },
  {
    question: 'Which hook is used for state in React?',
    options: ['useState', 'useEffect', 'useContext', 'useRef'],
    answer: 0,
  },
  {
    question: 'What does CSS stand for?',
    options: ['Cascading Style Sheets', 'Computer Style Syntax', 'Creative Style System', 'Colorful Style Sheet'],
    answer: 0,
  },
  {
    question: 'Which method is used to fetch data in React?',
    options: ['fetch()', 'getData()', 'useFetch()', 'retrieve()'],
    answer: 0,
  },
  {
    question: 'What is a component in React?',
    options: ['A reusable piece of UI', 'A database', 'A CSS file', 'A server'],
    answer: 0,
  },
];

export default function MCQAssessment({ questions = defaultQuestions, onSubmit }) {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const handleOptionChange = (qIdx, oIdx) => {
    if (submitted) return;
    setAnswers(prev => {
      const copy = [...prev];
      copy[qIdx] = oIdx;
      return copy;
    });
  };

  const handleSubmit = () => {
    if (answers.some(a => a === null)) {
      alert('Please answer all questions.');
      return;
    }
    const correct = answers.filter((a, i) => a === questions[i].answer).length;
    const percent = Math.round((correct / questions.length) * 100);
    setScore(percent);
    setSubmitted(true);
    if (onSubmit) onSubmit({ answers, score: percent });
  };

  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: 32, maxWidth: 500, margin: '0 auto', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
      <h2 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: 24 }}>Project MCQ Assessment</h2>
      {questions.map((q, qIdx) => (
        <div key={qIdx} style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{qIdx + 1}. {q.question}</div>
          {q.options.map((opt, oIdx) => (
            <label key={oIdx} style={{ display: 'block', marginBottom: 4, cursor: submitted ? 'default' : 'pointer' }}>
              <input
                type="radio"
                name={`q${qIdx}`}
                value={oIdx}
                checked={answers[qIdx] === oIdx}
                onChange={() => handleOptionChange(qIdx, oIdx)}
                disabled={submitted}
                style={{ marginRight: 8 }}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}
      {!submitted ? (
        <button onClick={handleSubmit} style={{ background: '#3b82f6', color: 'white', fontWeight: 600, padding: '10px 32px', borderRadius: 6, border: 'none', fontSize: '1rem', cursor: 'pointer' }}>
          Submit
        </button>
      ) : (
        <div style={{ marginTop: 20, fontWeight: 600, color: score >= 60 ? '#16a34a' : '#dc2626', fontSize: '1.1rem' }}>
          Your Score: {score}%
        </div>
      )}
    </div>
  );
}
