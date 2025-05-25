import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlogStore } from '../store/blogStore';
import { useAuthStore } from '../store/authStore';
import BlogCard from '../components/blog/BlogCard';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const PendingPostsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { posts } = useBlogStore();
  
  // Filter posts that are pending or rejected and belong to the current user
  const userPosts = posts.filter(
    post => (post.status === 'pending' || post.status === 'rejected') && post.author_id === user?.id
  );

  if (!user) {
    navigate('/login');
    return null;
  }

  const getStatusBadge = (status: string, rejectionReason?: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center text-yellow-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>Pending Review</span>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span>Approved</span>
          </div>
        );
      case 'rejected':
        return (
          <div>
            <div className="flex items-center text-red-600 mb-2">
              <XCircle className="w-4 h-4 mr-1" />
              <span>Rejected</span>
            </div>
            {rejectionReason && (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                <strong>Reason:</strong> {rejectionReason}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Pending Posts</h1>
        <p className="text-gray-600">
          Track the status of your submitted posts here. You'll be notified when they're reviewed.
        </p>
      </div>

      {userPosts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">You don't have any pending or rejected posts.</p>
          <button
            onClick={() => navigate('/write')}
            className="mt-4 px-4 py-2 bg-[#3B3D87] text-white rounded-md hover:bg-opacity-90 transition-colors"
          >
            Write a New Post
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {userPosts.map(post => (
            <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="mb-4">
                  {getStatusBadge(post.status, post.rejection_reason)}
                </div>
                <BlogCard post={post} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingPostsPage; 