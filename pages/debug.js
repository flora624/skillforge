import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export default function Debug() {
    const [firebaseConfig, setFirebaseConfig] = useState({});
    const [testData, setTestData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Show Firebase config (without sensitive data)
        setFirebaseConfig({
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
            apiKeyExists: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY
        });

        // Test Firebase connection
        const testFirebase = async () => {
            try {
                // Try to read a test document (this will fail gracefully if it doesn't exist)
                const testDocRef = doc(db, 'test', 'connection');
                const testDocSnap = await getDoc(testDocRef);
                setTestData({
                    connected: true,
                    documentExists: testDocSnap.exists(),
                    timestamp: new Date().toISOString()
                });
            } catch (err) {
                setError(err.message);
            }
        };

        testFirebase();
    }, []);

    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#f5f5f5', minHeight: '100vh' }}>
            <h1>Firebase Debug Page</h1>
            <p>This page helps debug Firebase connection issues between localhost and Vercel.</p>
            
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h2>Environment Variables</h2>
                <pre style={{ background: '#f8f8f8', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
                    {JSON.stringify(firebaseConfig, null, 2)}
                </pre>
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', background: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h2>Firebase Connection Test</h2>
                {error ? (
                    <div style={{ color: 'red', background: '#ffe6e6', padding: '1rem', borderRadius: '4px' }}>
                        <strong>Error:</strong> {error}
                    </div>
                ) : testData ? (
                    <div style={{ color: 'green', background: '#e6ffe6', padding: '1rem', borderRadius: '4px' }}>
                        <strong>Success:</strong> Firebase connection working
                        <pre style={{ marginTop: '0.5rem', background: '#f8f8f8', padding: '0.5rem', borderRadius: '4px' }}>
                            {JSON.stringify(testData, null, 2)}
                        </pre>
                    </div>
                ) : (
                    <div style={{ color: 'blue', background: '#e6f3ff', padding: '1rem', borderRadius: '4px' }}>
                        Testing Firebase connection...
                    </div>
                )}
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', background: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h2>Environment Info</h2>
                <ul>
                    <li><strong>Environment:</strong> {typeof window !== 'undefined' ? 'Client' : 'Server'}</li>
                    <li><strong>Node Environment:</strong> {process.env.NODE_ENV}</li>
                    <li><strong>Vercel Environment:</strong> {process.env.VERCEL_ENV || 'Not on Vercel'}</li>
                    <li><strong>Vercel URL:</strong> {process.env.VERCEL_URL || 'Not on Vercel'}</li>
                </ul>
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px' }}>
                <h2>Instructions</h2>
                <ol>
                    <li>Check this page on localhost - it should show your Firebase config</li>
                    <li>Deploy to Vercel and check this page again</li>
                    <li>If the config is different or missing on Vercel, add environment variables in Vercel dashboard</li>
                    <li>Go to Vercel Dashboard → Your Project → Settings → Environment Variables</li>
                    <li>Add all NEXT_PUBLIC_FIREBASE_* variables from your .env.local file</li>
                    <li>Redeploy your application</li>
                </ol>
            </div>
        </div>
    );
}