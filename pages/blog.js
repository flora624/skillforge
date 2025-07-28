import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';

const blogPosts = [
  {
    slug: 'build-job-winning-portfolio',
    title: 'How to Build a Job-Winning Portfolio with Real Projects',
    category: 'Career',
    author: 'SkillForge Team',
    date: 'July 2024',
    readTime: '5 min read',
    image: '/blog/portfolio-projects.jpg',
    excerpt: 'Discover why hands-on projects are the key to landing your dream job. Learn how to showcase your skills, stand out to employers, and build a portfolio that gets you hired in tech.'
  },
  {
    slug: 'top-7-in-demand-tech-skills-2024',
    title: 'Top 7 In-Demand Tech Skills to Learn in 2024',
    category: 'Learning',
    author: 'SkillForge Team',
    date: 'June 2024',
    readTime: '4 min read',
    image: '/blog/tech-skills-2024.jpg',
    excerpt: 'Stay ahead in your tech career! Explore the most valuable skills employers want this year, from AI to cloud computing, and how you can master them with real-world projects.'
  },
  {
    slug: 'ultimate-guide-project-based-education',
    title: 'The Ultimate Guide to Learning by Doing: Project-Based Education',
    category: 'Education',
    author: 'SkillForge Team',
    date: 'May 2024',
    readTime: '6 min read',
    image: '/blog/project-based-learning.jpg',
    excerpt: 'Traditional learning is out, project-based learning is in! Find out how building real solutions accelerates your growth and prepares you for the tech industry.'
  },
  {
    slug: 'ace-technical-interviews-portfolio-projects',
    title: 'How to Ace Technical Interviews with Portfolio Projects',
    category: 'Career',
    author: 'SkillForge Team',
    date: 'April 2024',
    readTime: '5 min read',
    image: '/blog/technical-interview.jpg',
    excerpt: 'Technical interviews are tough, but your portfolio can be your secret weapon. Learn how to present your projects, explain your process, and impress interviewers.'
  },
  {
    slug: 'from-theory-to-practice-real-world-projects',
    title: 'From Theory to Practice: Why Real-World Projects Matter',
    category: 'Learning',
    author: 'SkillForge Team',
    date: 'March 2024',
    readTime: '4 min read',
    image: '/blog/theory-to-practice.jpg',
    excerpt: 'Textbooks teach you concepts, but projects teach you skills. See how applying knowledge in real scenarios bridges the gap between learning and doing.'
  },
  {
    slug: 'kickstart-your-tech-career-roadmap',
    title: 'Kickstart Your Tech Career: A Beginner’s Roadmap',
    category: 'Career',
    author: 'SkillForge Team',
    date: 'February 2024',
    readTime: '5 min read',
    image: '/blog/tech-career-roadmap.jpg',
    excerpt: 'New to tech? This step-by-step roadmap covers everything from choosing your first language to building your first project and landing your first job.'
  }
];

const categories = ['All', 'Career', 'Learning', 'Education'];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredPosts = selectedCategory === 'All'
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <>
      <Head>
        <title>SkillForge Blog | Learn, Build, and Grow Your Tech Career</title>
        <meta name="description" content="Read the latest on project-based learning, tech skills, and career growth. SkillForge Blog helps you turn theory into real-world skills and land your dream job." />
        <meta name="keywords" content="SkillForge, tech blog, project-based learning, portfolio, tech skills, career, education, learning by doing, technical interview, real-world projects" />
        <meta property="og:title" content="SkillForge Blog | Learn, Build, and Grow Your Tech Career" />
        <meta property="og:description" content="Read the latest on project-based learning, tech skills, and career growth. SkillForge Blog helps you turn theory into real-world skills and land your dream job." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://your-skillforge-domain.com/blog" />
        <meta property="og:image" content="/blog/skillforge-blog-og.jpg" />
      </Head>
      <Navbar />
      <div className="blog-hero">
        <h1 className="blog-title">SkillForge Blog</h1>
        <p className="blog-subtitle">Project-based learning, tech skills, and career advice for future builders.</p>
      </div>
      <div className="blog-categories">
        {categories.map(cat => (
          <button
            key={cat}
            className={`blog-category-btn${selectedCategory === cat ? ' active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="blog-grid">
        {filteredPosts.map(post => (
          <div className="blog-card" key={post.id}>
            <div className="blog-card-img-wrap">
              <img src={post.image} alt={post.title} className="blog-card-img" />
            </div>
            <div className="blog-card-content">
              <span className="blog-card-category">{post.category}</span>
              <h2 className="blog-card-title">{post.title}</h2>
              <div className="blog-card-meta">
                <span>{post.author}</span> | <span>{post.date}</span> | <span>{post.readTime}</span>
              </div>
              <p className="blog-card-excerpt">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`}><a className="blog-card-readmore">Read More →</a></Link>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .blog-hero {
          background: #f8fafc;
          padding: 48px 0 24px 0;
          text-align: center;
        }
        .blog-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 10px;
        }
        .blog-subtitle {
          color: #6b7280;
          font-size: 1.2rem;
          margin-bottom: 0;
        }
        .blog-categories {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin: 32px 0 24px 0;
          flex-wrap: wrap;
        }
        .blog-category-btn {
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 20px;
          padding: 8px 22px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .blog-category-btn.active, .blog-category-btn:hover {
          background: #3b82f6;
          color: #fff;
        }
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto 60px auto;
          padding: 0 24px;
        }
        .blog-card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.06);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.2s;
        }
        .blog-card:hover {
          box-shadow: 0 6px 32px rgba(59,130,246,0.10);
        }
        .blog-card-img-wrap {
          width: 100%;
          height: 210px;
          overflow: hidden;
        }
        .blog-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .blog-card-content {
          padding: 24px 20px 20px 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .blog-card-category {
          color: #3b82f6;
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .blog-card-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 10px 0;
        }
        .blog-card-meta {
          color: #64748b;
          font-size: 0.98rem;
          margin-bottom: 12px;
        }
        .blog-card-excerpt {
          color: #374151;
          font-size: 1.05rem;
          margin-bottom: 18px;
          flex: 1;
        }
        .blog-card-readmore {
          color: #3b82f6;
          font-weight: 600;
          text-decoration: none;
          font-size: 1.05rem;
          align-self: flex-start;
          transition: color 0.2s;
        }
        .blog-card-readmore:hover {
          color: #1d4ed8;
        }
      `}</style>
    </>
  );
}
