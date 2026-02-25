// src/components/post/PostCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
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
            className="text-blue-400 hover:text-blue-300"
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
    <article className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link
          to={`/${postData.author?.username}`}
          className="flex items-center gap-3"
        >
          <img
            src={postData.author?.profilePicture || '/default-avatar.png'}
            alt={postData.author?.username}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-700"
          />
          <div>
            <h3 className="text-white font-semibold text-sm hover:underline">
              {postData.author?.username}
            </h3>
            <p className="text-gray-500 text-xs">{timeAgo(postData.createdAt)}</p>
          </div>
        </Link>

        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-white p-1"
            >
              <MoreHorizontal size={20} />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-20 min-w-[150px] overflow-hidden">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      // Trigger edit
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Image */}
      {postData.image && (
        <div className="relative bg-black">
          <img
            src={postData.image}
            alt="Post"
            className="w-full max-h-[600px] object-contain"
            onDoubleClick={handleLike}
          />
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`transition-all hover:scale-110 active:scale-95 ${
                isLiked ? 'text-red-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-gray-400 hover:text-white transition-all hover:scale-110"
            >
              <MessageCircle size={24} />
            </button>
            <button className="text-gray-400 hover:text-white transition-all hover:scale-110">
              <Send size={24} />
            </button>
          </div>
          <button className="text-gray-400 hover:text-white transition-all hover:scale-110">
            <Bookmark size={24} />
          </button>
        </div>

        {/* Likes Count */}
        {likesCount > 0 && (
          <p className="text-white font-semibold text-sm mb-2">
            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
          </p>
        )}

        {/* Caption */}
        {postData.caption && (
          <div className="text-sm mb-2">
            <Link
              to={`/${postData.author?.username}`}
              className="text-white font-semibold mr-2 hover:underline"
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
            className="text-gray-500 text-sm hover:text-gray-400"
          >
            View all {commentsCount} comments
          </button>
        )}

        {/* Comment Section */}
        {showComments && (
          <CommentSection
            postId={postData._id}
            onClose={() => setShowComments(false)}
          />
        )}

        {/* Add Comment */}
        <form onSubmit={handleComment} className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || isCommenting}
            className="text-blue-500 hover:text-blue-400 text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Post
          </button>
        </form>
      </div>
    </article>
  );
};

export default PostCard;