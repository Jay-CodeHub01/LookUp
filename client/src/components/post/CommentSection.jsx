// src/components/post/CommentSection.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getComments,
  deleteComment,
  likeComment,
  unlikeComment,
  getCommentReplies,
  addComment,
} from '../../api/postApi';
import { timeAgo } from '../../utils/timeAgo';
import toast from 'react-hot-toast';

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data } = await getComments(postId);
      setComments(data.data?.comments || data.comments || []);
    } catch (error) {
      console.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(postId, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleLikeComment = async (commentId, isLiked) => {
    try {
      if (isLiked) {
        await unlikeComment(postId, commentId);
      } else {
        await likeComment(postId, commentId);
      }
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? {
                ...c,
                isLiked: !isLiked,
                likesCount: isLiked
                  ? (c.likesCount || 1) - 1
                  : (c.likesCount || 0) + 1,
              }
            : c
        )
      );
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await addComment(postId, {
        text: replyText,
        parentCommentId: replyTo,
      });
      setReplyText('');
      setReplyTo(null);
      fetchComments();
      toast.success('Reply added');
    } catch (error) {
      toast.error('Failed to add reply');
    }
  };

  const loadReplies = async (commentId) => {
    try {
      const { data } = await getCommentReplies(postId, commentId);
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, replies: data.data?.replies || data.replies || [], showReplies: true }
            : c
        )
      );
    } catch (error) {
      toast.error('Failed to load replies');
    }
  };

  if (loading) {
    return (
      <div className="py-4 flex justify-center">
        <motion.div
          className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
      {comments.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-2">No comments yet</p>
      ) : (
        <AnimatePresence>
          {comments.map((comment, index) => (
            <motion.div
              key={comment._id}
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="flex items-start gap-3 group">
                <Link to={`/${comment.author?.username}`}>
                  <motion.img
                    src={comment.author?.profilePicture?.url || comment.author?.profilePicture || '/default-avatar.png'}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                    style={{ border: '1.5px solid rgba(99, 102, 241, 0.15)' }}
                    whileHover={{ scale: 1.1 }}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <Link
                      to={`/${comment.author?.username}`}
                      className="text-white font-semibold mr-2 hover:text-indigo-400 transition-colors"
                    >
                      {comment.author?.username}
                    </Link>
                    <span className="text-gray-300">{comment.text}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-gray-500 text-xs">
                      {timeAgo(comment.createdAt)}
                    </span>
                    {comment.likesCount > 0 && (
                      <span className="text-gray-500 text-xs">
                        {comment.likesCount} {comment.likesCount === 1 ? 'like' : 'likes'}
                      </span>
                    )}
                    <button
                      onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                      className="text-gray-500 text-xs font-semibold hover:text-indigo-400 transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    onClick={() => handleLikeComment(comment._id, comment.isLiked)}
                    className={`p-1 ${
                      comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
                    }`}
                    whileTap={{ scale: 0.8 }}
                  >
                    <Heart size={12} fill={comment.isLiked ? 'currentColor' : 'none'} />
                  </motion.button>
                  {comment.author?._id === user?._id && (
                    <motion.button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                      whileTap={{ scale: 0.8 }}
                    >
                      <Trash2 size={12} />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* View Replies Button */}
              {comment.repliesCount > 0 && !comment.showReplies && (
                <motion.button
                  onClick={() => loadReplies(comment._id)}
                  className="ml-11 flex items-center gap-1 text-gray-500 text-xs hover:text-indigo-400 transition-colors"
                  whileHover={{ x: 3 }}
                >
                  <ChevronDown size={12} />
                  View {comment.repliesCount} {comment.repliesCount === 1 ? 'reply' : 'replies'}
                </motion.button>
              )}

              {/* Replies */}
              <AnimatePresence>
                {comment.showReplies && comment.replies?.map((reply, rIndex) => (
                  <motion.div
                    key={reply._id}
                    className="ml-11 flex items-start gap-3 group"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rIndex * 0.05 }}
                  >
                    <Link to={`/${reply.author?.username}`}>
                      <img
                        src={reply.author?.profilePicture?.url || reply.author?.profilePicture || '/default-avatar.png'}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover"
                        style={{ border: '1px solid rgba(99, 102, 241, 0.1)' }}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        <Link
                          to={`/${reply.author?.username}`}
                          className="text-white font-semibold mr-2 hover:text-indigo-400 transition-colors"
                        >
                          {reply.author?.username}
                        </Link>
                        <span className="text-gray-300">{reply.text}</span>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {timeAgo(reply.createdAt)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Reply Input */}
              <AnimatePresence>
                {replyTo === comment._id && (
                  <motion.form
                    onSubmit={handleReply}
                    className="ml-11 flex items-center gap-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to @${comment.author?.username}...`}
                      className="input-premium text-sm py-2"
                      autoFocus
                    />
                    <motion.button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="text-indigo-400 text-sm font-semibold disabled:opacity-30 transition-colors"
                      whileTap={{ scale: 0.9 }}
                    >
                      Post
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};

export default CommentSection;