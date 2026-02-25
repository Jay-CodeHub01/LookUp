// src/components/post/CommentSection.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
      setComments(data.comments || data);
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
        parentComment: replyTo,
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
            ? { ...c, replies: data.replies || data, showReplies: true }
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
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
      {comments.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-2">No comments yet</p>
      ) : (
        comments.map((comment) => (
          <div key={comment._id} className="space-y-2">
            <div className="flex items-start gap-3 group">
              <Link to={`/${comment.author?.username}`}>
                <img
                  src={comment.author?.profilePicture || '/default-avatar.png'}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <Link
                    to={`/${comment.author?.username}`}
                    className="text-white font-semibold mr-2 hover:underline"
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
                    className="text-gray-500 text-xs font-semibold hover:text-gray-300"
                  >
                    Reply
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleLikeComment(comment._id, comment.isLiked)}
                  className={`p-1 ${
                    comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
                  }`}
                >
                  <Heart size={12} fill={comment.isLiked ? 'currentColor' : 'none'} />
                </button>
                {comment.author?._id === user?._id && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="p-1 text-gray-500 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* View Replies Button */}
            {comment.repliesCount > 0 && !comment.showReplies && (
              <button
                onClick={() => loadReplies(comment._id)}
                className="ml-11 flex items-center gap-1 text-gray-500 text-xs hover:text-gray-400"
              >
                <ChevronDown size={12} />
                View {comment.repliesCount} {comment.repliesCount === 1 ? 'reply' : 'replies'}
              </button>
            )}

            {/* Replies */}
            {comment.showReplies && comment.replies?.map((reply) => (
              <div key={reply._id} className="ml-11 flex items-start gap-3 group">
                <Link to={`/${reply.author?.username}`}>
                  <img
                    src={reply.author?.profilePicture || '/default-avatar.png'}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <Link
                      to={`/${reply.author?.username}`}
                      className="text-white font-semibold mr-2 hover:underline"
                    >
                      {reply.author?.username}
                    </Link>
                    <span className="text-gray-300">{reply.text}</span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {timeAgo(reply.createdAt)}
                  </span>
                </div>
              </div>
            ))}

            {/* Reply Input */}
            {replyTo === comment._id && (
              <form
                onSubmit={handleReply}
                className="ml-11 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to @${comment.author?.username}...`}
                  className="flex-1 bg-gray-800 text-sm text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="text-blue-500 text-sm font-semibold disabled:opacity-30"
                >
                  Post
                </button>
              </form>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default CommentSection;