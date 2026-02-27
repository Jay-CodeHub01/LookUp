// src/components/profile/EditProfileModal.jsx
import React from 'react';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      const { data } = await updateProfile(formData);
      updateUser(data.data?.user || data.user || formData);

      if (profileFile) {
        const picFormData = new FormData();
        picFormData.append('profilePicture', profileFile);
        const { data: picData } = await updateProfilePicture(picFormData);
        updateUser({ profilePicture: picData.data?.profilePicture || picData.profilePicture || picData.data?.user?.profilePicture });
      }

      if (coverFile) {
        const coverFormData = new FormData();
        coverFormData.append('coverPhoto', coverFile);
        const { data: coverData } = await updateCoverPhoto(coverFormData);
        updateUser({ coverPicture: coverData.data?.coverPicture || coverData.coverPicture || coverData.data?.user?.coverPicture });
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
    profilePreview || profileData?.profilePicture?.url || profileData?.profilePicture || user?.profilePicture?.url || user?.profilePicture || '/default-avatar.png';
  const currentCoverPhoto =
    coverPreview || profileData?.coverPhoto?.url || profileData?.coverPhoto || profileData?.coverPicture?.url || profileData?.coverPicture || user?.coverPicture?.url || user?.coverPicture;

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'photos', label: 'Photos' },
    { id: 'privacy', label: 'Privacy' },
  ];

  const tabContent = {
    general: (
      <motion.div
        className="p-6 space-y-5"
        key="general"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
      >
        {[
          { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Your full name', maxLength: 50 },
          { name: 'username', label: 'Username', type: 'text', placeholder: 'username', maxLength: 30, prefix: '@' },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
            <div className="relative">
              {field.prefix && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{field.prefix}</span>
              )}
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="input-premium"
                style={field.prefix ? { paddingLeft: '32px' } : {}}
                maxLength={field.maxLength}
              />
            </div>
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            rows={3}
            className="input-premium resize-none"
            maxLength={150}
          />
          <p className="text-gray-600 text-xs text-right mt-1">{formData.bio.length}/150</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
          <input type="url" name="website" value={formData.website} onChange={handleChange}
            placeholder="https://yourwebsite.com" className="input-premium" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange}
            placeholder="City, Country" className="input-premium" maxLength={50} />
        </div>
      </motion.div>
    ),
    photos: (
      <motion.div
        className="p-6 space-y-6"
        key="photos"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
      >
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Cover Photo</label>
          <motion.div
            className="relative h-40 rounded-xl overflow-hidden cursor-pointer group"
            style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(75, 85, 99, 0.2)' }}
            onClick={() => coverPhotoRef.current?.click()}
            whileHover={{ scale: 1.01 }}
          >
            {currentCoverPhoto ? (
              <img src={currentCoverPhoto} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))' }} />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="p-3 rounded-full" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
                <Camera size={24} className="text-white" />
              </div>
            </div>
          </motion.div>
          <input ref={coverPhotoRef} type="file" accept="image/*" onChange={handleCoverPhotoChange} className="hidden" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Profile Picture</label>
          <div className="flex items-center gap-6">
            <motion.div
              className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
              onClick={() => profilePicRef.current?.click()}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <img src={currentProfilePic} alt="Profile" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
            </motion.div>
            <div className="space-y-2">
              <button type="button" onClick={() => profilePicRef.current?.click()}
                className="block text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                Upload new picture
              </button>
              {(profileData?.profilePicture || user?.profilePicture) && (
                <button type="button" onClick={handleRemoveProfilePic}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
                  <Trash2 size={14} /> Remove picture
                </button>
              )}
            </div>
          </div>
          <input ref={profilePicRef} type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
        </div>
      </motion.div>
    ),
    privacy: (
      <motion.div
        className="p-6 space-y-6"
        key="privacy"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between p-4 rounded-xl"
          style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(75, 85, 99, 0.2)' }}>
          <div>
            <h3 className="text-white font-medium">Private Account</h3>
            <p className="text-gray-400 text-sm mt-1">
              When your account is private, only people you approve can see your photos and videos.
            </p>
          </div>
          <motion.button
            type="button"
            onClick={handleTogglePrivacy}
            className="relative w-12 h-6 rounded-full shrink-0 ml-4"
            style={{ background: isPrivate ? '#6366f1' : 'rgba(75, 85, 99, 0.5)' }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg"
              animate={{ x: isPrivate ? 26 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>

        <div className="rounded-xl p-4"
          style={{ background: 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(75, 85, 99, 0.15)' }}>
          <h4 className="text-gray-300 font-medium text-sm mb-3">What happens when your account is private?</h4>
          <ul className="space-y-2.5">
            {[
              'Only followers you approve can see your posts',
              'People must send a follow request',
              'Your posts won\'t appear in explore page',
            ].map((text, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-2 text-gray-400 text-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="text-indigo-400 mt-0.5">•</span>
                {text}
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    ),
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <motion.div
        className="relative w-full max-w-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col rounded-2xl"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(99, 102, 241, 0.12)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
          <h2 className="text-white font-bold text-lg">Edit Profile</h2>
          <motion.button onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"
            whileTap={{ scale: 0.9 }}>
            <X size={22} />
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 relative" style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeEditTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait">
            {tabContent[activeTab]}
          </AnimatePresence>

          {/* Footer */}
          <div className="p-4 shrink-0 flex items-center justify-end gap-3"
            style={{ borderTop: '1px solid rgba(75, 85, 99, 0.2)' }}>
            <motion.button type="button" onClick={onClose}
              className="btn-ghost text-sm" whileTap={{ scale: 0.97 }}>
              Cancel
            </motion.button>
            <motion.button type="submit" disabled={isLoading}
              className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              {isLoading ? (
                <>
                  <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProfileModal;