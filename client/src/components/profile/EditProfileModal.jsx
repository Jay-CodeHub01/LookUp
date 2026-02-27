// src/components/profile/EditProfileModal.jsx
import React from 'react'
import { useState, useRef } from 'react';
import { X, Camera, Loader, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  updateProfile,
  updateProfilePicture,
  deleteProfilePicture,
  updateCoverPhoto,
  togglePrivacy,
} from '../../api/userApi';
import toast from 'react-hot-toast';

const EditProfileModal = ({ onClose, profileData, onProfileUpdate }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: profileData?.fullName || user?.fullName || '',
    username: profileData?.username || user?.username || '',
    bio: profileData?.bio || user?.bio || '',
    website: profileData?.website || user?.website || '',
    location: profileData?.location || user?.location || '',
  });
  const [isPrivate, setIsPrivate] = useState(
    profileData?.isPrivate || user?.isPrivate || false
  );
  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const profilePicRef = useRef(null);
  const coverPhotoRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return toast.error('Image must be less than 5MB');
      }
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return toast.error('Image must be less than 5MB');
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveProfilePic = async () => {
    if (!window.confirm('Remove your profile picture?')) return;

    try {
      setIsLoading(true);
      await deleteProfilePicture();
      updateUser({ profilePicture: null });
      setProfilePreview(null);
      setProfileFile(null);
      toast.success('Profile picture removed');
      onProfileUpdate?.();
    } catch (error) {
      toast.error('Failed to remove profile picture');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePrivacy = async () => {
    try {
      await togglePrivacy();
      setIsPrivate(!isPrivate);
      updateUser({ isPrivate: !isPrivate });
      toast.success(`Account is now ${!isPrivate ? 'private' : 'public'}`);
    } catch (error) {
      toast.error('Failed to update privacy');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update profile info
      const { data } = await updateProfile(formData);
      updateUser(data.user || formData);

      // Upload profile picture if changed
      if (profileFile) {
        const picFormData = new FormData();
        picFormData.append('profilePicture', profileFile);
        const { data: picData } = await updateProfilePicture(picFormData);
        updateUser({ profilePicture: picData.profilePicture || picData.user?.profilePicture });
      }

      // Upload cover photo if changed
      if (coverFile) {
        const coverFormData = new FormData();
        coverFormData.append('coverPhoto', coverFile);
        const { data: coverData } = await updateCoverPhoto(coverFormData);
        updateUser({ coverPhoto: coverData.coverPhoto || coverData.user?.coverPhoto });
      }

      toast.success('Profile updated successfully!');
      onProfileUpdate?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const currentProfilePic =
    profilePreview || profileData?.profilePicture || user?.profilePicture || '/default-avatar.png';
  const currentCoverPhoto =
    coverPreview || profileData?.coverPhoto || user?.coverPhoto;

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'photos', label: 'Photos' },
    { id: 'privacy', label: 'Privacy' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 shrink-0">
          <h2 className="text-white font-bold text-lg">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="p-6 space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  maxLength={50}
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    @
                  </span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="username"
                    className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    maxLength={30}
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  maxLength={150}
                />
                <p className="text-gray-600 text-xs text-right mt-1">
                  {formData.bio.length}/150
                </p>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  maxLength={50}
                />
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="p-6 space-y-6">
              {/* Cover Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Cover Photo
                </label>
                <div
                  className="relative h-40 bg-gray-800 rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => coverPhotoRef.current?.click()}
                >
                  {currentCoverPhoto ? (
                    <img
                      src={currentCoverPhoto}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/60 p-3 rounded-full">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                </div>
                <input
                  ref={coverPhotoRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPhotoChange}
                  className="hidden"
                />
              </div>

              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Profile Picture
                </label>
                <div className="flex items-center gap-6">
                  <div
                    className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
                    onClick={() => profilePicRef.current?.click()}
                  >
                    <img
                      src={currentProfilePic}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => profilePicRef.current?.click()}
                      className="block text-blue-500 hover:text-blue-400 text-sm font-medium"
                    >
                      Upload new picture
                    </button>
                    {(profileData?.profilePicture || user?.profilePicture) && (
                      <button
                        type="button"
                        onClick={handleRemoveProfilePic}
                        className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm font-medium"
                      >
                        <Trash2 size={14} />
                        Remove picture
                      </button>
                    )}
                  </div>
                </div>
                <input
                  ref={profilePicRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="p-6 space-y-6">
              {/* Private Account Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                <div>
                  <h3 className="text-white font-medium">Private Account</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    When your account is private, only people you approve can see your
                    photos and videos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePrivacy}
                  className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ml-4 ${
                    isPrivate ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      isPrivate ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Info Box */}
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
                <h4 className="text-gray-300 font-medium text-sm mb-2">
                  What happens when your account is private?
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-gray-400 text-sm">
                    <span className="text-blue-400 mt-0.5">•</span>
                    Only followers you approve can see your posts
                  </li>
                  <li className="flex items-start gap-2 text-gray-400 text-sm">
                    <span className="text-blue-400 mt-0.5">•</span>
                    People must send a follow request
                  </li>
                  <li className="flex items-start gap-2 text-gray-400 text-sm">
                    <span className="text-blue-400 mt-0.5">•</span>
                    Your posts won't appear in explore page
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-gray-800 shrink-0 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-400 hover:text-white font-medium rounded-xl hover:bg-gray-800 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;