import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlogStore } from '../store/blogStore';
import { useAuthStore } from '../store/authStore';
import BlogCard from '../components/blog/BlogCard';

const PendingPostsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { posts } = useBlogStore();
  
  // Filter posts that are pending and belong to the current user
  const pendingPosts = posts.filter(
    post => post.status === 'pending' && post.author_id === user?.id
  );

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Pending Posts</h1>
        <p className="text-gray-600">
          These posts are awaiting approval from our moderators. You'll be notified once they're reviewed.
        </p>
      </div>

      {pendingPosts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">You don't have any posts pending approval.</p>
          <button
            onClick={() => navigate('/write')}
            className="mt-4 px-4 py-2 bg-[#3B3D87] text-white rounded-md hover:bg-opacity-90 transition-colors"
          >
            Write a New Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingPosts.map(post => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingPostsPage; 