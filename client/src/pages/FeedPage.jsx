// src/pages/FeedPage.jsx
import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, RefreshCw, Sparkles } from 'lucide-react';
import { getFeed } from '../api/postApi';
import MainLayout from '../components/layout/MainLayout';
import PostCard from '../components/post/PostCard';
import toast from 'react-hot-toast';

const SkeletonPost = () => (
  <div className="card p-4 space-y-4">
    <div className="flex items-center gap-3">
      <div className="skeleton w-10 h-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-2 w-16 rounded" />
      </div>
    </div>
    <div className="skeleton h-64 rounded-xl" />
    <div className="space-y-2">
      <div className="skeleton h-3 w-32 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-3/4 rounded" />
    </div>
  </div>
);

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const observerRef = useRef(null);

  const fetchFeed = async (pageNum = 1, isRefresh = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const { data } = await getFeed(pageNum, 10);
      const fetchedPosts = data.data?.posts || [];

      if (pageNum === 1 || isRefresh) {
        setPosts(fetchedPosts);
      } else {
        setPosts((prev) => [...prev, ...fetchedPosts]);
      }

      setHasMore(data.hasMore ?? fetchedPosts.length >= 10);
      setPage(pageNum);
    } catch (error) {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed(1);
  }, []);

  const lastPostRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchFeed(page + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loadingMore, hasMore, page]
  );

  const handlePostDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handleNewPost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchFeed(1, true);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div className="skeleton h-8 w-20 rounded" />
            <div className="skeleton h-8 w-8 rounded-lg" />
          </div>
          <SkeletonPost />
          <SkeletonPost />
          <SkeletonPost />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Home</h1>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles size={20} className="text-indigo-400" />
            </motion.div>
          </div>
          <motion.button
            onClick={handleRefresh}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all"
            whileTap={{ scale: 0.9 }}
            animate={isRefreshing ? { rotate: 360 } : {}}
            transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
          >
            <RefreshCw size={20} />
          </motion.button>
        </motion.div>

        {/* Posts */}
        {posts.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="text-4xl">📭</span>
            </motion.div>
            <h2 className="text-white text-xl font-bold mb-2">Your feed is empty</h2>
            <p className="text-gray-500 max-w-sm mx-auto text-sm">
              Start following people to see their posts here. Discover new people in the Explore page.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => {
              if (index === posts.length - 1) {
                return (
                  <div ref={lastPostRef} key={post._id}>
                    <PostCard post={post} onDelete={handlePostDelete} />
                  </div>
                );
              }
              return (
                <PostCard key={post._id} post={post} onDelete={handlePostDelete} />
              );
            })}

            {/* Loading More */}
            {loadingMore && (
              <div className="flex justify-center py-6">
                <motion.div
                  className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            )}

            {/* End of Feed */}
            {!hasMore && posts.length > 0 && (
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-gray-600 text-sm">You've seen all posts ✓</p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FeedPage;