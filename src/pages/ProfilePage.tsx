import React, { useState } from 'react';
import { Table as Tabs, Clock, Edit, FileText, Upload } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useBlogStore } from '../store/blogStore';
import { User } from '../types';
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
  const [avatarError, setAvatarError] = useState(false);
  const [editAvatarError, setEditAvatarError] = useState(false);
  
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [role, setRole] = useState(user?.role || 'Community Contributor');
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }
  
  const userPosts = posts.filter(post => post.author_id === user.id && post.published);
  const userDrafts = drafts.filter(draft => draft.author_id === user.id);
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const imageUrl = await uploadImage(file, 'avatars');
      console.log('Image uploaded successfully:', imageUrl);
      
      // Update profile with new avatar
      const updates: Partial<User> = {
        name: name.trim(),
        bio: bio?.trim(),
        avatar: imageUrl,
        role: role.trim() || 'Community Contributor'
      };

      const updatedUser = await updateProfile(updates);
      console.log('Profile updated with new avatar:', updatedUser);

      // Update local state
      setAvatar(imageUrl);
      setAvatarError(false);
      setEditAvatarError(false);
    } catch (err) {
      console.error('Failed to upload image:', err);
      setError((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSaveProfile = async () => {
    setError(null);
    try {
      console.log('Attempting to save profile with role:', role);

      // Create update object with all fields
      const updates: Partial<User> = {
        name: name.trim(),
        bio: bio?.trim(),
        avatar: avatar || user.avatar, // Preserve existing avatar
        role: role.trim() || user.role || 'Community Contributor' // Preserve existing role if not changed
      };

      console.log('Sending profile updates:', updates);
      const updatedUser = await updateProfile(updates);
      console.log('Profile updated successfully:', updatedUser);

      // Update local state with the returned user data
      setName(updatedUser.name);
      setBio(updatedUser.bio || '');
      setAvatar(updatedUser.avatar || '');
      setRole(updatedUser.role || 'Community Contributor');
      
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError((err as Error).message);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          <p className="font-medium">Error updating profile</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8 relative">
        <div className="h-40 bg-[#3B3D87]">
          {isEditing ? (
            <div className="absolute bottom-4 right-4 flex gap-2 z-10">
              <button
                onClick={() => {
                  setName(user.name);
                  setBio(user.bio || '');
                  setAvatar(user.avatar || '');
                  setRole(user.role || '');
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-white text-gray-600 rounded-md shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-white text-[#3B3D87] rounded-md shadow-sm hover:bg-gray-50"
              >
                Save Profile
              </button>
            </div>
          ) : (
            <div className="absolute bottom-4 right-4 z-10">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-white text-[#3B3D87] rounded-md shadow-sm hover:bg-gray-50"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </button>
            </div>
          )}
        </div>
        
        <div className="relative px-6 py-6">
          <div className="absolute -top-12 left-6 z-20">
            <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white bg-white shadow-md">
              {isEditing ? (
                <>
                  {avatar && !editAvatarError ? (
                    <img
                      src={avatar}
                      alt={name}
                      className="h-full w-full object-cover"
                      onError={() => setEditAvatarError(true)}
                    />
                  ) : (
                    <div className="h-full w-full bg-[#3B3D87] bg-opacity-20 flex items-center justify-center">
                      <span className="text-[#3B3D87] font-bold text-3xl">
                        {name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    <Upload className="h-6 w-6 text-white" />
                  </label>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <div className="text-white text-sm">Uploading...</div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {user.avatar && !avatarError ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="h-full w-full bg-[#3B3D87] bg-opacity-20 flex items-center justify-center">
                      <span className="text-[#3B3D87] font-bold text-3xl">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="ml-32 pt-2">
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3B3D87] focus:border-[#3B3D87]"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <input
                    type="text"
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3B3D87] focus:border-[#3B3D87]"
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3B3D87] focus:border-[#3B3D87]"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500 text-sm mt-1">{user.email}</p>
                <p className="text-[#3B3D87] text-sm mt-1">{user.role}</p>
                {user.bio && <p className="text-gray-700 mt-4 text-sm">{user.bio}</p>}
              </>
            )}
            
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">{userPosts.length} published</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
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
                  ? 'border-[#3B3D87] text-[#3B3D87]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Published Posts ({userPosts.length})
            </button>
            
            <button
              onClick={() => setActiveTab('drafts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'drafts'
                  ? 'border-[#3B3D87] text-[#3B3D87]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Drafts ({userDrafts.length})
            </button>
          </nav>
        </div>
        
        {activeTab === 'published' && (
          <div className="mt-4">
            {userPosts.map(post => (
              <BlogCard key={post.id} post={post} authorName={user.name} />
            ))}
          </div>
        )}
        
        {activeTab === 'drafts' && (
          <div className="mt-4">
            {userDrafts.map(draft => (
              <BlogCard key={draft.id} post={draft} authorName={user.name} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;