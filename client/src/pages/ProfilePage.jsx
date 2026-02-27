// src/pages/ProfilePage.jsx
import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Grid3X3,
  MapPin,
  LinkIcon,
  Calendar,
  Lock,
  UserPlus,
  UserCheck,
  Clock,
  UserX,
  Loader,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, followUser, unfollowUser, cancelRequest } from '../api/userApi';
import { getUserPosts } from '../api/postApi';
import { timeAgo } from '../utils/timeAgo';
import MainLayout from '../components/layout/MainLayout';
import PostCard from '../components/post/PostCard';
import EditProfileModal from '../components/profile/EditProfileModal';
import FollowListModal from '../components/profile/FollowListModal';
import toast from 'react-hot-toast';

const AnimatedCounter = ({ value }) => {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {value}
    </motion.span>
  );
};

const ProfilePage = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowList, setShowFollowList] = useState(null);

  const isOwnProfile = user?.username === username;

  useEffect(() => {
    fetchProfile();
    fetchPosts(1);
  }, [username]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await getUserProfile(username);
      const profileData = data.data || data;
      const userData = profileData.user || profileData;
      // Merge follow status info into profile object
      userData.isFollowing = profileData.isFollowing || false;
      userData.isRequested = profileData.followRequestStatus === 'pending';
      userData.postsCount = userData.postsCount || 0;
      userData.followersCount = userData.followersCount || 0;
      userData.followingCount = userData.followingCount || 0;
      setProfile(userData);
    } catch (error) {
      if (error.response?.status === 404) {
        navigate('/not-found');
      }
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (pageNum = 1) => {
    setPostsLoading(true);
    try {
      const { data } = await getUserPosts(username, pageNum);
      const fetchedPosts = data.data?.posts || data.posts || [];
      if (pageNum === 1) {
        setPosts(fetchedPosts);
      } else {
        setPosts((prev) => [...prev, ...fetchedPosts]);
      }
      setHasMore(fetchedPosts.length >= 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);

    try {
      const { data } = await followUser(profile._id);
      const status = data.data?.followStatus || data.status;
      setProfile((prev) => ({
        ...prev,
        isFollowing: status === 'following',
        isRequested: status === 'requested',
        followersCount: status === 'following'
          ? (prev.followersCount || 0) + 1
          : prev.followersCount,
      }));
      toast.success(
        status === 'requested' ? 'Follow request sent' : `Following ${username}`
      );
    } catch (error) {
      toast.error('Failed to follow');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);

    try {
      await unfollowUser(profile._id);
      setProfile((prev) => ({
        ...prev,
        isFollowing: false,
        followersCount: Math.max((prev.followersCount || 1) - 1, 0),
      }));
      toast.success(`Unfollowed ${username}`);
    } catch (error) {
      toast.error('Failed to unfollow');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (followLoading) return;
    setFollowLoading(true);

    try {
      await cancelRequest(profile._id);
      setProfile((prev) => ({
        ...prev,
        isRequested: false,
      }));
      toast.success('Follow request cancelled');
    } catch (error) {
      toast.error('Failed to cancel request');
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    setProfile((prev) => ({
      ...prev,
      postsCount: Math.max((prev.postsCount || 1) - 1, 0),
    }));
  };

  const loadMore = () => {
    if (!postsLoading && hasMore) {
      fetchPosts(page + 1);
    }
  };

  const renderFollowButton = () => {
    if (isOwnProfile) {
      return (
        <motion.button
          onClick={() => setShowEditModal(true)}
          className="btn-ghost flex items-center gap-2 text-sm"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Settings size={16} />
          Edit Profile
        </motion.button>
      );
    }

    if (profile?.isFollowing) {
      return (
        <motion.button
          onClick={handleUnfollow}
          disabled={followLoading}
          className="btn-ghost flex items-center gap-2 text-sm group disabled:opacity-50"
          whileTap={{ scale: 0.97 }}
          style={{ transition: 'all 0.3s ease' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            e.currentTarget.style.color = '#f87171';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '';
            e.currentTarget.style.borderColor = '';
            e.currentTarget.style.color = '';
          }}
        >
          {followLoading ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <>
              <UserCheck size={16} className="group-hover:hidden" />
              <UserX size={16} className="hidden group-hover:block" />
              <span className="group-hover:hidden">Following</span>
              <span className="hidden group-hover:block">Unfollow</span>
            </>
          )}
        </motion.button>
      );
    }

    if (profile?.isRequested) {
      return (
        <motion.button
          onClick={handleCancelRequest}
          disabled={followLoading}
          className="btn-ghost flex items-center gap-2 text-sm text-gray-300 disabled:opacity-50"
          whileTap={{ scale: 0.97 }}
        >
          {followLoading ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <>
              <Clock size={16} />
              Requested
            </>
          )}
        </motion.button>
      );
    }

    return (
      <motion.button
        onClick={handleFollow}
        disabled={followLoading}
        className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {followLoading ? (
          <Loader size={16} className="animate-spin" />
        ) : (
          <>
            <UserPlus size={16} />
            Follow
          </>
        )}
      </motion.button>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <div className="skeleton h-48 md:h-56 rounded-2xl mb-16" />
          <div className="px-4 space-y-4">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="skeleton h-7 w-40 rounded" />
                <div className="skeleton h-4 w-24 rounded" />
              </div>
              <div className="skeleton h-10 w-28 rounded-xl" />
            </div>
            <div className="skeleton h-4 w-full rounded" />
            <div className="flex gap-6">
              <div className="skeleton h-12 w-16 rounded" />
              <div className="skeleton h-12 w-16 rounded" />
              <div className="skeleton h-12 w-16 rounded" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-white text-xl font-bold">User not found</h2>
          <p className="text-gray-500 mt-2 text-sm">The profile you're looking for doesn't exist.</p>
        </motion.div>
      </MainLayout>
    );
  }

  const isPrivateAndNotFollowing =
    profile.isPrivate && !profile.isFollowing && !isOwnProfile;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Cover Photo */}
        <motion.div
          className="relative h-48 md:h-56 rounded-2xl overflow-hidden mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {profile.coverPhoto ? (
            <img
              src={profile.coverPhoto?.url || profile.coverPhoto || profile.coverPicture?.url || profile.coverPicture}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : !profile.coverPicture?.url && !profile.coverPicture ? (
            <div className="w-full h-full"
              style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.1))' }} />
          ) : (
            <img
              src={profile.coverPicture?.url || profile.coverPicture}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-20"
            style={{ background: 'linear-gradient(to top, rgba(3, 7, 18, 0.8), transparent)' }} />

          {/* Profile Picture */}
          <motion.div
            className="absolute -bottom-12 left-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          >
            <div className="relative group">
              <img
                src={profile.profilePicture?.url || profile.profilePicture || '/default-avatar.png'}
                alt={profile.username}
                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover"
                style={{
                  border: '4px solid #030712',
                  boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: '2px solid rgba(99, 102, 241, 0.3)' }}
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(99, 102, 241, 0)',
                    '0 0 0 4px rgba(99, 102, 241, 0.1)',
                    '0 0 0 0 rgba(99, 102, 241, 0)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Profile Info */}
        <div className="px-4">
          {/* Name & Actions Row */}
          <motion.div
            className="flex items-start justify-between mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.fullName}</h1>
              <p className="text-gray-500">@{profile.username}</p>
            </div>
            {renderFollowButton()}
          </motion.div>

          {/* Bio */}
          {profile.bio && (
            <motion.p
              className="text-gray-300 text-sm mb-4 whitespace-pre-wrap leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              {profile.bio}
            </motion.p>
          )}

          {/* Meta Info */}
          <motion.div
            className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <LinkIcon size={14} />
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            {profile.createdAt && (
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            )}
            {profile.isPrivate && (
              <span className="flex items-center gap-1">
                <Lock size={14} />
                Private
              </span>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex items-center gap-6 pb-6"
            style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <div className="text-center">
              <p className="text-white font-bold text-lg">
                <AnimatedCounter value={profile.postsCount || 0} />
              </p>
              <p className="text-gray-500 text-xs">Posts</p>
            </div>
            <motion.button
              onClick={() => setShowFollowList('followers')}
              className="text-center hover:opacity-80 transition-opacity"
              whileTap={{ scale: 0.95 }}
            >
              <p className="text-white font-bold text-lg">
                <AnimatedCounter value={profile.followersCount || 0} />
              </p>
              <p className="text-gray-500 text-xs">Followers</p>
            </motion.button>
            <motion.button
              onClick={() => setShowFollowList('following')}
              className="text-center hover:opacity-80 transition-opacity"
              whileTap={{ scale: 0.95 }}
            >
              <p className="text-white font-bold text-lg">
                <AnimatedCounter value={profile.followingCount || 0} />
              </p>
              <p className="text-gray-500 text-xs">Following</p>
            </motion.button>
          </motion.div>
        </div>

        {/* Posts Section */}
        <motion.div
          className="mt-6 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Grid3X3 size={18} className="text-indigo-400" />
            <h2 className="text-white font-semibold">Posts</h2>
          </div>

          {isPrivateAndNotFollowing ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Lock size={48} className="text-gray-600 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-white font-semibold text-lg mb-2">
                This Account is Private
              </h3>
              <p className="text-gray-500 text-sm">
                Follow this account to see their posts.
              </p>
            </motion.div>
          ) : posts.length === 0 && !postsLoading ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Grid3X3 size={48} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">No Posts Yet</h3>
              <p className="text-gray-500 text-sm">
                {isOwnProfile
                  ? 'Share your first post!'
                  : `${profile.username} hasn't posted anything yet.`}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDelete={handlePostDelete}
                />
              ))}

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center py-4">
                  <motion.button
                    onClick={loadMore}
                    disabled={postsLoading}
                    className="btn-ghost text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {postsLoading ? (
                      <motion.div
                        className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : (
                      'Load More'
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showEditModal && (
          <EditProfileModal
            onClose={() => setShowEditModal(false)}
            profileData={profile}
            onProfileUpdate={() => {
              fetchProfile();
              fetchPosts(1);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFollowList && (
          <FollowListModal
            username={username}
            type={showFollowList}
            onClose={() => setShowFollowList(null)}
          />
        )}
      </AnimatePresence>
    </MainLayout>
  );
};

export default ProfilePage;