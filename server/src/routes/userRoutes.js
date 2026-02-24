import express from "express";
import {
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
} from "../controllers/userController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import {
  uploadProfilePicture,
  uploadCoverPhoto,
} from "../config/cloudinary.js";
import { handleUploadError } from "../middleware/uploadMiddleware.js";
const router = express.Router();

// -------- PROFILE ROUTES --------
router.get("/search", protect, searchUsers);
router.put("/profile", protect, updateProfile);
router.put(
  "/profile-picture",
  protect,
  handleUploadError(uploadProfilePicture.single("profilePicture")),
  updateProfilePicture
);
router.delete("/profile-picture", protect, deleteProfilePicture);
router.put(
  "/cover-photo",
  protect,
  handleUploadError(uploadCoverPhoto.single("coverPhoto")),
  updateCoverPhoto
);
router.put("/toggle-privacy", protect, togglePrivacy);

// -------- FOLLOW REQUEST ROUTES --------
router.get("/follow-requests", protect, getFollowRequests);
router.put(
  "/follow-requests/:requestId/accept",
  protect,
  acceptFollowRequest
);
router.put(
  "/follow-requests/:requestId/reject",
  protect,
  rejectFollowRequest
);

// -------- FOLLOW/UNFOLLOW ROUTES --------
router.post("/:userId/follow", protect, followUser);
router.post("/:userId/unfollow", protect, unfollowUser);
router.delete("/:userId/cancel-request", protect, cancelFollowRequest);
router.delete("/:userId/remove-follower", protect, removeFollower);

// -------- USER INFO ROUTES --------
router.get("/:username/followers", protect, getFollowers);
router.get("/:username/following", protect, getFollowing);
router.get("/:username", optionalAuth, getUserProfile);

export default router;