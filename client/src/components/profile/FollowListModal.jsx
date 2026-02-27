// src/components/profile/FollowListModal.jsx
import React from 'react'
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, UserMinus, Loader } from 'lucide-react';
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
      setUsers(data.followers || data.following || data);
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md mx-4 max-h-[70vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 shrink-0">
          <h2 className="text-white font-bold text-lg capitalize">{type}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800"
          >
            <X size={22} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="animate-spin text-blue-500" size={24} />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No {type} yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-800/50">
              {users.map((person) => (
                <li key={person._id} className="flex items-center justify-between p-4 hover:bg-gray-800/30 transition-colors">
                  <Link
                    to={`/${person.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <img
                      src={person.profilePicture || '/default-avatar.png'}
                      alt={person.username}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-700"
                    />
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate hover:underline">
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
                        <button
                          onClick={() => handleRemoveFollower(person._id)}
                          disabled={actionLoading[person._id]}
                          className="px-3 py-1.5 text-xs font-medium text-gray-300 bg-gray-800 hover:bg-red-500/20 hover:text-red-400 border border-gray-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {actionLoading[person._id] ? (
                            <Loader size={12} className="animate-spin" />
                          ) : (
                            'Remove'
                          )}
                        </button>
                      ) : person.isFollowing ? (
                        <button
                          onClick={() => handleUnfollow(person._id)}
                          disabled={actionLoading[person._id]}
                          className="px-3 py-1.5 text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {actionLoading[person._id] ? (
                            <Loader size={12} className="animate-spin" />
                          ) : (
                            'Following'
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFollow(person._id)}
                          disabled={actionLoading[person._id]}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {actionLoading[person._id] ? (
                            <Loader size={12} className="animate-spin" />
                          ) : (
                            'Follow'
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;