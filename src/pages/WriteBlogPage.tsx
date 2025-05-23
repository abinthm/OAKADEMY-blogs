import React from 'react';
import { useParams } from 'react-router-dom';
import { useBlogStore } from '../store/blogStore';
import BlogEditor from '../components/blog/BlogEditor';

const WriteBlogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPostById } = useBlogStore();
  
  const post = id ? getPostById(id) : undefined;
  const isDraft = post ? !post.published : false;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 font-serif">
        {id ? 'Edit' : 'Write'} Blog Post
      </h1>
      
      <BlogEditor postId={id} isDraft={isDraft} />
    </div>
  );
};

export default WriteBlogPage;