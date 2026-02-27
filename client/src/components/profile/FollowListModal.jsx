// src/components/profile/FollowListModal.jsx
import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader } from 'lucide-react';
import { getFollowers, getFollowing, removeFollower, unfollowUser, followUser } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const FollowListModal = ({ username, type, onClose }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const isOwnProfile = user?.username === username;

  useEffect(() => {
    fetchUsers();
  }, [username, type]);

  const fetchUsers = async () => {
    try {
      const { data } =
        type === 'followers'
          ? await getFollowers(username)
          : await getFollowing(username);
      setUsers(data.data?.followers || data.data?.following || data.followers || data.following || []);
    } catch (error) {
      toast.error(`Failed to load ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFollower = async (userId) => {
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      await removeFollower(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success('Follower removed');
    } catch (error) {
      toast.error('Failed to remove follower');
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnfollow = async (userId) => {
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      await unfollowUser(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isFollowing: false } : u
        )
      );
      toast.success('Unfollowed');
    } catch (error) {
      toast.error('Failed to unfollow');
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleFollow = async (userId) => {
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      await followUser(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isFollowing: true } : u
        )
      );
      toast.success('Followed');
    } catch (error) {
      toast.error('Failed to follow');
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
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
        className="relative w-full max-w-md mx-4 max-h-[70vh] flex flex-col overflow-hidden rounded-2xl"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(99, 102, 241, 0.12)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
        }}
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
          <h2 className="text-white font-bold text-lg capitalize">{type}</h2>
          <motion.button onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"
            whileTap={{ scale: 0.9 }}>
            <X size={22} />
          </motion.button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {loading ? (
            <div className="flex justify-center py-12">
              <motion.div
                className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No {type} yet</p>
            </div>
          ) : (
            <ul>
              {users.map((person, index) => (
                <motion.li
                  key={person._id}
                  className="flex items-center justify-between p-4 hover:bg-white/3 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                  style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.1)' }}
                >
                  <Link
                    to={`/${person.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3 flex-1 min-w-0 group"
                  >
                    <motion.img
                      src={person.profilePicture?.url || person.profilePicture || '/default-avatar.png'}
                      alt={person.username}
                      className="w-11 h-11 rounded-full object-cover"
                      style={{ border: '2px solid rgba(99, 102, 241, 0.15)' }}
                      whileHover={{ scale: 1.08 }}
                    />
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate group-hover:text-indigo-400 transition-colors">
                        {person.username}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {person.fullName}
                      </p>
                    </div>
                  </Link>

                  {/* Action Buttons */}
                  {person._id !== user?._id && (
                    <div className="shrink-0 ml-3">
                      {type === 'followers' && isOwnProfile ? (
                        <motion.button
                          onClick={() => handleRemoveFollower(person._id)}
                          disabled={actionLoading[person._id]}
                          className="btn-ghost px-3 py-1.5 text-xs hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10"
                          whileTap={{ scale: 0.95 }}
                        >
                          {actionLoading[person._id] ? (
                            <Loader size={12} className="animate-spin" />
                          ) : (
                            'Remove'
                          )}
                        </motion.button>
                      ) : person.isFollowing ? (
                        <motion.button
                          onClick={() => handleUnfollow(person._id)}
                          disabled={actionLoading[person._id]}
                          className="btn-ghost px-3 py-1.5 text-xs"
                          whileTap={{ scale: 0.95 }}
                        >
                          {actionLoading[person._id] ? (
                            <Loader size={12} className="animate-spin" />
                          ) : (
                            'Following'
                          )}
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={() => handleFollow(person._id)}
                          disabled={actionLoading[person._id]}
                          className="btn-primary px-3 py-1.5 text-xs"
                          whileTap={{ scale: 0.95 }}
                        >
                          {actionLoading[person._id] ? (
                            <Loader size={12} className="animate-spin" />
                          ) : (
                            'Follow'
                          )}
                        </motion.button>
                      )}
                    </div>
                  )}
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FollowListModal;