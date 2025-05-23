import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import { BlogPost } from '../../types';

interface BlogCardProps {
  post: BlogPost;
  authorName: string;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, authorName }) => {
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/post/${post.id}`}>
        {post.coverImage && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute top-0 left-0 px-3 py-1 m-2 bg-blue-600 text-white text-xs font-semibold rounded">
              {post.category}
            </div>
          </div>
        )}
        
        <div className="p-6">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
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