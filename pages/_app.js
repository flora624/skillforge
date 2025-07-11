import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <meta name="google-adsense-account" content="ca-pub-6379719724029640"></meta>
        <title>SkillForge - Build Your Career Portfolio</title>
        <meta name="description" content="Tackle real-world problems from every career domain. Build a portfolio that gets you hired." />
      </Head>
      {/* The failing Font Awesome script has been REMOVED */}
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;