// components/SubmissionModal.js

import React from 'react';

const SubmissionModal = ({ isOpen, onClose, content }) => {
  if (!isOpen) return null;

  return (
    // The overlay
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      {/* The modal content box */}
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '90%',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        position: 'relative',
      }}>
        <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>My Submission</h3>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{content}</p>
        <button 
          onClick={onClose} 
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#888'
          }}
        >×</button>
      </div>
    </div>
  );
};

export default SubmissionModal;