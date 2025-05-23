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
  const { posts, fetchPosts } = useBlogStore();
  const { user } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch posts when component mounts
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      await fetchPosts();
      setIsLoading(false);
    };
    loadPosts();
  }, [fetchPosts]);

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
      <div className="flex flex-col items-center justify-center max-w-4xl mx-auto mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-black font-serif mb-6 whitespace-nowrap">
          Your Thought. Your Story. Our Future.
        </h1>
        <p className="text-2xl font-semibold text-black mb-4 whitespace-nowrap">
          Welcome to Voices of Oak
        </p>
        <p className="text-xl text-black mb-4 whitespace-nowrap">
          The Official Blog & Storytelling Platform of Oakademy
        </p>
        <p className="text-lg text-gray-700 mb-8 max-w-3xl text-center">
          A global movement by youth, for youth—where reflections, real stories, and bold ideas spark change, from personal journeys to unheard voices around the world.
        </p>
          
        <Link
          to="/write"
          className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-full text-white bg-[#3B3D87] hover:bg-[#2d2f66] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B3D87] transition-colors"
        >
          Start Writing - Your Voice Matters
        </Link>
      </div>
      
      <div className="mb-8">
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === 'All'
                ? 'bg-[#3B3D87] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-[#3B3D87] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
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
  );
};

export default HomePage;