import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useBlogStore } from '../store/blogStore';
import { useAuthStore } from '../store/authStore';
import BlogCard from '../components/blog/BlogCard';
import { Category, BlogPost } from '../types';

// Shortened category names for tabs
const categoryTabs = {
  'All': 'All',
  'Latest Roots': 'Latest',
  'Culture & Identity': 'Culture',
  'Education & Opportunity': 'Education',
  'Gender & Expression': 'Gender',
  'Climate & Planet': 'Climate',
  'Health & Hope': 'Health',
  'Governance & Voice': 'Governance',
  'Justice & Rights': 'Justice',
  'Civic Spark': 'Civic Rights'
} as const;

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
      <div className="flex flex-col items-center justify-center max-w-4xl mx-auto mb-16 px-4">
        <h1 className="text-[2.25rem] sm:text-[1.75rem] md:text-[2rem] lg:text-[2.75rem] font-bold text-black font-serif mb-6 text-center leading-tight">
          <span className="block lg:inline">Your Thought.</span>{' '}
          <span className="block lg:inline -mt-2">Your Story.</span>{' '}
          <span className="block lg:inline -mt-2">Our Future.</span>
        </h1>
        <p className="text-sm md:text-base font-semibold text-black mb-3 text-center">
          Welcome to Voices of Oak
        </p>
        <p className="text-xs md:text-sm text-black mb-3 text-center">
          The Official Blog & Storytelling Platform of Oakademy
        </p>
        <p className="text-xs md:text-sm text-gray-700 mb-6 max-w-3xl text-center px-4">
          A global movement by youth, for youth—where reflections, real stories, and bold ideas spark change, from personal journeys to unheard voices around the world.
        </p>
          
        <Link
          to="/write"
          className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-medium rounded-full text-white bg-[#3B3D87] hover:bg-[#2d2f66] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B3D87] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Start Writing - Your Voice Matters
        </Link>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 px-4">Top Voices This Month</h2>
        
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-4 md:space-x-8 overflow-x-auto pb-2 px-4" aria-label="Categories">
            <button
              onClick={() => setActiveCategory('All')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                activeCategory === 'All'
                  ? 'border-[#3B3D87] text-[#3B3D87]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {categoryTabs['All']}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeCategory === cat
                    ? 'border-[#3B3D87] text-[#3B3D87]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {categoryTabs[cat as keyof typeof categoryTabs]}
              </button>
            ))}
          </nav>
        </div>

        <div className="relative mb-8 px-4">
          <input
            type="text"
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B3D87] focus:border-transparent"
          />
          <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
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
        <div className="text-center py-12 px-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
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