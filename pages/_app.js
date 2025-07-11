import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar'; // <-- We will render the Navbar here
import '../styles/globals.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <title>SkillForge - Build Your Career Portfolio</title>
        <meta name="description" content="Tackle real-world problems inspired by top tech companies. Build a portfolio that gets you hired." />
        <script src="https://kit.fontawesome.com/3a4339b972.js" crossOrigin="anonymous" async></script>
      </Head>
      
      {/* The Navbar now lives here, ensuring it always has access to the auth context */}
      <Navbar />

      {/* The actual page component (like index.js or explore.js) goes here */}
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;