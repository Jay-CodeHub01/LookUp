// src/pages/NotificationsPage.jsx
import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, UserPlus, Check, X, Loader } from 'lucide-react';
import { getFollowRequests, acceptFollowRequest, rejectFollowRequest } from '../api/userApi';
import MainLayout from '../components/layout/MainLayout';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await getFollowRequests();
      setRequests(data.data?.requests || data.requests || []);
    } catch (error) {
      console.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    if (actionLoading) return;
    setActionLoading(requestId);
    try {
      await acceptFollowRequest(requestId);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      toast.success('Follow request accepted');
    } catch (error) {
      toast.error('Failed to accept request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    if (actionLoading) return;
    setActionLoading(requestId);
    try {
      await rejectFollowRequest(requestId);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      toast.success('Follow request declined');
    } catch (error) {
      toast.error('Failed to decline request');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="skeleton w-8 h-8 rounded-lg" />
            <div className="skeleton h-7 w-36 rounded" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 flex items-center gap-4">
              <div className="skeleton w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-32 rounded" />
                <div className="skeleton h-3 w-24 rounded" />
              </div>
              <div className="flex gap-2">
                <div className="skeleton h-8 w-20 rounded-lg" />
                <div className="skeleton h-8 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            animate={{
              rotate: [0, 15, -15, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Bell size={28} className="text-indigo-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
        </motion.div>

        {/* Follow Requests Section */}
        {requests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <UserPlus size={16} />
              Follow Requests
              <span
                className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                }}
              >
                {requests.length}
              </span>
            </h2>

            <div className="space-y-3">
              <AnimatePresence>
                {requests.map((request, index) => (
                  <motion.div
                    key={request._id}
                    className="card p-4 flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0, padding: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    layout
                  >
                    <Link to={`/${request.from?.username}`}>
                      <motion.img
                        src={request.from?.profilePicture?.url || request.from?.profilePicture || '/default-avatar.png'}
                        alt={request.from?.username}
                        className="w-12 h-12 rounded-full object-cover"
                        style={{ border: '2px solid rgba(99, 102, 241, 0.15)' }}
                        whileHover={{ scale: 1.1 }}
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/${request.from?.username}`}
                        className="text-white font-semibold text-sm hover:text-indigo-400 transition-colors"
                      >
                        {request.from?.username}
                      </Link>
                      <p className="text-gray-500 text-xs truncate">
                        {request.from?.fullName} wants to follow you
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => handleAccept(request._id)}
                        disabled={actionLoading === request._id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                        style={{
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          boxShadow: '0 2px 12px rgba(99, 102, 241, 0.3)',
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {actionLoading === request._id ? (
                          <motion.div
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                        ) : (
                          <>
                            <Check size={14} />
                            Accept
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        onClick={() => handleReject(request._id)}
                        disabled={actionLoading === request._id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 disabled:opacity-50"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(75, 85, 99, 0.3)',
                        }}
                        whileHover={{ scale: 1.05, background: 'rgba(239, 68, 68, 0.1)' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <X size={14} />
                        Decline
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {requests.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Bell size={32} className="text-indigo-400" />
            </motion.div>
            <h2 className="text-white text-xl font-bold mb-2">You're all caught up</h2>
            <p className="text-gray-500 max-w-sm mx-auto text-sm">
              No new notifications or follow requests at the moment.
            </p>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;
