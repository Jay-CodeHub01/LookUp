import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },

    // -------- REPLY SUPPORT --------
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    // -------- ENGAGEMENT --------
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    repliesCount: {
      type: Number,
      default: 0,
    },

    // -------- METADATA --------
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// -------- INDEXES --------
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });

// -------- HELPER --------
commentSchema.methods.isLikedBy = function (userId) {
  return this.likes.some((id) => id.equals(userId));
};

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;