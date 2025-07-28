import React from 'react';

export default function ProjectSummaryCard({ project, submissionUrl, completedAt, screenshotUrl, onView }) {
  return (
    <div style={{
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: 10,
      padding: 32,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 260
    }}>
      <div>
        {screenshotUrl && (
          <img src={screenshotUrl} alt="Project Screenshot" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, marginBottom: 14, border: '1px solid #e5e7eb' }} />
        )}
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>{project.title}</h3>
        <p style={{ color: '#475569', fontSize: '1rem', marginBottom: 12 }}>{project.tagline}</p>
        <div style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: 10 }}>
          <strong>Completed:</strong> {completedAt ? new Date(completedAt).toLocaleDateString() : 'N/A'}
        </div>
        <div style={{ color: '#334155', fontSize: '0.98rem', marginBottom: 10 }}>
          <strong>What I did:</strong> {submissionUrl ? (submissionUrl.startsWith('http') ? 'Deployed a live demo.' : submissionUrl) : 'Project summary not provided.'}
        </div>
      </div>
      <button
        onClick={onView}
        style={{
          marginTop: 16,
          background: '#3b82f6',
          color: 'white',
          fontWeight: 600,
          padding: '10px 24px',
          borderRadius: 6,
          border: 'none',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
      >
        View Project Details
      </button>
    </div>
  );
}
