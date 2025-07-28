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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-adsense-account" content="ca-pub-6379719724029640" />
        <title>SkillForge - Build Your Career Portfolio</title>
        <meta name="description" content="Tackle real-world problems from every career domain. Build a portfolio that gets you hired." />
        
        {/* --- THIS IS THE NEW LINE YOU NEED TO ADD --- */}
        {/* It loads the Font Awesome CSS library for your entire app */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
          integrity="sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />

        {/* Organization structured data for logo and site name (for all pages) */}
        <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "SkillForgeProjects",
      "url": "https://skillforgeprojects.vercel.app",
      "logo": {
        "@type": "ImageObject",
        "url": "https://skillforgeprojects.vercel.app/logo.png"
      },
      "sameAs": [
        "https://www.instagram.com/skillforgeprojects",
        "https://www.youtube.com/@SkillForge-g4n",
      ]
    })
  }}
/>

      </Head>

      {/* Add class based on route */}
      <div className={isAuthPage ? 'auth-wrapper' : 'default-wrapper'}>
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}

export default MyApp;