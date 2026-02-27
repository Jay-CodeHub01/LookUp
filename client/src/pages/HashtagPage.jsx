// src/pages/HashtagPage.jsx
import React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hash, Loader } from 'lucide-react';
import { getHashtagPosts } from '../api/postApi';
import MainLayout from '../components/layout/MainLayout';
import PostCard from '../components/post/PostCard';

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
  </div>
);

const HashtagPage = () => {
  const { tag } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPosts = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      
      const { data } = await getHashtagPosts(tag, pageNum);
      const fetchedPosts = data.data?.posts || data.posts || [];

      if (pageNum === 1) {
        setPosts(fetchedPosts);
      } else {
        setPosts((prev) => [...prev, ...fetchedPosts]);
      }

      setHasMore(fetchedPosts.length >= 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load hashtag posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, [tag]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="skeleton w-12 h-12 rounded-2xl" />
            <div className="space-y-2">
              <div className="skeleton h-7 w-32 rounded" />
              <div className="skeleton h-3 w-16 rounded" />
            </div>
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
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            }}
            whileHover={{ scale: 1.05, rotate: 5 }}
            animate={{
              boxShadow: [
                '0 0 15px rgba(99, 102, 241, 0.1)',
                '0 0 25px rgba(99, 102, 241, 0.2)',
                '0 0 15px rgba(99, 102, 241, 0.1)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Hash size={24} className="text-indigo-400" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-white">#{tag}</h1>
            <motion.p
              className="text-gray-500 text-sm"
              key={posts.length}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </motion.p>
          </div>
        </motion.div>

        {posts.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Hash size={48} className="text-gray-600 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-white font-semibold mb-2">No posts found</h3>
            <p className="text-gray-500 text-sm">
              No posts with #{tag} yet.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}

            {hasMore && (
              <div className="flex justify-center py-4">
                <motion.button
                  onClick={() => fetchPosts(page + 1)}
                  disabled={loadingMore}
                  className="btn-ghost text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loadingMore ? (
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
      </div>
    </MainLayout>
  );
};

export default HashtagPage;