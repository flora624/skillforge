import React from 'react';
import Head from 'next/head';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/router';

const blogPosts = [
  {
    slug: 'build-job-winning-portfolio',
    title: 'How to Build a Job-Winning Portfolio with Real Projects',
    category: 'Career',
    author: 'SkillForge Team',
    date: 'July 2024',
    readTime: '7 min read',
    image: '/blog/portfolio-projects.jpg',
    excerpt: 'Discover why hands-on projects are the key to landing your dream job. Learn how to showcase your skills, stand out to employers, and build a portfolio that gets you hired in tech.',
    content: `
      <div class="blog-zomato-layout">
        <div class="blog-lead-quote">
          <span>“A portfolio is not just a collection of work—it's your story, your proof, and your invitation to opportunity.”</span>
        </div>
        <p><strong>Imagine this:</strong> You’re applying for your dream tech job. The recruiter opens your portfolio and, instead of a list of courses or certificates, they see real, working projects—each one telling a story of your skills, creativity, and drive. That’s the SkillForge difference.</p>
        <div class="blog-section-divider"></div>
        <h2>Why Real Projects Are Your Secret Weapon</h2>
        <p>In a world where everyone claims to “know Python” or “understand web development,” what sets you apart? <strong>Proof.</strong> Real projects are living proof that you can turn theory into results. They show you can:</p>
        <ul>
          <li>Take an idea from concept to completion</li>
          <li>Work with modern tools and frameworks</li>
          <li>Overcome real-world challenges (not just textbook problems)</li>
          <li>Communicate your process and decisions</li>
        </ul>
        <div class="blog-section-divider"></div>
        <h2>From Blank Page to Portfolio Star: Priya’s Story</h2>
        <p><strong>Meet Priya.</strong> She started with zero experience, but by building a “Smart Expense Tracker” project, she learned React, Node.js, and MongoDB. She documented her journey, shared her code on GitHub, and wrote a blog post about the toughest bug she fixed. When she interviewed, her project was the centerpiece—she walked recruiters through her code, her design choices, and the lessons she learned. She got the job.</p>
        <blockquote class="blog-blockquote">“I never thought a single project could change my life. But it did. My SkillForge project was the reason I got noticed.”<br/><span>— Priya, SkillForge Learner</span></blockquote>
        <div class="blog-section-divider"></div>
        <h2>What Makes a Portfolio Project Shine?</h2>
        <ul>
          <li><strong>Clear Problem & Solution:</strong> What did you build, and why does it matter?</li>
          <li><strong>Tech Stack:</strong> Be specific—"React, Express, MongoDB, AWS S3" is better than "full stack".</li>
          <li><strong>Challenges & Breakthroughs:</strong> Did you hit a wall? How did you break through?</li>
          <li><strong>Demo & Code:</strong> Link to a live version and your GitHub repo. Screenshots and short videos help!</li>
          <li><strong>Reflection:</strong> What would you improve if you did it again?</li>
        </ul>
        <div class="blog-section-divider"></div>
        <h2>Visual Storytelling: Show, Don’t Just Tell</h2>
        <p>Include screenshots, diagrams, or even a short video walkthrough. Visuals make your work memorable and help recruiters quickly grasp your impact. Here’s what a great project section might look like:</p>
        <img src="/blog/portfolio-sample-screenshot.jpg" alt="Sample project screenshot" class="blog-img-sample" />
        <div class="blog-section-divider"></div>
        <h2>SkillForge Tips: Make Your Portfolio Unforgettable</h2>
        <ol>
          <li><strong>Tell a story.</strong> Don’t just list features—share your journey, your “aha!” moments, and your growth.</li>
          <li><strong>Show variety.</strong> Include different types of projects (web, data, automation, etc.) to show range.</li>
          <li><strong>Keep it fresh.</strong> Update your portfolio as you learn new skills or complete new projects.</li>
          <li><strong>Be authentic.</strong> Recruiters love seeing your personality and passion shine through.</li>
        </ol>
        <div class="blog-section-divider"></div>
        <h2>Common Mistakes to Avoid</h2>
        <ul>
          <li>Only listing code without context or explanation</li>
          <li>Using generic project ideas (e.g., "To-Do List") without adding unique features</li>
          <li>Neglecting design and user experience</li>
          <li>Forgetting to update or maintain your portfolio</li>
        </ul>
        <div class="blog-section-divider"></div>
        <h2>Ready to Build?</h2>
        <p>Start your journey with SkillForge’s real-world projects. Every project you build is a step closer to your dream job. <strong>Don’t just tell employers what you can do—show them.</strong></p>
        <div class="blog-cta">
          <h3>Turn your learning into a job-winning portfolio. <a href="/projects">Start building today!</a></h3>
        </div>
      </div>
    `
  },
  {
    slug: 'top-7-in-demand-tech-skills-2024',
    title: 'Top 7 In-Demand Tech Skills to Learn in 2024',
    category: 'Learning',
    author: 'SkillForge Team',
    date: 'June 2024',
    readTime: '8 min read',
    image: '/blog/tech-skills-2024.jpg',
    excerpt: 'Stay ahead in your tech career! Explore the most valuable skills employers want this year, from AI to cloud computing, and how you can master them with real-world projects.',
    content: `
      <div class="blog-zomato-layout">
        <div class="blog-lead-quote">
          <span>“The best way to predict the future is to create it—one skill at a time.”</span>
        </div>
        <p>2024 is a year of rapid change in tech. Whether you’re a student, a career switcher, or a seasoned pro, knowing which skills to focus on can make all the difference. Here’s your SkillForge guide to the 7 most in-demand tech skills this year—and how to master them with real projects.</p>
        <div class="blog-section-divider"></div>
        <h2>1. Artificial Intelligence & Machine Learning</h2>
        <p>AI is everywhere—from chatbots to recommendation engines. Employers want to see you can build, not just talk about, intelligent systems. <strong>Project idea:</strong> Build a movie recommender or a simple chatbot using Python and scikit-learn.</p>
        <div class="blog-section-divider"></div>
        <h2>2. Cloud Computing</h2>
        <p>Cloud skills (AWS, Azure, GCP) are essential for modern apps. <strong>Project idea:</strong> Deploy a web app on AWS or automate backups to S3.</p>
        <div class="blog-section-divider"></div>
        <h2>3. Data Engineering</h2>
        <p>Big data isn’t just for data scientists. Data engineers build the pipelines that power analytics. <strong>Project idea:</strong> Create an ETL pipeline that cleans and visualizes real-world data.</p>
        <div class="blog-section-divider"></div>
        <h2>4. Cybersecurity</h2>
        <p>Security is everyone’s job. <strong>Project idea:</strong> Build a secure login system or run a vulnerability scan on a sample app.</p>
        <div class="blog-section-divider"></div>
        <h2>5. DevOps & Automation</h2>
        <p>CI/CD, Docker, and automation are must-haves. <strong>Project idea:</strong> Set up a CI pipeline for a Node.js app using GitHub Actions and Docker.</p>
        <div class="blog-section-divider"></div>
        <h2>6. Frontend Frameworks (React, Vue, etc.)</h2>
        <p>Modern UIs are built with frameworks. <strong>Project idea:</strong> Build a responsive dashboard or a real-time chat app with React.</p>
        <div class="blog-section-divider"></div>
        <h2>7. Communication & Collaboration</h2>
        <p>Soft skills matter! Document your projects, write clear READMEs, and work with others on GitHub.</p>
        <blockquote class="blog-blockquote">“My SkillForge project taught me more about teamwork and communication than any textbook.”<br/><span>— Rahul, SkillForge Learner</span></blockquote>
        <div class="blog-section-divider"></div>
        <h2>How to Learn These Skills (and Prove Them!)</h2>
        <ul>
          <li>Pick a real-world project for each skill</li>
          <li>Document your process and results</li>
          <li>Share your code and demos online</li>
          <li>Reflect on what you learned and what you’d do differently</li>
        </ul>
        <div class="blog-section-divider"></div>
        <h2>Ready to Upskill?</h2>
        <div class="blog-cta">
          <h3>Explore SkillForge’s project library and start building your future today!</h3>
        </div>
      </div>
    `
  },
  {
    slug: 'ultimate-guide-project-based-education',
    title: 'The Ultimate Guide to Learning by Doing: Project-Based Education',
    category: 'Education',
    author: 'SkillForge Team',
    date: 'May 2024',
    readTime: '9 min read',
    image: '/blog/project-based-learning.jpg',
    excerpt: 'Traditional learning is out, project-based learning is in! Find out how building real solutions accelerates your growth and prepares you for the tech industry.',
    content: `
      <div class="blog-zomato-layout">
        <div class="blog-lead-quote">
          <span>“Tell me and I forget. Teach me and I remember. Involve me and I learn.” — Benjamin Franklin</span>
        </div>
        <p>Project-based learning (PBL) is more than a buzzword—it’s a revolution in how we build skills for the real world. At SkillForge, we believe the best way to learn is by doing. Here’s why PBL works, and how you can use it to supercharge your tech journey.</p>
        <div class="blog-section-divider"></div>
        <h2>What is Project-Based Learning?</h2>
        <p>PBL means learning by building real solutions to real problems. Instead of memorizing theory, you:</p>
        <ul>
          <li>Work on open-ended, meaningful projects</li>
          <li>Apply concepts in context</li>
          <li>Develop critical thinking and creativity</li>
        </ul>
        <div class="blog-section-divider"></div>
        <h2>Why PBL Beats Traditional Learning</h2>
        <ul>
          <li>Retention: You remember what you do, not just what you read.</li>
          <li>Motivation: Real projects are fun and rewarding.</li>
          <li>Portfolio: You graduate with proof of your skills.</li>
        </ul>
        <blockquote class="blog-blockquote">“Building my SkillForge project was the first time I felt like a real developer.”<br/><span>— Aisha, SkillForge Learner</span></blockquote>
        <div class="blog-section-divider"></div>
        <h2>How to Get Started with PBL</h2>
        <ol>
          <li>Pick a project that excites you</li>
          <li>Break it into milestones</li>
          <li>Document your process (screenshots, notes, code)</li>
          <li>Share your results and get feedback</li>
        </ol>
        <div class="blog-section-divider"></div>
        <h2>SkillForge PBL Success Stories</h2>
        <p>Our learners have built everything from AI chatbots to e-commerce dashboards. Each project is a story of growth, challenge, and achievement.</p>
        <img src="/blog/pbl-success.jpg" alt="Project-based learning success" class="blog-img-sample" />
        <div class="blog-section-divider"></div>
        <h2>Ready to Learn by Doing?</h2>
        <div class="blog-cta">
          <h3>Browse SkillForge projects and start your hands-on journey today!</h3>
        </div>
      </div>
    `
  },
  {
    slug: 'ace-technical-interviews-portfolio-projects',
    title: 'How to Ace Technical Interviews with Portfolio Projects',
    category: 'Career',
    author: 'SkillForge Team',
    date: 'April 2024',
    readTime: '8 min read',
    image: '/blog/technical-interview.jpg',
    excerpt: 'Technical interviews are tough, but your portfolio can be your secret weapon. Learn how to present your projects, explain your process, and impress interviewers.',
    content: `
      <div class="blog-zomato-layout">
        <div class="blog-lead-quote">
          <span>“Your portfolio is your best answer to: ‘Show me what you can do.’”</span>
        </div>
        <p>Technical interviews can be intimidating, but a strong portfolio gives you an edge. Here’s how to use your projects to stand out and succeed.</p>
        <div class="blog-section-divider"></div>
        <h2>Why Interviewers Love Real Projects</h2>
        <ul>
          <li>They show you can build, not just talk</li>
          <li>They spark real conversations</li>
          <li>They prove you can solve problems end-to-end</li>
        </ul>
        <div class="blog-section-divider"></div>
        <h2>How to Present Your Projects</h2>
        <ol>
          <li>Start with the problem: What did you set out to solve?</li>
          <li>Walk through your process: Design, build, test, iterate</li>
          <li>Highlight challenges and how you overcame them</li>
          <li>Show the results: Demos, screenshots, user feedback</li>
        </ol>
        <blockquote class="blog-blockquote">“My SkillForge project was the highlight of my interview. I could show, not just tell.”<br/><span>— Neha, SkillForge Learner</span></blockquote>
        <div class="blog-section-divider"></div>
        <h2>Common Interview Questions (and How Your Project Helps)</h2>
        <ul>
          <li>“Tell me about a time you solved a tough bug.”</li>
          <li>“How do you choose your tech stack?”</li>
          <li>“What would you do differently next time?”</li>
        </ul>
        <div class="blog-section-divider"></div>
        <h2>SkillForge Tips for Interview Success</h2>
        <ol>
          <li>Practice your project story out loud</li>
          <li>Prepare code samples and diagrams</li>
          <li>Be honest about what you learned and what you’d improve</li>
        </ol>
        <div class="blog-section-divider"></div>
        <h2>Ready to Ace Your Next Interview?</h2>
        <div class="blog-cta">
          <h3>Build your next SkillForge project and turn interviews into offers!</h3>
        </div>
      </div>
    `
  },
  {
    slug: 'from-theory-to-practice-real-world-projects',
    title: 'From Theory to Practice: Why Real-World Projects Matter',
    category: 'Learning',
    author: 'SkillForge Team',
    date: 'March 2024',
    readTime: '7 min read',
    image: '/blog/theory-to-practice.jpg',
    excerpt: 'Textbooks teach you concepts, but projects teach you skills. See how applying knowledge in real scenarios bridges the gap between learning and doing.',
    content: `
      <div class="blog-zomato-layout">
        <div class="blog-lead-quote">
          <span>“Knowledge is of no value unless you put it into practice.” — Anton Chekhov</span>
        </div>
        <p>It’s easy to get lost in theory. But the real magic happens when you apply what you’ve learned to solve real problems. Here’s why real-world projects are the bridge from learning to doing.</p>
        <div class="blog-section-divider"></div>
        <h2>The Problem with Theory-Only Learning</h2>
        <ul>
          <li>It’s easy to forget concepts you never use</li>
          <li>Employers want proof, not just potential</li>
          <li>Confidence comes from doing, not just reading</li>
        </ul>
        <div class="blog-section-divider"></div>
        <h2>How Projects Turn Knowledge into Skills</h2>
        <ol>
          <li>They force you to make decisions and solve real problems</li>
          <li>You learn to debug, test, and iterate</li>
          <li>You build a portfolio that opens doors</li>
        </ol>
        <blockquote class="blog-blockquote">“My SkillForge project was the first time I felt like a real engineer.”<br/><span>— Arjun, SkillForge Learner</span></blockquote>
        <div class="blog-section-divider"></div>
        <h2>How to Choose a Real-World Project</h2>
        <ul>
          <li>Pick something that excites you</li>
          <li>Make it useful for yourself or others</li>
          <li>Document your journey</li>
        </ul>
        <div class="blog-section-divider"></div>
        <h2>Ready to Make the Leap?</h2>
        <div class="blog-cta">
          <h3>Browse SkillForge’s project library and start building for the real world!</h3>
        </div>
      </div>
    `
  },
  {
    slug: 'kickstart-your-tech-career-roadmap',
    title: 'Kickstart Your Tech Career: A Beginner’s Roadmap',
    category: 'Career',
    author: 'SkillForge Team',
    date: 'February 2024',
    readTime: '8 min read',
    image: '/blog/tech-career-roadmap.jpg',
    excerpt: 'New to tech? This step-by-step roadmap covers everything from choosing your first language to building your first project and landing your first job.',
    content: `
      <div class="blog-zomato-layout">
        <div class="blog-lead-quote">
          <span>“Every expert was once a beginner. Start where you are.”</span>
        </div>
        <p>Starting a tech career can feel overwhelming. But with the right roadmap, you can go from zero to job-ready—one project at a time. Here’s your SkillForge guide to launching your journey.</p>
        <div class="blog-section-divider"></div>
        <h2>Step 1: Choose Your Path</h2>
        <ul>
          <li>Web development, data science, DevOps, or something else?</li>
          <li>Research roles and talk to people in the field</li>
        </ul>
        <div class="blog-section-divider"></div>
        <h2>Step 2: Learn the Basics</h2>
        <ul>
          <li>Pick one language (Python, JavaScript, etc.)</li>
          <li>Understand core concepts (variables, loops, functions)</li>
        </ul>
        <div class="blog-section-divider"></div>
        <h2>Step 3: Build Your First Project</h2>
        <ul>
          <li>Start small—a calculator, a blog, a data visualizer</li>
          <li>Document your process and share your code</li>
        </ul>
        <div class="blog-section-divider"></div>
        <h2>Step 4: Grow Your Portfolio</h2>
        <ul>
          <li>Add more complex projects</li>
          <li>Collaborate with others</li>
          <li>Showcase your work online</li>
        </ul>
        <blockquote class="blog-blockquote">“SkillForge gave me the structure and confidence to land my first tech job.”<br/><span>— Maya, SkillForge Learner</span></blockquote>
        <div class="blog-section-divider"></div>
        <h2>Step 5: Prepare for Interviews</h2>
        <ul>
          <li>Practice coding challenges</li>
          <li>Review your projects and be ready to discuss them</li>
        </ul>
        <div class="blog-section-divider"></div>
        <h2>Ready to Start?</h2>
        <div class="blog-cta">
          <h3>Follow the SkillForge roadmap and turn your ambition into achievement!</h3>
        </div>
      </div>
    `
  }
];

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) return <div>Loading...</div>;

  return (
    <>
      <Head>
        <title>{post.title} | SkillForge Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title + ' | SkillForge Blog'} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.image} />
      </Head>
      <Navbar />
      <div className="blogpost-hero">
        <img src={post.image} alt={post.title} className="blogpost-hero-img" />
        <div className="blogpost-hero-content">
          <span className="blogpost-category">{post.category}</span>
          <h1 className="blogpost-title">{post.title}</h1>
          <div className="blogpost-meta">
            <span>{post.author}</span> | <span>{post.date}</span> | <span>{post.readTime}</span>
          </div>
        </div>
      </div>
      <div className="blogpost-content" dangerouslySetInnerHTML={{ __html: post.content }} />
      <style jsx>{`
        .blogpost-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #f8fafc;
          padding: 40px 0 20px 0;
        }
        .blogpost-hero-img {
          width: 100%;
          max-width: 800px;
          border-radius: 12px;
          object-fit: cover;
          margin-bottom: 24px;
        }
        .blogpost-hero-content {
          text-align: center;
        }
        .blogpost-category {
          color: #3b82f6;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .blogpost-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: #1e293b;
          margin: 10px 0 8px 0;
        }
        .blogpost-meta {
          color: #64748b;
          font-size: 1rem;
        }
        .blogpost-content {
          max-width: 800px;
          margin: 40px auto 60px auto;
          background: #fff;
          border-radius: 12px;
          padding: 40px 32px;
          font-size: 1.15rem;
          color: #374151;
          box-shadow: 0 2px 16px rgba(0,0,0,0.06);
        }
        .blogpost-content h2 {
          margin-top: 2em;
          font-size: 1.4em;
          color: #1e293b;
        }
        .blogpost-content ul, .blogpost-content ol {
          margin-left: 1.5em;
        }
        .blogpost-content li {
          margin-bottom: 0.5em;
        }
        .blog-lead-quote {
          font-size: 1.3rem;
          color: #3b82f6;
          background: #e0e7ff;
          border-left: 5px solid #6366f1;
          padding: 18px 28px;
          margin-bottom: 32px;
          border-radius: 8px;
          font-style: italic;
        }
        .blog-section-divider {
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, #3b82f6 0%, #f8fafc 100%);
          margin: 36px 0 36px 0;
          border-radius: 2px;
        }
        .blog-blockquote {
          background: #f1f5f9;
          border-left: 5px solid #3b82f6;
          margin: 32px 0;
          padding: 18px 28px;
          font-size: 1.1rem;
          color: #334155;
          border-radius: 8px;
        }
        .blog-blockquote span {
          display: block;
          margin-top: 10px;
          color: #64748b;
          font-size: 0.98rem;
        }
        .blog-img-sample {
          width: 100%;
          max-width: 600px;
          display: block;
          margin: 24px auto;
          border-radius: 10px;
          box-shadow: 0 2px 12px rgba(59,130,246,0.08);
        }
        .blog-cta {
          background: #e0f2fe;
          border-radius: 10px;
          padding: 28px 24px;
          text-align: center;
          margin: 40px 0 0 0;
        }
        .blog-cta h3 {
          color: #0ea5e9;
          font-size: 1.3rem;
          font-weight: 700;
        }
        @media (max-width: 600px) {
          .blogpost-content {
            padding: 18px 6vw;
          }
          .blogpost-hero-img {
            max-width: 100vw;
            height: auto;
          }
        }
      `}</style>
    </>
  );
}
