import { useState, useEffect, useRef } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function ScreenshotUpload({ userId, projectId, milestoneIndex, onUpload }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [error, setError] = useState('');
  const [expandedImage, setExpandedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Reset component state when milestone changes and check for existing screenshot
  useEffect(() => {
    setFile(null);
    setUploading(false);
    setError('');
    setExpandedImage(null);
    
    // Clear the file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Check if there's already an uploaded screenshot for this milestone
    const checkExistingScreenshot = async () => {
      if (userId && projectId) {
        try {
          const progressRef = doc(db, 'userProgress', `${userId}_${projectId}`);
          const progressSnap = await getDoc(progressRef);
          if (progressSnap.exists() && progressSnap.data().screenshots) {
            const existingUrl = progressSnap.data().screenshots[`milestone_${milestoneIndex}`];
            setUploadedUrl(existingUrl || null);
          } else {
            setUploadedUrl(null);
          }
        } catch (err) {
          console.error('Error checking existing screenshot:', err);
          setUploadedUrl(null);
        }
      }
    };

    checkExistingScreenshot();
  }, [milestoneIndex, userId, projectId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `screenshots/${userId}/${projectId}/milestone_${milestoneIndex}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setUploadedUrl(url);
      // Save screenshot URL in Firestore under userProgress as a nested object
      const progressRef = doc(db, 'userProgress', `${userId}_${projectId}`);
      // Get existing screenshots object
      const progressSnap = await getDoc(progressRef);
      let screenshots = {};
      if (progressSnap.exists() && progressSnap.data().screenshots) {
        screenshots = progressSnap.data().screenshots;
      }
      screenshots[`milestone_${milestoneIndex}`] = url;
      if (!progressSnap.exists()) {
        // Initialize the userProgress doc with required fields
        await setDoc(progressRef, {
          userId,
          projectId,
          isCompleted: false,
          screenshots,
          // Add any other required fields here (e.g., activeMilestone, startedAt, etc.)
        });
      } else {
        await setDoc(progressRef, { screenshots }, { merge: true });
      }
      if (onUpload) onUpload(url);
    } catch (err) {
      setError('Upload failed. Please try again.');
    }
    setUploading(false);
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <label style={{ fontWeight: 500 }}>Upload Screenshot for this Milestone:</label><br />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      <button onClick={handleUpload} disabled={uploading || !file} style={{ marginLeft: 10, padding: '6px 16px', borderRadius: 4, background: '#3b82f6', color: 'white', border: 'none', fontWeight: 500, cursor: uploading ? 'not-allowed' : 'pointer' }}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {uploadedUrl && (
        <div style={{ marginTop: 10 }}>
          <div style={{ color: '#16a34a', marginBottom: 8 }}>✓ Uploaded successfully!</div>
          <img 
            src={uploadedUrl} 
            alt="Uploaded screenshot" 
            style={{ 
              maxWidth: 200, 
              borderRadius: 8, 
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onClick={() => setExpandedImage(uploadedUrl)}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          />
          <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '4px 0 0 0', fontStyle: 'italic' }}>
            Click to expand
          </p>
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}

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
          onClick={() => setExpandedImage(null)}
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
              onClick={() => setExpandedImage(null)}
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
