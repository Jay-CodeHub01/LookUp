// src/pages/ExplorePage.jsx
import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader, Compass } from 'lucide-react';
import { getExplorePosts } from '../api/postApi';
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
    <div className="skeleton h-48 rounded-xl" />
    <div className="space-y-2">
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
    </div>
  </div>
);

const ExplorePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);

  const fetchExplore = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const { data } = await getExplorePosts(pageNum, 10);
      const fetchedPosts = data.data?.posts || data.posts || [];

      if (pageNum === 1) {
        setPosts(fetchedPosts);
      } else {
        setPosts((prev) => [...prev, ...fetchedPosts]);
      }

      setHasMore(fetchedPosts.length >= 10);
      setPage(pageNum);
    } catch (error) {
      toast.error('Failed to load explore');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchExplore(1);
  }, []);

  const lastPostRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchExplore(page + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loadingMore, hasMore, page]
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="skeleton w-8 h-8 rounded-lg" />
            <div className="skeleton h-7 w-24 rounded" />
          </div>
          <SkeletonPost />
          <SkeletonPost />
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
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Compass size={28} className="text-indigo-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Explore</h1>
        </motion.div>

        {posts.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <Compass size={48} className="text-gray-600 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-white text-xl font-bold mb-2">Nothing to explore</h2>
            <p className="text-gray-500 text-sm">Check back later for new content.</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => {
              if (index === posts.length - 1) {
                return (
                  <div ref={lastPostRef} key={post._id}>
                    <PostCard post={post} />
                  </div>
                );
              }
              return <PostCard key={post._id} post={post} />;
            })}

            {loadingMore && (
              <div className="flex justify-center py-6">
                <motion.div
                  className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <motion.div className="text-center py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-gray-600 text-sm">That's all for now ✓</p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ExplorePage;