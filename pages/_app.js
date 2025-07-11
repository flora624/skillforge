import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    // This <AuthProvider> is the "main power switch".
    // It MUST wrap the <Component /> for the login state to work globally.
    <AuthProvider>
      <Head>
        <title>SkillForge - Build Your Career Portfolio</title>
        <meta name="description" content="Tackle real-world problems inspired by top tech companies. Build a portfolio that gets you hired." />
        {/* The Font Awesome script for icons */}
        <script src="https://kit.fontawesome.com/3a4339b972.js" crossOrigin="anonymous" async></script>
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;