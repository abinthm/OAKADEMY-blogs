import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User, Edit, Trash2 } from 'lucide-react';
import { BlogPost } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useBlogStore } from '../../store/blogStore';

interface BlogCardProps {
  post: BlogPost;
  authorName: string;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, authorName }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { deletePost } = useBlogStore();
  
  const formattedDate = post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Date not available';

  const isAuthor = user?.id === post.author_id;
  const isAdmin = user?.isAdmin;
  const canEdit = isAuthor || isAdmin;
  const canDelete = isAuthor || isAdmin;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(post.id);
        // Optionally refresh the page or update the UI
        window.location.reload();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    navigate(`/edit/${post.id}`);
  };

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/post/${post.id}`} className="block relative">
        {post.cover_image && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.error('Error loading image:', target.src);
                // Remove any query parameters or optimized paths
                const baseUrl = target.src.split('?')[0].replace('/optimized/', '/');
                target.src = baseUrl;
              }}
            />
            <div className="absolute top-0 left-0 px-3 py-1 m-2 bg-[#3B3D87] text-white text-xs font-semibold rounded">
              {post.category}
            </div>
            {canEdit && (
              <div className="absolute top-0 right-0 m-2 flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="p-1.5 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                >
                  <Edit size={14} />
                </button>
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors shadow-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="p-6">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-[#3B3D87] transition-colors">
            {post.title}
          </h2>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {post.excerpt}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <User size={14} className="mr-1" />
              <span>{authorName}</span>
            </div>
            
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              <span>{formattedDate}</span>
            </div>
          </div>
          
          {post.hashtags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1">
              {post.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
};

export default BlogCard;