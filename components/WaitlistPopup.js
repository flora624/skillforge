import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const WaitlistPopup = () => {
  const [isOpen, setIsOpen] = useState(true); // Control visibility
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      // Add to Firestore 'waitlist' collection
      await addDoc(collection(db, 'waitlist'), {
        email,
        createdAt: serverTimestamp(),
        source: 'website_popup'
      });
      
      setSubmitted(true);
      setError('');
      setEmail('');
    } catch (err) {
      console.error('Error adding to waitlist: ', err);
      setError('Failed to submit. Please try again.');
    }
  };
  

  if (submitted) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <p>Thanks for joining! We'll be in touch soon.</p>
      </div>
    );
  }

  if (!isOpen) return (<p>Success!</p>);

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2>Join the Waitlist</h2>
        <p>Be the first to know when we launch new features!</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Join Now</button>
        </form>
      </div>
    </div>
  );
}

export default WaitlistPopup;
