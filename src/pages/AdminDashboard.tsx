import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Eye } from 'lucide-react';
import { useBlogStore } from '../store/blogStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabaseClient';
import { BlogPost } from '../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getPendingPosts, approvePost, rejectPost, fetchPosts } = useBlogStore();
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch posts when component mounts and after any approval/rejection
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        await fetchPosts();
      } catch (err) {
        console.error('Error loading posts:', err);
        setError('Failed to load posts. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, [fetchPosts]);

  const pendingPosts = getPendingPosts();

  if (!user?.isAdmin) {
    navigate('/');
    return null;
  }

  const handleApprove = async (post: BlogPost) => {
    setError(null);
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          status: 'approved',
          published: true,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes || 'Approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);

      if (error) throw error;

      approvePost(post.id, reviewNotes);
      setSelectedPost(null);
      setReviewNotes('');
      // Refresh posts after approval
      await fetchPosts();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (post: BlogPost) => {
    if (!reviewNotes.trim()) {
      setError('Please provide review notes explaining why the post was rejected');
      return;
    }

    setError(null);
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          status: 'rejected',
          published: false,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);

      if (error) throw error;

      rejectPost(post.id, reviewNotes);
      setSelectedPost(null);
      setReviewNotes('');
      // Refresh posts after rejection
      await fetchPosts();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Pending Posts ({pendingPosts.length})
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4 mb-4" />
                  <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : pendingPosts.length === 0 ? (
            <p className="text-gray-600">No posts pending review.</p>
          ) : (
            <div className="space-y-4">
              {pendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(`/post/${post.id}`, '_blank')}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="View Post"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleApprove(post)}
                        disabled={isProcessing}
                        className="p-1 text-green-600 hover:text-green-800"
                        title="Approve"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setReviewNotes('');
                        }}
                        disabled={isProcessing}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Reject"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
                  <div className="text-xs text-gray-500">
                    By {post.authorName} • {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Reject Post: {selectedPost.title}
            </h3>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Please provide feedback for the author..."
              className="w-full h-32 p-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedPost)}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 