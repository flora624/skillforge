import React from 'react';
import Link from 'next/link';

const posts = [
  {
    slug: 'project-based-learning-benefits',
    title: '5 Benefits of Project-Based Learning for Developers',
    summary: 'Discover how project-based learning accelerates your coding skills, builds your portfolio, and prepares you for real-world jobs.',
    keywords: 'project-based learning, coding, developer portfolio, real-world skills, programming jobs',
  },
  {
    slug: 'top-skills-for-2025',
    title: 'Top Tech Skills to Learn in 2025 for Career Growth',
    summary: 'Stay ahead in tech! Explore the most in-demand programming languages, frameworks, and soft skills for 2025.',
    keywords: 'tech skills 2025, programming languages, frameworks, career growth, developer skills',
  },
];

export default function Blog() {
  return (
    <main className="container" style={{paddingTop: '3rem', paddingBottom: '3rem'}}>
      <h1 style={{textAlign: 'center', marginBottom: '2rem'}}>Blog</h1>
      <section style={{maxWidth: 700, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '2rem'}}>
        <h2>Latest Articles</h2>
        <ul style={{listStyle: 'none', padding: 0}}>
          {posts.map(post => (
            <li key={post.slug} style={{marginBottom: '2rem'}}>
              <h3>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              <p>{post.summary}</p>
              <small style={{color: '#888'}}>Keywords: {post.keywords}</small>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
