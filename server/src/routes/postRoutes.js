import express from "express";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import { handleUploadError } from "../middleware/uploadMiddleware.js";
import { uploadPostImages } from "../config/cloudinary.js";

import {
  createPost,
  getPost,
  deletePost,
  updatePost,
  getUserPosts,
  likePost,
  unlikePost,
  getPostLikes,
  addComment,
  getComments,
  getReplies,
  deleteComment,
  likeComment,
  unlikeComment,
  getFeed,
  getExplorePosts,
  getPostsByHashtag,
} from "../controllers/postController.js";

const router = express.Router();

// -------- FEED ROUTES (must be before /:postId) --------
router.get("/feed", protect, getFeed);
router.get("/explore", protect, getExplorePosts);
router.get("/hashtag/:tag", protect, getPostsByHashtag);
router.get("/user/:username", optionalAuth, getUserPosts);

// -------- POST CRUD --------
router.post(
  "/",
  protect,
  handleUploadError(uploadPostImages.array("images", 10)),
  createPost
);
router.get("/:postId", optionalAuth, getPost);
router.put("/:postId", protect, updatePost);
router.delete("/:postId", protect, deletePost);

// -------- LIKE / UNLIKE --------
router.post("/:postId/like", protect, likePost);
router.post("/:postId/unlike", protect, unlikePost);
router.get("/:postId/likes", protect, getPostLikes);

// -------- COMMENTS --------
router.post("/:postId/comments", protect, addComment);
router.get("/:postId/comments", optionalAuth, getComments);
router.delete("/:postId/comments/:commentId", protect, deleteComment);

// -------- COMMENT REPLIES --------
router.get("/:postId/comments/:commentId/replies", optionalAuth, getReplies);

// -------- COMMENT LIKES --------
router.post("/:postId/comments/:commentId/like", protect, likeComment);
router.post("/:postId/comments/:commentId/unlike", protect, unlikeComment);

export default router;