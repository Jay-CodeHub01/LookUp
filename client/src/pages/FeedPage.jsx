// src/pages/FeedPage.jsx
import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader, RefreshCw } from 'lucide-react';
import { getFeed } from '../api/postApi';
import MainLayout from '../components/layout/MainLayout';
import PostCard from '../components/post/PostCard';
import toast from 'react-hot-toast';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
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
    }
  };

  useEffect(() => {
    fetchFeed(1);
  }, []);

  // Infinite scroll
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
    fetchFeed(1, true);
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

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Home</h1>
          <button
            onClick={handleRefresh}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800 transition-all"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📭</span>
            </div>
            <h2 className="text-white text-xl font-bold mb-2">Your feed is empty</h2>
            <p className="text-gray-500 max-w-sm mx-auto">
              Start following people to see their posts here. Discover new people in the Explore page.
            </p>
          </div>
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

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex justify-center py-6">
                <Loader className="animate-spin text-blue-500" size={24} />
              </div>
            )}

            {/* End of Feed */}
            {!hasMore && posts.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600 text-sm">You've seen all posts ✓</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FeedPage;