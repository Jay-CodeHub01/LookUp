import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // -------- CONTENT --------
    caption: {
      type: String,
      default: "",
      maxlength: [2200, "Caption cannot exceed 2200 characters"],
      trim: true,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    ],

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
    commentsCount: {
      type: Number,
      default: 0,
    },

    // -------- METADATA --------
    hashtags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    location: {
      type: String,
      default: "",
      maxlength: [100, "Location cannot exceed 100 characters"],
    },

    // -------- SETTINGS --------
    commentsEnabled: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
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
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ isDeleted: 1 });

// -------- EXTRACT HASHTAGS BEFORE SAVE --------
postSchema.pre("save", async function() {
  if (this.isModified("caption")) {
    const hashtagRegex = /#(\w+)/g;
    const matches = this.caption.match(hashtagRegex);
    this.hashtags = matches
      ? [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))]
      : [];
  }
  // next();
});

// -------- HELPER: Check if user liked --------
postSchema.methods.isLikedBy = function (userId) {
  return this.likes.some((id) => id.equals(userId));
};

// -------- EXCLUDE DELETED POSTS BY DEFAULT --------
postSchema.pre(/^find/, async function() {
  // Only apply if not explicitly querying for deleted posts
  if (!this.getQuery().isDeleted) {
    this.where({ isDeleted: false });
  }
  // next();
});

const Post = mongoose.model("Post", postSchema);

export default Post;