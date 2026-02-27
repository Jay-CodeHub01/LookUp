// src/pages/HashtagPage.jsx
import React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Hash, Loader } from 'lucide-react';
import { getHashtagPosts } from '../api/postApi';
import MainLayout from '../components/layout/MainLayout';
import PostCard from '../components/post/PostCard';

const HashtagPage = () => {
  const { tag } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);
      const { data } = await getHashtagPosts(tag, pageNum);
      const fetchedPosts = data.posts || data;

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
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, [tag]);

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
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <Hash size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">#{tag}</h1>
            <p className="text-gray-500 text-sm">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </p>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <Hash size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No posts found</h3>
            <p className="text-gray-500 text-sm">
              No posts with #{tag} yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}

            {hasMore && (
              <div className="flex justify-center py-4">
                <button
                  onClick={() => fetchPosts(page + 1)}
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default HashtagPage;