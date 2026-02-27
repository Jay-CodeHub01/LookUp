// src/pages/ExplorePage.jsx
import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader, Compass } from 'lucide-react';
import { getExplorePosts } from '../api/postApi';
import MainLayout from '../components/layout/MainLayout';
import PostCard from '../components/post/PostCard';
import toast from 'react-hot-toast';

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
      const fetchedPosts = data.posts || data;

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
        <div className="flex justify-center py-20">
          <Loader className="animate-spin text-blue-500" size={32} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Compass size={28} className="text-white" />
          <h1 className="text-2xl font-bold text-white">Explore</h1>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <Compass size={48} className="text-gray-600 mx-auto mb-4" />
            <h2 className="text-white text-xl font-bold mb-2">Nothing to explore</h2>
            <p className="text-gray-500">Check back later for new content.</p>
          </div>
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
                <Loader className="animate-spin text-blue-500" size={24} />
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600 text-sm">That's all for now ✓</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ExplorePage;