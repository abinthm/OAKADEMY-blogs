import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { useBlogStore } from '../store/blogStore';
import { useAuthStore } from '../store/authStore';
import BlogCard from '../components/blog/BlogCard';
import { Category, BlogPost } from '../types';

const categories: Category[] = [
  'Latest Roots',
  'Culture & Identity',
  'Education & Opportunity',
  'Gender & Expression',
  'Climate & Planet',
  'Health & Hope',
  'Governance & Voice',
  'Justice & Rights',
  'Civic Spark'
];

const HomePage: React.FC = () => {
  const { posts } = useBlogStore();
  const { user } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    // Only show approved posts on the homepage
    let result = posts.filter(post => post.status === 'approved' && post.published);
    
    if (activeCategory !== 'All') {
      result = result.filter(post => post.category === activeCategory);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        post =>
          post.title.toLowerCase().includes(term) ||
          post.excerpt.toLowerCase().includes(term) ||
          post.hashtags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    setFilteredPosts(result);
  }, [posts, activeCategory, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-[#3B3D87] rounded-xl shadow-xl p-8 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-serif mb-4">
            🌳 Your Thought. Your Story. Our Future.
          </h1>
          <p className="text-xl text-gray-200 mb-4">
            Welcome to Voices of Oak – where stories root change.
          </p>
          <p className="text-lg text-gray-200 mb-4">
            A global movement by youth, for youth – sharing reflections, realities, and revolutionary ideas.
          </p>
          <p className="text-lg text-gray-200 mb-8">
            Whether it's about your village, your vision, or the voice of the unheard — this is where it begins.
          </p>
          
          <div className="relative max-w-xl mx-auto mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-md leading-5 bg-white bg-opacity-90 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-white focus:border-white text-gray-900"
              placeholder="Search for stories, topics, or tags..."
            />
          </div>
          
          {user ? (
            <Link
              to="/write"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              ✍ Start Writing – Because your voice doesn't just matter... it leads.
              <ChevronRight className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
            </Link>
          ) : (
            <div className="space-y-4">
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                🎙 Start Contributing
              </Link>
              <p className="text-sm text-gray-300">
                Trusted by young changemakers across continents.<br />
                Guided by purpose. Grown with heart.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 font-serif">Top Voices This Month</h2>
          <div className="flex overflow-x-auto space-x-2 pb-2">
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeCategory === 'All'
                  ? 'bg-[#3B3D87] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeCategory === category
                    ? 'bg-[#3B3D87] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } transition-colors whitespace-nowrap`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm
                ? `No stories found for "${searchTerm}"`
                : 'No stories found in this category'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-[#3B3D87] hover:text-[#2d2f66]"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                authorName={post.authorName || 'Community Member'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;