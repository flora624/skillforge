
import React from 'react';
import Head from 'next/head';

export default function TopSkillsFor2025() {
  return (
    <main className="container" style={{paddingTop: '3rem', paddingBottom: '3rem'}}>
      <Head>
        <title>Top Tech Skills to Learn in 2025 for Career Growth | SkillForge Blog</title>
        <meta name="description" content="Stay ahead in tech! Explore the most in-demand programming languages, frameworks, and soft skills for 2025." />
        <meta name="keywords" content="tech skills 2025, programming languages, frameworks, career growth, developer skills" />
        {/* Organization structured data for logo and site name */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "SkillForge",
              "url": "https://skillforgeprojects.vercel.app/",
              "logo": "https://skillforgeprojects.vercel.app/logo.png"
            })
          }}
        />
      </Head>
      <h1>Top Tech Skills to Learn in 2025 for Career Growth</h1>
      <article style={{maxWidth: 700, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '2rem'}}>
        <ul>
          <li><strong>JavaScript & TypeScript:</strong> Still essential for web and app development.</li>
          <li><strong>AI & Machine Learning:</strong> Skills in Python, TensorFlow, and AI APIs are in high demand.</li>
          <li><strong>Cloud Platforms:</strong> AWS, Azure, and Google Cloud skills open many doors.</li>
          <li><strong>Soft Skills:</strong> Communication, teamwork, and adaptability are more important than ever.</li>
          <li><strong>Frameworks:</strong> React, Next.js, and Node.js continue to dominate the job market.</li>
        </ul>
        <p>Keep learning and stay ahead of the curve with SkillForge's resources and community!</p>
      </article>
    </main>
  );
}
