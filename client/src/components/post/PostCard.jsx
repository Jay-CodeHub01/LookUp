// src/components/post/PostCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Trash2,
  Edit3,
  Bookmark,
  Send,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { likePost, unlikePost, addComment, deletePost } from '../../api/postApi';
import { timeAgo } from '../../utils/timeAgo';
import toast from 'react-hot-toast';
import CommentSection from './CommentSection';

const PostCard = ({ post, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const [postData, setPostData] = useState(post);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const isOwner = user?._id === postData.author?._id;
  const isLiked = postData.likes?.includes(user?._id) || postData.isLiked;

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    try {
      if (isLiked) {
        await unlikePost(postData._id);
        setPostData((prev) => ({
          ...prev,
          isLiked: false,
          likes: prev.likes?.filter((id) => id !== user._id),
          likesCount: (prev.likesCount || prev.likes?.length || 1) - 1,
        }));
      } else {
        await likePost(postData._id);
        setPostData((prev) => ({
          ...prev,
          isLiked: true,
          likes: [...(prev.likes || []), user._id],
          likesCount: (prev.likesCount || prev.likes?.length || 0) + 1,
        }));
      }
    } catch (error) {
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDoubleTapLike = async () => {
    if (!isLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 1000);
      await handleLike();
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      await addComment(postData._id, { text: commentText });
      setCommentText('');
      setPostData((prev) => ({
        ...prev,
        commentsCount: (prev.commentsCount || 0) + 1,
      }));
      setShowComments(true);
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await deletePost(postData._id);
      toast.success('Post deleted');
      onDelete?.(postData._id);
    } catch (error) {
      toast.error('Failed to delete post');
    }
    setShowMenu(false);
  };

  // Parse hashtags in caption
  const renderCaption = (text) => {
    if (!text) return null;
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <Link
            key={i}
            to={`/hashtag/${part.slice(1)}`}
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {part}
          </Link>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const likesCount = postData.likesCount ?? postData.likes?.length ?? 0;
  const commentsCount = postData.commentsCount ?? 0;

  return (
    <motion.article
      className="card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      layout
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link
          to={`/${postData.author?.username}`}
          className="flex items-center gap-3 group"
        >
          <motion.div whileHover={{ scale: 1.08 }} transition={{ type: 'spring', stiffness: 300 }}>
            <img
              src={postData.author?.profilePicture?.url || postData.author?.profilePicture || '/default-avatar.png'}
              alt={postData.author?.username}
              className="w-10 h-10 rounded-full object-cover"
              style={{ border: '2px solid rgba(99, 102, 241, 0.2)' }}
            />
          </motion.div>
          <div>
            <h3 className="text-white font-semibold text-sm group-hover:text-indigo-400 transition-colors">
              {postData.author?.username}
            </h3>
            <p className="text-gray-500 text-xs">{timeAgo(postData.createdAt)}</p>
          </div>
        </Link>

        {isOwner && (
          <div className="relative">
            <motion.button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"
              whileTap={{ scale: 0.9 }}
            >
              <MoreHorizontal size={20} />
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <motion.div
                    className="absolute right-0 top-full mt-1 z-20 min-w-[150px] overflow-hidden rounded-xl"
                    style={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(99, 102, 241, 0.15)',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                    }}
                    initial={{ opacity: 0, scale: 0.9, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -5 }}
                    transition={{ duration: 0.15 }}
                  >
                    <button
                      onClick={() => { setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Image */}
      {postData.images && postData.images.length > 0 && (
        <div
          className="relative bg-black/50 overflow-hidden cursor-pointer"
          onDoubleClick={handleDoubleTapLike}
        >
          {postData.images.length === 1 ? (
            <motion.img
              src={postData.images[0].url || postData.images[0]}
              alt="Post"
              className="w-full max-h-[600px] object-contain"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-thin">
              {postData.images.map((img, idx) => (
                <motion.img
                  key={idx}
                  src={img.url || img}
                  alt={`Post image ${idx + 1}`}
                  className="w-full max-h-[600px] object-contain flex-shrink-0 snap-center"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          )}
          
          {/* Heart Burst Animation */}
          <AnimatePresence>
            {showHeartBurst && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 1] }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Heart size={80} className="text-red-500" fill="currentColor"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.6))' }} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleLike}
              className={`transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-400 hover:text-white'
              }`}
              whileTap={{ scale: 0.75 }}
              animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart size={24} fill={isLiked ? 'currentColor' : 'none'}
                style={isLiked ? { filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))' } : {}} />
            </motion.button>
            <motion.button
              onClick={() => setShowComments(!showComments)}
              className="text-gray-400 hover:text-white transition-colors"
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
            >
              <MessageCircle size={24} />
            </motion.button>
            <motion.button
              className="text-gray-400 hover:text-white transition-colors"
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
            >
              <Send size={24} />
            </motion.button>
          </div>
          <motion.button
            className={`transition-colors ${isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-white'}`}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            <Bookmark size={24} fill={isBookmarked ? 'currentColor' : 'none'} />
          </motion.button>
        </div>

        {/* Likes Count */}
        {likesCount > 0 && (
          <motion.p
            className="text-white font-semibold text-sm mb-2"
            key={likesCount}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
          </motion.p>
        )}

        {/* Caption */}
        {postData.caption && (
          <div className="text-sm mb-2">
            <Link
              to={`/${postData.author?.username}`}
              className="text-white font-semibold mr-2 hover:text-indigo-400 transition-colors"
            >
              {postData.author?.username}
            </Link>
            <span className="text-gray-300">{renderCaption(postData.caption)}</span>
          </div>
        )}

        {/* Comments Count */}
        {commentsCount > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="text-gray-500 text-sm hover:text-gray-400 transition-colors"
          >
            View all {commentsCount} comments
          </button>
        )}

        {/* Comment Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CommentSection
                postId={postData._id}
                onClose={() => setShowComments(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Comment */}
        <form onSubmit={handleComment} className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(75, 85, 99, 0.2)' }}>
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
          />
          <motion.button
            type="submit"
            disabled={!commentText.trim() || isCommenting}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            Post
          </motion.button>
        </form>
      </div>
    </motion.article>
  );
};

export default PostCard;