import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Eye } from 'lucide-react';
import { useBlogStore } from '../store/blogStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabaseClient';
import { BlogPost } from '../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getPendingPosts, approvePost, rejectPost } = useBlogStore();
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingPosts = getPendingPosts();

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
        <p className="text-gray-600">You do not have permission to access this page.</p>
      </div>
    );
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
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Pending Posts ({pendingPosts.length})
          </h2>

          {pendingPosts.length === 0 ? (
            <p className="text-gray-500">No posts pending review.</p>
          ) : (
            <div className="space-y-6">
              {pendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        by {post.authorName} • {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Post"
                    >
                      <Eye size={20} />
                    </button>
                  </div>

                  <p className="text-gray-600 mb-4">{post.excerpt}</p>

                  {selectedPost?.id === post.id ? (
                    <div className="space-y-4">
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add review notes..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleReject(post)}
                          disabled={isProcessing}
                          className="flex items-center px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                        >
                          <X size={16} className="mr-2" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(post)}
                          disabled={isProcessing}
                          className="flex items-center px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                        >
                          <Check size={16} className="mr-2" />
                          Approve
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        Review
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 