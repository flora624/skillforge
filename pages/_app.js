import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';
import Head from 'next/head';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Detect login or signup route
  const isAuthPage = router.pathname === '/login' || router.pathname === '/signup';

  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="google-adsense-account" content="ca-pub-6379719724029640" />
        <title>SkillForge - Build Your Career Portfolio</title>
        <meta name="description" content="Tackle real-world problems from every career domain. Build a portfolio that gets you hired." />
      </Head>

      {/* Add class based on route */}
      <div className={isAuthPage ? 'auth-wrapper' : 'default-wrapper'}>
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}

export default MyApp;
