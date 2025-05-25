import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlogStore } from '../store/blogStore';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import BlogCard from '../components/blog/BlogCard';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const PendingPostsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { posts } = useBlogStore();
  const { addNotification } = useNotificationStore();
  
  // Separate pending and rejected posts
  const pendingPosts = posts.filter(
    post => post.status === 'pending' && post.author_id === user?.id
  );

  const rejectedPosts = posts.filter(
    post => post.status === 'rejected' && post.author_id === user?.id
  );

  // Show notifications for rejected posts when the page loads
  useEffect(() => {
    rejectedPosts.forEach(post => {
      if (post.rejection_reason) {
        addNotification(
          'error',
          `Your post "${post.title}" was rejected. Reason: ${post.rejection_reason}`
        );
      }
    });
  }, [rejectedPosts, addNotification]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const getStatusBadge = (status: string) => {
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
          <div className="flex items-center text-red-600">
            <XCircle className="w-4 h-4 mr-1" />
            <span>Rejected</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Pending Posts Section */}
      <div className="mb-12">
        <div className="flex items-center mb-6">
          <Clock className="w-6 h-6 text-yellow-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Pending Posts</h2>
        </div>
        
        {pendingPosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center text-gray-600">
              <p>You don't have any posts pending approval.</p>
              <button
                onClick={() => navigate('/write')}
                className="mt-4 px-4 py-2 bg-[#3B3D87] text-white rounded-md hover:bg-opacity-90 transition-colors"
              >
                Write a New Post
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {pendingPosts.map(post => (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="mb-4">
                    {getStatusBadge(post.status)}
                    <p className="mt-2 text-sm text-gray-600">
                      Your post is being reviewed by our moderators. You'll be notified once it's reviewed.
                    </p>
                  </div>
                  <BlogCard post={post} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejected Posts Section */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Rejected Posts</h2>
        </div>
        
        {rejectedPosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center text-gray-600">
              <p>You don't have any rejected posts.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {rejectedPosts.map(post => (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center text-red-600">
                      <XCircle className="w-4 h-4 mr-1" />
                      <span>Rejected</span>
                    </div>
                    {post.rejection_reason && (
                      <div className="mt-3 p-4 bg-red-50 rounded-md">
                        <div className="flex items-start">
                          <XCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-red-800">Rejection Reason:</h4>
                            <p className="mt-1 text-sm text-red-700">{post.rejection_reason}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <BlogCard post={post} />
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => navigate(`/edit/${post.id}`)}
                      className="px-4 py-2 bg-[#3B3D87] text-white rounded-md hover:bg-opacity-90 transition-colors"
                    >
                      Edit and Resubmit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingPostsPage; 