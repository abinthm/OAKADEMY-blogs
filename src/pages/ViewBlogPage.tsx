import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlogStore } from '../store/blogStore';
import { useAuthStore } from '../store/authStore';
import BlogDetail from '../components/blog/BlogDetail';
import { User } from '../types';

const ViewBlogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPostById } = useBlogStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500); // Simulate loading
  }, [id]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-36 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  const post = id ? getPostById(id) : undefined;
  
  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
        <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-[#3B3D87] text-white rounded-md hover:bg-[#2d2f66] transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Check if user can view this post
  const canViewPost = post.status === 'approved' || 
                     (user && (user.id === post.author_id || user.isAdmin));

  if (!canViewPost) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not available</h2>
        <p className="text-gray-600 mb-8">This post is currently under review and not publicly available.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-[#3B3D87] text-white rounded-md hover:bg-[#2d2f66] transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Create author object from post data
  const author: User = {
    id: post.author_id,
    name: post.authorName || 'Community Member',
    email: '',  // Email is not displayed in the UI
    createdAt: new Date(post.created_at), // Convert string date to Date object
    bio: 'Community Contributor'  // Default bio
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {post.status === 'pending' && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">
            This post is pending review. It will be visible to the public once approved.
          </p>
        </div>
      )}
      <BlogDetail post={post} author={author} />
    </div>
  );
};

export default ViewBlogPage;