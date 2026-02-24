import User from "../models/User.js";
import FollowRequest from "../models/FollowRequest.js";
import { cloudinary } from "../config/cloudinary.js";

// ============================================================
//  PROFILE CONTROLLERS
// ============================================================

// @desc    Get user profile by username
// @route   GET /api/users/:username
// @access  Public (but private accounts show limited info)
const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username, isActive: true })
      .select("-email")
      .populate("followers", "username fullName profilePicture")
      .populate("following", "username fullName profilePicture");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if the requesting user is logged in
    const requestingUserId = req.user ? req.user._id : null;
    const isOwnProfile = requestingUserId
      ? user._id.equals(requestingUserId)
      : false;
    const isFollowing = requestingUserId
      ? user.isFollowedBy(requestingUserId)
      : false;

    // Check if there's a pending follow request
    let followRequestStatus = null;
    if (requestingUserId && !isOwnProfile) {
      const existingRequest = await FollowRequest.findOne({
        from: requestingUserId,
        to: user._id,
        status: "pending",
      });
      if (existingRequest) {
        followRequestStatus = "pending";
      }
    }

    // If private account and not following and not own profile
    if (user.isPrivate && !isFollowing && !isOwnProfile) {
      return res.status(200).json({
        success: true,
        data: {
          user: {
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            profilePicture: user.profilePicture,
            bio: user.bio,
            isPrivate: user.isPrivate,
            isVerified: user.isVerified,
            followersCount: user.followersCount,
            followingCount: user.followingCount,
          },
          isOwnProfile,
          isFollowing,
          followRequestStatus,
          isPrivateAndNotFollowing: true,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        isOwnProfile,
        isFollowing,
        followRequestStatus,
        isPrivateAndNotFollowing: false,
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "fullName",
      "bio",
      "gender",
    ];
    const updates = {};

    // const { username, gender, bio } = req.body;

    // Only pick allowed fields
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle username change
    if (request.body.username) {
      const newUsername = username.toLowerCase().trim();

      // Check if username is taken
      const existingUser = await User.findOne({
        username: newUsername,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }

      updates.username = newUsername;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0],
      });
    }

    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Upload/Update profile picture
// @route   PUT /api/users/profile-picture
// @access  Private
const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    const user = await User.findById(req.user._id);

    // Delete old profile picture from cloudinary
    if (user.profilePicture.publicId) {
      await cloudinary.uploader.destroy(user.profilePicture.publicId);
    }

    // Update with new image
    user.profilePicture = {
      url: req.file.path,
      publicId: req.file.filename,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      data: {
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Update Profile Picture Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Upload/Update cover photo
// @route   PUT /api/users/cover-photo
// @access  Private
const updateCoverPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    const user = await User.findById(req.user._id);

    // Delete old cover photo from cloudinary
    if (user.coverPhoto.publicId) {
      await cloudinary.uploader.destroy(user.coverPhoto.publicId);
    }

    // Update with new image
    user.coverPhoto = {
      url: req.file.path,
      publicId: req.file.filename,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Cover photo updated successfully",
      data: {
        coverPhoto: user.coverPhoto,
      },
    });
  } catch (error) {
    console.error("Update Cover Photo Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete profile picture
// @route   DELETE /api/users/profile-picture
// @access  Private
const deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.profilePicture.publicId) {
      await cloudinary.uploader.destroy(user.profilePicture.publicId);
    }

    user.profilePicture = { url: "", publicId: "" };
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture removed",
    });
  } catch (error) {
    console.error("Delete Profile Picture Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Toggle private account
// @route   PUT /api/users/toggle-privacy
// @access  Private
const togglePrivacy = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.isPrivate = !user.isPrivate;

    // If switching from private to public, accept all pending follow requests
    if (!user.isPrivate) {
      const pendingRequests = await FollowRequest.find({
        to: user._id,
        status: "pending",
      });

      for (const request of pendingRequests) {
        // Add follower
        if (!user.followers.includes(request.from)) {
          user.followers.push(request.from);
          user.followersCount += 1;
        }

        // Add to requester's following
        await User.findByIdAndUpdate(request.from, {
          $addToSet: { following: user._id },
          $inc: { followingCount: 1 },
        });

        request.status = "accepted";
        await request.save();
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Account is now ${user.isPrivate ? "private" : "public"}`,
      data: {
        isPrivate: user.isPrivate,
      },
    });
  } catch (error) {
    console.error("Toggle Privacy Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search?q=query
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const users = await User.find({
      isActive: true,
      _id: { $ne: req.user._id },
      $or: [
        { username: { $regex: q, $options: "i" } },
        { fullName: { $regex: q, $options: "i" } },
      ],
    })
      .select("username fullName profilePicture isVerified isPrivate")
      .limit(20);

    res.status(200).json({
      success: true,
      results: users.length,
      data: { users },
    });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============================================================
//  FOLLOW / UNFOLLOW CONTROLLERS
// ============================================================

// @desc    Follow or send follow request to a user
// @route   POST /api/users/:userId/follow
// @access  Private
const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Can't follow yourself
    if (currentUserId.equals(userId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const targetUser = await User.findById(userId);

    if (!targetUser || !targetUser.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already following
    if (targetUser.isFollowedBy(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: "You are already following this user",
      });
    }

    // Check if there's already a pending request
    const existingRequest = await FollowRequest.findOne({
      from: currentUserId,
      to: userId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Follow request already sent",
      });
    }

    // ---- PRIVATE ACCOUNT: Send follow request ----
    if (targetUser.isPrivate) {
      await FollowRequest.create({
        from: currentUserId,
        to: userId,
      });

      return res.status(200).json({
        success: true,
        message: "Follow request sent",
        data: {
          followStatus: "requested",
        },
      });
    }

    // ---- PUBLIC ACCOUNT: Follow directly ----
    // Add to target's followers
    targetUser.followers.push(currentUserId);
    targetUser.followersCount += 1;
    await targetUser.save();

    // Add to current user's following
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: userId },
      $inc: { followingCount: 1 },
    });

    // Auto-accept any follow request record
    await FollowRequest.findOneAndUpdate(
      { from: currentUserId, to: userId },
      { status: "accepted" },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: `You are now following ${targetUser.username}`,
      data: {
        followStatus: "following",
      },
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Follow request already exists",
      });
    }

    console.error("Follow Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Unfollow a user
// @route   POST /api/users/:userId/unfollow
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (currentUserId.equals(userId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot unfollow yourself",
      });
    }

    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if actually following
    if (!targetUser.isFollowedBy(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user",
      });
    }

    // Remove from target's followers
    targetUser.followers = targetUser.followers.filter(
      (id) => !id.equals(currentUserId)
    );
    targetUser.followersCount = Math.max(0, targetUser.followersCount - 1);
    await targetUser.save();

    // Remove from current user's following
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: userId },
      $inc: { followingCount: -1 },
    });

    // Remove follow request record
    await FollowRequest.findOneAndDelete({
      from: currentUserId,
      to: userId,
    });

    res.status(200).json({
      success: true,
      message: `You unfollowed ${targetUser.username}`,
      data: {
        followStatus: "not_following",
      },
    });
  } catch (error) {
    console.error("Unfollow Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Cancel a sent follow request
// @route   DELETE /api/users/:userId/cancel-request
// @access  Private
const cancelFollowRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const request = await FollowRequest.findOneAndDelete({
      from: currentUserId,
      to: userId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "No pending follow request found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Follow request cancelled",
    });
  } catch (error) {
    console.error("Cancel Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Remove a follower
// @route   DELETE /api/users/:userId/remove-follower
// @access  Private
const removeFollower = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);

    if (!currentUser.isFollowedBy(userId)) {
      return res.status(400).json({
        success: false,
        message: "This user is not following you",
      });
    }

    // Remove from your followers
    currentUser.followers = currentUser.followers.filter(
      (id) => !id.equals(userId)
    );
    currentUser.followersCount = Math.max(0, currentUser.followersCount - 1);
    await currentUser.save();

    // Remove from their following
    await User.findByIdAndUpdate(userId, {
      $pull: { following: currentUserId },
      $inc: { followingCount: -1 },
    });

    // Remove follow request record
    await FollowRequest.findOneAndDelete({
      from: userId,
      to: currentUserId,
    });

    res.status(200).json({
      success: true,
      message: "Follower removed",
    });
  } catch (error) {
    console.error("Remove Follower Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============================================================
//  FOLLOW REQUEST MANAGEMENT (for private accounts)
// ============================================================

// @desc    Get all pending follow requests (received)
// @route   GET /api/users/follow-requests
// @access  Private
const getFollowRequests = async (req, res) => {
  try {
    const requests = await FollowRequest.find({
      to: req.user._id,
      status: "pending",
    })
      .populate("from", "username fullName profilePicture isVerified")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results: requests.length,
      data: { requests },
    });
  } catch (error) {
    console.error("Get Follow Requests Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Accept a follow request
// @route   PUT /api/users/follow-requests/:requestId/accept
// @access  Private
const acceptFollowRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const mongoose = await import('mongoose');
    let objectId;
    try {
      objectId = new mongoose.default.Types.ObjectId(requestId);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid requestId format",
      });
    }
    const request = await FollowRequest.findOne({
        _id: objectId,
        to: req.user._id,
        status: "pending",
    });
    
    if (!request) {
        return res.status(404).json({
            success: false,
            message: "Follow request not found",
        });
    }
    
    // Accept the request
    request.status = "accepted";
    await request.save();
    
    // Add to your followers
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { followers: request.from },
      $inc: { followersCount: 1 },
    });

    // Add to their following
    await User.findByIdAndUpdate(request.from, {
      $addToSet: { following: req.user._id },
      $inc: { followingCount: 1 },
    });

    res.status(200).json({
      success: true,
      message: "Follow request accepted",
    });
  } catch (error) {
    console.error("Accept Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Reject a follow request
// @route   PUT /api/users/follow-requests/:requestId/reject
// @access  Private
const rejectFollowRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await FollowRequest.findOne({
      _id: requestId,
      to: req.user._id,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Follow request not found",
      });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({
      success: true,
      message: "Follow request rejected",
    });
  } catch (error) {
    console.error("Reject Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get followers list
// @route   GET /api/users/:username/followers
// @access  Private (respects privacy)
const getFollowers = async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username, isActive: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Privacy check
    const isOwnProfile = user._id.equals(req.user._id);
    const isFollowing = user.isFollowedBy(req.user._id);

    if (user.isPrivate && !isFollowing && !isOwnProfile) {
      return res.status(403).json({
        success: false,
        message: "This account is private",
      });
    }

    const followers = await User.find({
      _id: { $in: user.followers },
      isActive: true,
    })
      .select("username fullName profilePicture isVerified")
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      results: followers.length,
      totalCount: user.followersCount,
      page,
      data: { followers },
    });
  } catch (error) {
    console.error("Get Followers Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get following list
// @route   GET /api/users/:username/following
// @access  Private (respects privacy)
const getFollowing = async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username, isActive: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Privacy check
    const isOwnProfile = user._id.equals(req.user._id);
    const isFollowing = user.isFollowedBy(req.user._id);

    if (user.isPrivate && !isFollowing && !isOwnProfile) {
      return res.status(403).json({
        success: false,
        message: "This account is private",
      });
    }

    const following = await User.find({
      _id: { $in: user.following },
      isActive: true,
    })
      .select("username fullName profilePicture isVerified")
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      results: following.length,
      totalCount: user.followingCount,
      page,
      data: { following },
    });
  } catch (error) {
    console.error("Get Following Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export {
  getUserProfile,
  updateProfile,
  updateProfilePicture,
  updateCoverPhoto,
  deleteProfilePicture,
  togglePrivacy,
  searchUsers,
  followUser,
  unfollowUser,
  cancelFollowRequest,
  removeFollower,
  getFollowRequests,
  acceptFollowRequest,
  rejectFollowRequest,
  getFollowers,
  getFollowing,
};