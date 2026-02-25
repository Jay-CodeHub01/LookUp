import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import { cloudinary } from "../config/cloudinary.js";

// ============================================================
//  POST CRUD
// ============================================================

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { caption, location } = req.body;

    // Must have either caption or images
    if (!caption && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Post must have a caption or at least one image",
      });
    }

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        images.push({
          url: file.path,
          publicId: file.filename,
        });
      }
    }
    
    // Extract mentions from caption (@username)
    let mentionedUserIds = [];
    if (caption) {
      const mentionRegex = /@(\w+)/g;
      const mentionMatches = caption.match(mentionRegex);
      if (mentionMatches) {
        const usernames = mentionMatches.map((m) => m.slice(1).toLowerCase());
        const mentionedUsers = await User.find({
          username: { $in: usernames },
          isActive: true,
        }).select("_id");
        mentionedUserIds = mentionedUsers.map((u) => u._id);
      }
    }
    
    const post = await Post.create({
      author: req.user._id,
      caption: caption || "",
      images,
      location: location || "",
      mentions: mentionedUserIds,
    });
    
    // Populate author info for response
    await post.populate("author", "username fullName profilePicture isVerified");
    await post.populate("mentions", "username fullName");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: { post },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0],
      });
    }

    console.error("Create Post Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get a single post by ID
// @route   GET /api/posts/:postId
// @access  Public (respects privacy)
export const getPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate("author", "username fullName profilePicture isVerified isPrivate followers")
      .populate("mentions", "username fullName");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Privacy check
    const isOwnPost = req.user && post.author._id.equals(req.user._id);
    const isFollowing =
      req.user && post.author.followers.includes(req.user._id);

    if (post.author.isPrivate && !isOwnPost && !isFollowing) {
      return res.status(403).json({
        success: false,
        message: "This post belongs to a private account",
      });
    }

    // Check if current user liked the post
    const isLiked = req.user ? post.isLikedBy(req.user._id) : false;

    // Clean up author data (remove followers array from response)
    const postObj = post.toObject();
    delete postObj.author.followers;

    res.status(200).json({
      success: true,
      data: {
        post: postObj,
        isLiked,
        isOwnPost: !!isOwnPost,
      },
    });
  } catch (error) {
    console.error("Get Post Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:postId
// @access  Private (owner only)
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check ownership
    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      });
    }

    // Delete images from Cloudinary
    if (post.images && post.images.length > 0) {
      const deletePromises = post.images.map((img) =>
        cloudinary.uploader.destroy(img.publicId)
      );
      await Promise.all(deletePromises);
    }

    // Soft delete the post
    post.isDeleted = true;
    await post.save();

    // Delete all comments on this post
    await Comment.updateMany({ post: postId }, { isDeleted: true });

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete Post Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update post caption
// @route   PUT /api/posts/:postId
// @access  Private (owner only)
export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { caption, location, commentsEnabled } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own posts",
      });
    }

    // Update allowed fields
    if (caption !== undefined) post.caption = caption;
    if (location !== undefined) post.location = location;
    if (commentsEnabled !== undefined) post.commentsEnabled = commentsEnabled;

    await post.save();

    await post.populate("author", "username fullName profilePicture isVerified");

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: { post },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0],
      });
    }

    console.error("Update Post Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get posts by a specific user
// @route   GET /api/posts/user/:username
// @access  Public (respects privacy)
export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username, isActive: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Privacy check
    const isOwnProfile = req.user && user._id.equals(req.user._id);
    const isFollowing = req.user && user.followers.includes(req.user._id);

    if (user.isPrivate && !isOwnProfile && !isFollowing) {
      return res.status(403).json({
        success: false,
        message: "This account is private",
      });
    }

    const totalPosts = await Post.countDocuments({
      author: user._id,
      isArchived: false,
    });

    const posts = await Post.find({
      author: user._id,
      isArchived: false,
    })
      .populate("author", "username fullName profilePicture isVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add isLiked flag for each post
    const postsWithLikeStatus = posts.map((post) => ({
      ...post.toObject(),
      isLiked: req.user ? post.isLikedBy(req.user._id) : false,
    }));

    res.status(200).json({
      success: true,
      results: posts.length,
      totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      data: { posts: postsWithLikeStatus },
    });
  } catch (error) {
    console.error("Get User Posts Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============================================================
//  LIKE / UNLIKE
// ============================================================

// @desc    Like a post
// @route   POST /api/posts/:postId/like
// @access  Private
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId).populate(
      "author",
      "isPrivate followers"
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Privacy check
    const isOwnPost = post.author._id.equals(userId);
    const isFollowing = post.author.followers.includes(userId);

    if (post.author.isPrivate && !isOwnPost && !isFollowing) {
      return res.status(403).json({
        success: false,
        message: "Cannot like posts from a private account you don't follow",
      });
    }

    // Check if already liked
    if (post.isLikedBy(userId)) {
      return res.status(400).json({
        success: false,
        message: "You already liked this post",
      });
    }

    post.likes.push(userId);
    post.likesCount += 1;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post liked",
      data: {
        likesCount: post.likesCount,
        isLiked: true,
      },
    });
  } catch (error) {
    console.error("Like Post Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Unlike a post
// @route   POST /api/posts/:postId/unlike
// @access  Private
export const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (!post.isLikedBy(userId)) {
      return res.status(400).json({
        success: false,
        message: "You haven't liked this post",
      });
    }

    post.likes = post.likes.filter((id) => !id.equals(userId));
    post.likesCount = Math.max(0, post.likesCount - 1);
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post unliked",
      data: {
        likesCount: post.likesCount,
        isLiked: false,
      },
    });
  } catch (error) {
    console.error("Unlike Post Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get users who liked a post
// @route   GET /api/posts/:postId/likes
// @access  Private
export const getPostLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const likedUsers = await User.find({
      _id: { $in: post.likes },
      isActive: true,
    })
      .select("username fullName profilePicture isVerified")
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      results: likedUsers.length,
      totalLikes: post.likesCount,
      data: { users: likedUsers },
    });
  } catch (error) {
    console.error("Get Likes Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============================================================
//  COMMENTS
// ============================================================

// @desc    Add a comment to a post
// @route   POST /api/posts/:postId/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text, parentCommentId } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const post = await Post.findById(postId).populate(
      "author",
      "isPrivate followers"
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if comments are enabled
    if (!post.commentsEnabled) {
      return res.status(403).json({
        success: false,
        message: "Comments are disabled on this post",
      });
    }

    // Privacy check
    const isOwnPost = post.author._id.equals(req.user._id);
    const isFollowing = post.author.followers.includes(req.user._id);

    if (post.author.isPrivate && !isOwnPost && !isFollowing) {
      return res.status(403).json({
        success: false,
        message: "Cannot comment on posts from a private account you don't follow",
      });
    }

    // If it's a reply, verify parent comment exists
    if (parentCommentId) {
      const parentComment = await Comment.findOne({
        _id: parentCommentId,
        post: postId,
        isDeleted: false,
      });

      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found",
        });
      }
    }

    // Extract mentions
    let mentionedUserIds = [];
    const mentionRegex = /@(\w+)/g;
    const mentionMatches = text.match(mentionRegex);
    if (mentionMatches) {
      const usernames = mentionMatches.map((m) => m.slice(1).toLowerCase());
      const mentionedUsers = await User.find({
        username: { $in: usernames },
        isActive: true,
      }).select("_id");
      mentionedUserIds = mentionedUsers.map((u) => u._id);
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      text: text.trim(),
      parentComment: parentCommentId || null,
      mentions: mentionedUserIds,
    });

    // Update counts
    post.commentsCount += 1;
    await post.save();

    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $inc: { repliesCount: 1 },
      });
    }

    // Populate for response
    await comment.populate(
      "author",
      "username fullName profilePicture isVerified"
    );
    await comment.populate("mentions", "username fullName");

    res.status(201).json({
      success: true,
      message: parentCommentId ? "Reply added" : "Comment added",
      data: { comment },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0],
      });
    }

    console.error("Add Comment Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public (respects privacy)
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Get top-level comments only (not replies)
    const totalComments = await Comment.countDocuments({
      post: postId,
      parentComment: null,
      isDeleted: false,
    });

    const comments = await Comment.find({
      post: postId,
      parentComment: null,
      isDeleted: false,
    })
      .populate("author", "username fullName profilePicture isVerified")
      .populate("mentions", "username fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add isLiked flag
    const commentsWithStatus = comments.map((comment) => ({
      ...comment.toObject(),
      isLiked: req.user ? comment.isLikedBy(req.user._id) : false,
    }));

    res.status(200).json({
      success: true,
      results: comments.length,
      totalComments,
      currentPage: page,
      totalPages: Math.ceil(totalComments / limit),
      data: { comments: commentsWithStatus },
    });
  } catch (error) {
    console.error("Get Comments Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get replies to a comment
// @route   GET /api/posts/:postId/comments/:commentId/replies
// @access  Public
export const getReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const replies = await Comment.find({
      parentComment: commentId,
      isDeleted: false,
    })
      .populate("author", "username fullName profilePicture isVerified")
      .populate("mentions", "username fullName")
      .sort({ createdAt: 1 }) // Oldest first for replies
      .skip(skip)
      .limit(limit);

    const totalReplies = await Comment.countDocuments({
      parentComment: commentId,
      isDeleted: false,
    });

    const repliesWithStatus = replies.map((reply) => ({
      ...reply.toObject(),
      isLiked: req.user ? reply.isLikedBy(req.user._id) : false,
    }));

    res.status(200).json({
      success: true,
      results: replies.length,
      totalReplies,
      data: { replies: repliesWithStatus },
    });
  } catch (error) {
    console.error("Get Replies Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/posts/:postId/comments/:commentId
// @access  Private (comment author or post author)
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId,
      post: postId,
      isDeleted: false,
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const post = await Post.findById(postId);

    // Allow deletion by comment author OR post author
    const isCommentAuthor = comment.author.equals(req.user._id);
    const isPostAuthor = post.author.equals(req.user._id);

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    // Soft delete
    comment.isDeleted = true;
    await comment.save();

    // Update post comment count
    post.commentsCount = Math.max(0, post.commentsCount - 1);
    await post.save();

    // If it's a reply, update parent's reply count
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $inc: { repliesCount: -1 },
      });
    }

    // Also soft delete all replies to this comment
    const deletedReplies = await Comment.updateMany(
      { parentComment: commentId, isDeleted: false },
      { isDeleted: true }
    );

    // Adjust post comment count for deleted replies
    if (deletedReplies.modifiedCount > 0) {
      post.commentsCount = Math.max(
        0,
        post.commentsCount - deletedReplies.modifiedCount
      );
      await post.save();
    }

    res.status(200).json({
      success: true,
      message: "Comment deleted",
    });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Like a comment
// @route   POST /api/posts/:postId/comments/:commentId/like
// @access  Private
export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findOne({
      _id: commentId,
      isDeleted: false,
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.isLikedBy(userId)) {
      return res.status(400).json({
        success: false,
        message: "You already liked this comment",
      });
    }

    comment.likes.push(userId);
    comment.likesCount += 1;
    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment liked",
      data: {
        likesCount: comment.likesCount,
        isLiked: true,
      },
    });
  } catch (error) {
    console.error("Like Comment Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Unlike a comment
// @route   POST /api/posts/:postId/comments/:commentId/unlike
// @access  Private
export const unlikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findOne({
      _id: commentId,
      isDeleted: false,
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (!comment.isLikedBy(userId)) {
      return res.status(400).json({
        success: false,
        message: "You haven't liked this comment",
      });
    }

    comment.likes = comment.likes.filter((id) => !id.equals(userId));
    comment.likesCount = Math.max(0, comment.likesCount - 1);
    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment unliked",
      data: {
        likesCount: comment.likesCount,
        isLiked: false,
      },
    });
  } catch (error) {
    console.error("Unlike Comment Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============================================================
//  FEED
// ============================================================

// @desc    Get home feed (posts from people you follow)
// @route   GET /api/posts/feed
// @access  Private
export const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.user._id).select("following");

    // Feed includes posts from people you follow + your own posts
    const feedAuthors = [...currentUser.following, req.user._id];

    const totalPosts = await Post.countDocuments({
      author: { $in: feedAuthors },
      isArchived: false,
    });

    const posts = await Post.find({
      author: { $in: feedAuthors },
      isArchived: false,
    })
      .populate("author", "username fullName profilePicture isVerified")
      .populate("mentions", "username fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add isLiked flag for each post
    const postsWithStatus = posts.map((post) => ({
      ...post.toObject(),
      isLiked: post.isLikedBy(req.user._id),
    }));

    res.status(200).json({
      success: true,
      results: posts.length,
      totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      hasMore: page * limit < totalPosts,
      data: { posts: postsWithStatus },
    });
  } catch (error) {
    console.error("Feed Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get explore/discover posts (from public accounts you don't follow)
// @route   GET /api/posts/explore
// @access  Private
export const getExplorePosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.user._id).select("following");

    // Get IDs to exclude (people you follow + yourself)
    const excludeAuthors = [...currentUser.following, req.user._id];

    // Get public users
    const publicUsers = await User.find({
      _id: { $nin: excludeAuthors },
      isPrivate: false,
      isActive: true,
    }).select("_id");

    const publicUserIds = publicUsers.map((u) => u._id);

    const totalPosts = await Post.countDocuments({
      author: { $in: publicUserIds },
      isArchived: false,
    });

    // Get trending/recent posts from public accounts
    const posts = await Post.find({
      author: { $in: publicUserIds },
      isArchived: false,
    })
      .populate("author", "username fullName profilePicture isVerified")
      .sort({ likesCount: -1, createdAt: -1 }) // Sort by popularity
      .skip(skip)
      .limit(limit);

    const postsWithStatus = posts.map((post) => ({
      ...post.toObject(),
      isLiked: post.isLikedBy(req.user._id),
    }));

    res.status(200).json({
      success: true,
      results: posts.length,
      totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      hasMore: page * limit < totalPosts,
      data: { posts: postsWithStatus },
    });
  } catch (error) {
    console.error("Explore Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get posts by hashtag
// @route   GET /api/posts/hashtag/:tag
// @access  Private
export const getPostsByHashtag = async (req, res) => {
  try {
    const { tag } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Only show posts from public accounts or accounts you follow
    const currentUser = await User.findById(req.user._id).select("following");
    const accessibleAuthors = [...currentUser.following, req.user._id];

    const publicUsers = await User.find({
      isPrivate: false,
      isActive: true,
    }).select("_id");

    const allAccessible = [
      ...new Set([
        ...accessibleAuthors.map((id) => id.toString()),
        ...publicUsers.map((u) => u._id.toString()),
      ]),
    ];

    const totalPosts = await Post.countDocuments({
      hashtags: tag.toLowerCase(),
      author: { $in: allAccessible },
      isArchived: false,
    });

    const posts = await Post.find({
      hashtags: tag.toLowerCase(),
      author: { $in: allAccessible },
      isArchived: false,
    })
      .populate("author", "username fullName profilePicture isVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const postsWithStatus = posts.map((post) => ({
      ...post.toObject(),
      isLiked: post.isLikedBy(req.user._id),
    }));

    res.status(200).json({
      success: true,
      results: posts.length,
      totalPosts,
      hashtag: tag.toLowerCase(),
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      data: { posts: postsWithStatus },
    });
  } catch (error) {
    console.error("Hashtag Posts Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};