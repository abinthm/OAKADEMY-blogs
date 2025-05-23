import React, { useState } from 'react';
import { Table as Tabs, Clock, Edit, FileText, Upload } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useBlogStore } from '../store/blogStore';
import BlogCard from '../components/blog/BlogCard';
import { Link } from 'react-router-dom';
import { uploadImage } from '../lib/uploadImage';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const { posts, drafts } = useBlogStore();
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }
  
  const userPosts = posts.filter(post => post.authorId === user.id && post.published);
  const userDrafts = drafts.filter(draft => draft.authorId === user.id);
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const imageUrl = await uploadImage(file, 'avatars');
      setAvatar(imageUrl);
    } catch (err) {
      setError((err as Error).message);
      console.error('Failed to upload image:', err);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSaveProfile = async () => {
    setError(null);
    try {
      await updateProfile({
        name,
        bio,
        avatar
      });
      setIsEditing(false);
    } catch (err) {
      setError((err as Error).message);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-600">
          {isEditing ? (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-white text-gray-600 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-white text-blue-600 rounded-md shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Profile
              </button>
            </div>
          ) : (
            <div className="absolute bottom-4 right-4">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-md shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </button>
            </div>
          )}
        </div>
        
        <div className="relative px-6 py-8">
          <div className="absolute -top-16 left-6">
            {isEditing ? (
              <div className="relative">
                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white bg-white">
                  <img
                    src={avatar || 'https://via.placeholder.com/200?text=Upload+Avatar'}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                      <Upload className="h-8 w-8 text-white" />
                    </label>
                  </div>
                </div>
                {isUploading && (
                  <div className="mt-2 text-sm text-blue-600">
                    Uploading...
                  </div>
                )}
              </div>
            ) : (
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white bg-white">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-blue-200">
                    <span className="text-4xl font-bold text-blue-800">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="ml-40">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600 mt-1">{user.email}</p>
                {user.bio && <p className="text-gray-700 mt-4">{user.bio}</p>}
              </>
            )}
            
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                <span>{userPosts.length} published</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-500 mr-2" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('published')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'published'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Published Posts ({userPosts.length})
            </button>
            
            <button
              onClick={() => setActiveTab('drafts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'drafts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Drafts ({userDrafts.length})
            </button>
          </nav>
        </div>
      </div>
      
      {activeTab === 'published' && (
        <div>
          {userPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">You haven't published any posts yet.</p>
              <Link
                to="/write"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Write Your First Post
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPosts.map((post) => (
                <BlogCard key={post.id} post={post} authorName={user.name} />
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'drafts' && (
        <div>
          {userDrafts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">You don't have any drafts.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="bg-white shadow-sm rounded-md p-4 border border-gray-200"
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    <Link to={`/edit/${draft.id}`} className="hover:text-blue-600">
                      {draft.title || 'Untitled Draft'}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(draft.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="mt-3 flex">
                    <Link
                      to={`/edit/${draft.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 mr-4"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;