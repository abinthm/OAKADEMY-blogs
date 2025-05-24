import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Tag, Edit, Trash2, Share2 } from 'lucide-react';
import { BlogPost, User } from '../../types';
import { useBlogStore } from '../../store/blogStore';
import { useAuthStore } from '../../store/authStore';

interface BlogDetailProps {
  post: BlogPost;
  author: User;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ post, author }) => {
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
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(post.id);
        navigate('/');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };
  
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <article className="bg-white shadow-md rounded-lg overflow-hidden">
      {post.cover_image && (
        <div className="relative h-96 w-full">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.error('Error loading image:', target.src);
              // Remove any query parameters or optimized paths
              const baseUrl = target.src.split('?')[0].replace('/optimized/', '/');
              target.src = baseUrl;
            }}
          />
          <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex items-center space-x-2 text-white text-sm mb-2">
              <Link
                to={`/category/${post.category.toLowerCase()}`}
                className="bg-[#3B3D87] text-white px-3 py-1 rounded-full text-xs font-medium"
              >
                {post.category}
              </Link>
              <span className="text-gray-300">•</span>
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                <span>{formattedDate}</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white font-serif">{post.title}</h1>
          </div>
        </div>
      )}
      
      {!post.cover_image && (
        <div className="pt-8 px-6">
          <div className="flex items-center space-x-2 text-gray-500 text-sm mb-2">
            <Link
              to={`/category/${post.category.toLowerCase()}`}
              className="bg-[#3B3D87]/10 text-[#3B3D87] px-3 py-1 rounded-full text-xs font-medium"
            >
              {post.category}
            </Link>
            <span>•</span>
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              <span>{formattedDate}</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif">{post.title}</h1>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center mb-8">
          <div className="flex-shrink-0 mr-3">
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="h-10 w-10 rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  console.error('Error loading image:', target.src);
                  // Remove any query parameters or optimized paths
                  const baseUrl = target.src.split('?')[0].replace('/optimized/', '/');
                  target.src = baseUrl;
                }}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-[#3B3D87]/20 flex items-center justify-center">
                <span className="text-[#3B3D87] font-medium">
                  {author.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{author.name}</p>
            {author.bio && (
              <p className="text-sm text-gray-500">{author.bio}</p>
            )}
          </div>
        </div>
        
        <div 
          className="prose prose-[#3B3D87] max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <Tag size={16} className="text-gray-500" />
            {post.hashtags.map((tag) => (
              <Link
                key={tag}
                to={`/tag/${tag}`}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center border-t pt-6">
          <div className="flex space-x-2">
            {canEdit && (
              <>
                <button
                  onClick={() => navigate(`/edit/${post.id}`)}
                  className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-[#3B3D87] transition-colors"
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </button>
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
          
          <button
            onClick={handleShare}
            className="flex items-center px-4 py-2 bg-[#3B3D87]/10 text-[#3B3D87] rounded-md text-sm hover:bg-[#3B3D87]/20 transition-colors"
          >
            <Share2 size={16} className="mr-2" />
            Share
          </button>
        </div>
      </div>
    </article>
  );
};

export default BlogDetail;