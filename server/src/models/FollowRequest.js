import mongoose from "mongoose";

const followRequestSchema = new mongoose.Schema(
  {
    // User who sent the follow request
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // User who receives the follow request
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate follow requests
followRequestSchema.index({ from: 1, to: 1 }, { unique: true });

const FollowRequest = mongoose.model("FollowRequest", followRequestSchema);

export default FollowRequest;