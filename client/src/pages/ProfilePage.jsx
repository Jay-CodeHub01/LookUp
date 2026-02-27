// src/pages/ProfilePage.jsx
import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [showFollowList, setShowFollowList] = useState(null); // 'followers' | 'following' | null

  const isOwnProfile = user?.username === username;

  useEffect(() => {
    fetchProfile();
    fetchPosts(1);
  }, [username]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await getUserProfile(username);
      setProfile(data.user || data);
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
      const fetchedPosts = data.posts || data;
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
      setProfile((prev) => ({
        ...prev,
        isFollowing: data.status === 'following' ? true : false,
        isRequested: data.status === 'requested' ? true : false,
        followersCount: data.status === 'following'
          ? (prev.followersCount || 0) + 1
          : prev.followersCount,
      }));
      toast.success(
        data.status === 'requested' ? 'Follow request sent' : `Following ${username}`
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

  // Render follow button based on relationship
  const renderFollowButton = () => {
    if (isOwnProfile) {
      return (
        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center gap-2 px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl border border-gray-700 transition-all text-sm"
        >
          <Settings size={16} />
          Edit Profile
        </button>
      );
    }

    if (profile?.isFollowing) {
      return (
        <button
          onClick={handleUnfollow}
          disabled={followLoading}
          className="flex items-center gap-2 px-5 py-2 bg-gray-800 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 text-white font-medium rounded-xl border border-gray-700 transition-all text-sm group disabled:opacity-50"
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
        </button>
      );
    }

    if (profile?.isRequested) {
      return (
        <button
          onClick={handleCancelRequest}
          disabled={followLoading}
          className="flex items-center gap-2 px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl border border-gray-700 transition-all text-sm disabled:opacity-50"
        >
          {followLoading ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <>
              <Clock size={16} />
              Requested
            </>
          )}
        </button>
      );
    }

    return (
      <button
        onClick={handleFollow}
        disabled={followLoading}
        className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all text-sm disabled:opacity-50"
      >
        {followLoading ? (
          <Loader size={16} className="animate-spin" />
        ) : (
          <>
            <UserPlus size={16} />
            Follow
          </>
        )}
      </button>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-20">
          <Loader className="animate-spin text-blue-500" size={32} />
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h2 className="text-white text-xl font-bold">User not found</h2>
          <p className="text-gray-500 mt-2">The profile you're looking for doesn't exist.</p>
        </div>
      </MainLayout>
    );
  }

  const isPrivateAndNotFollowing =
    profile.isPrivate && !profile.isFollowing && !isOwnProfile;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Cover Photo */}
        <div className="relative h-48 md:h-56 bg-gray-800 rounded-2xl overflow-hidden mb-16">
          {profile.coverPhoto ? (
            <img
              src={profile.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600/30 to-purple-600/30" />
          )}

          {/* Profile Picture */}
          <div className="absolute -bottom-12 left-6">
            <img
              src={profile.profilePicture || '/default-avatar.png'}
              alt={profile.username}
              className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-gray-950 ring-2 ring-gray-800"
            />
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-4">
          {/* Name & Actions Row */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.fullName}</h1>
              <p className="text-gray-500">@{profile.username}</p>
            </div>
            {renderFollowButton()}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-gray-300 text-sm mb-4 whitespace-pre-wrap">
              {profile.bio}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
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
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
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
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pb-6 border-b border-gray-800">
            <div className="text-center">
              <p className="text-white font-bold text-lg">
                {profile.postsCount || 0}
              </p>
              <p className="text-gray-500 text-xs">Posts</p>
            </div>
            <button
              onClick={() => setShowFollowList('followers')}
              className="text-center hover:opacity-80 transition-opacity"
            >
              <p className="text-white font-bold text-lg">
                {profile.followersCount || 0}
              </p>
              <p className="text-gray-500 text-xs">Followers</p>
            </button>
            <button
              onClick={() => setShowFollowList('following')}
              className="text-center hover:opacity-80 transition-opacity"
            >
              <p className="text-white font-bold text-lg">
                {profile.followingCount || 0}
              </p>
              <p className="text-gray-500 text-xs">Following</p>
            </button>
          </div>
        </div>

        {/* Posts Section */}
        <div className="mt-6 px-4">
          <div className="flex items-center gap-2 mb-6">
            <Grid3X3 size={18} className="text-white" />
            <h2 className="text-white font-semibold">Posts</h2>
          </div>

          {isPrivateAndNotFollowing ? (
            <div className="text-center py-16">
              <Lock size={48} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">
                This Account is Private
              </h3>
              <p className="text-gray-500 text-sm">
                Follow this account to see their posts.
              </p>
            </div>
          ) : posts.length === 0 && !postsLoading ? (
            <div className="text-center py-16">
              <Grid3X3 size={48} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">No Posts Yet</h3>
              <p className="text-gray-500 text-sm">
                {isOwnProfile
                  ? 'Share your first post!'
                  : `${profile.username} hasn't posted anything yet.`}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDelete={handlePostDelete}
                />
              ))} */}

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center py-4">
                  <button
                    onClick={loadMore}
                    disabled={postsLoading}
                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {postsLoading ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
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

      {showFollowList && (
        <FollowListModal
          username={username}
          type={showFollowList}
          onClose={() => setShowFollowList(null)}
        />
      )}
    </MainLayout>
  );
};

export default ProfilePage;