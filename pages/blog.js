import React, { useState, useEffect } from "react";
import Navbar from '../components/Navbar';

// Import your external blog post components
import ProjectBasedLearningBenefits from "../pages/blog/ProjectBasedLearningBenefits";
import TopSkillsFor2025 from "../pages/blog/TopSkillsFor2025";

const App = () => {
  const [currentPostComponent, setCurrentPostComponent] = useState(null);

  const blogPosts = [
    {
      id: 1,
      title: "The Benefits of Project-Based Learning in Modern Education",
      excerpt:
        "Project-based learning (PBL) transforms how students engage with knowledge. Learn why PBL fosters deeper understanding and real-world problem-solving.",
      category: "Education",
      date: "April 5, 2025",
      image: "https://placehold.co/600x400?text=Project-Based+Learning",
      slug: "project-based-learning-benefits",
      component: ProjectBasedLearningBenefits,
    },
    {
      id: 2,
      title: "Top Skills to Master by 2025 for Career Success",
      excerpt:
        "As we move into 2025, the job market evolves rapidly. Discover essential skills to stay competitive and future-ready.",
      category: "Career Development",
      date: "March 28, 2025",
      image: "https://placehold.co/600x400?text=Skills+for+2025",
      slug: "top-skills-for-2025",
      component: TopSkillsFor2025,
    },
    {
      id: 3,
      title: "The Importance of Soft Skills in Tech",
      excerpt:
        "Technical skills are crucial, but soft skills like communication and teamwork drive real-world success.",
      category: "Professional Development",
      date: "May 10, 2025",
      image: "https://placehold.co/600x400?text=Soft+Skills",
      slug: "soft-skills-in-tech",
      component: () => <div>Soft Skills Post</div>,
    },
    {
      id: 4,
      title: "How to Build a Standout Developer Portfolio",
      excerpt:
        "Your portfolio is your gateway to opportunity. Learn what makes it truly impressive to recruiters.",
      category: "Career Advice",
      date: "June 2, 2025",
      image: "https://placehold.co/600x400?text=Developer+Portfolio",
      slug: "developer-portfolio-tips",
      component: () => <div>Portfolio Tips Post</div>,
    },
  ];

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const post = blogPosts.find((p) => p.slug === hash);
      if (post) {
        const Component = post.component;
        setCurrentPostComponent(<Component />);
      }
    }
  }, []);

  if (currentPostComponent) {
    return (
      <div className=".homePageLayout_site_">
        <Navbar />
        <div className="bg-white">
          <div className="container mx-auto px-4 py-8">
            <button
              onClick={() => {
                window.location.hash = "";
                setCurrentPostComponent(null);
              }}
              className="mb-6 text-indigo-600 hover:text-indigo-800 font-medium text-sm sm:text-base"
            >
              ← Back to Blogs
            </button>
            <div>{currentPostComponent}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      <Navbar />

      <section className="bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-100 py-12 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 sm:mb-4 leading-tight">
            Explore Our Latest Blogs
          </h2>
          <p className="text-sm sm:text-base md:text-xl text-gray-700 max-w-2xl mx-auto">
            Insights on education, careers, and personal growth.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl sm:text-3xl font-semibold text-center text-gray-800 mb-6 sm:mb-10">
            Latest Blogs
          </h3>
          <div className="grid md:grid-cols-2 gap-y-10 gap-x-16">
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition transform hover:-translate-y-1 duration-200 cursor-pointer"
                onClick={() => {
                  const Component = post.component;
                  window.location.hash = post.slug;
                  setCurrentPostComponent(<Component />);
                }}
              >
                <div className={`blog-image ${post.slug}`}>
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-5 flex flex-col">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span className="text-indigo-600 font-medium">{post.category}</span>
                    <span>{post.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <span className="text-indigo-600 text-sm font-medium hover:underline mt-auto">
                    Read more →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200 py-4 sm:py-6">
        <div className="container mx-auto px-4 text-center text-xs sm:text-sm text-gray-600">
          © {new Date().getFullYear()} My Blog. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;
