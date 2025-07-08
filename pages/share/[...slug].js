import { db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '../../components/Navbar';

// This function runs on the server to fetch the data for a specific share link
export async function getServerSideProps(context) {
    const { slug } = context.params;
    const [userId, projectId] = slug;

    if (!userId || !projectId) {
        return { notFound: true };
    }

    try {
        const completionRef = doc(db, "completions", `${userId}_${projectId}`);
        const completionSnap = await getDoc(completionRef);

        if (!completionSnap.exists()) {
            return { notFound: true };
        }

        // We need to convert the Firestore Timestamp to a simple string
        const completionData = completionSnap.data();
        const submission = {
            ...completionData,
            completedAt: completionData.completedAt.toDate().toLocaleDateString(),
        };

        return {
            props: { submission },
        };
    } catch (error) {
        console.error("Error fetching shared submission:", error);
        return { notFound: true };
    }
}


export default function SharePage({ submission }) {
    if (!submission) {
        return <div>Submission not found.</div>;
    }

    return (
        <>
            <Navbar />
            <div className="share-page-container">
                <div className="share-card">
                    <header className="share-header">
                        <h1>{submission.projectTitle}</h1>
                        <p>A project completed by a SkillForge user.</p>
                    </header>
                    <main className="share-content">
                        <h3>User's Submission Summary:</h3>
                        <p className="submission-text">
                            {submission.submissionSummary}
                        </p>
                    </main>
                    <footer className="share-footer">
                        <p>Completed on: {submission.completedAt}</p>
                        <a href="/" className="btn btn-primary">Explore more projects on SkillForge</a>
                    </footer>
                </div>
            </div>
        </>
    );
}