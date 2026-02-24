import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username must be less than 30 characters long"],
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Won't return password in queries by default
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Full name must be at least 3 characters long"],
      maxlength: [50, "Full name must be less than 50 characters long"],
    },
    bio: {
      type: String,
      maxlength: [160, "Bio must be less than 160 characters long"],
      default: "",
    },
    profilePicture: {
      url:{
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },
    coverPicture: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say", ""],
      default: "",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followersCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastseen: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
  },
  {
    timestamps: true, // add createdAt and updatedAt fields
  },
);

// -------- INDEXES FOR PERFORMANCE --------
userSchema.index({ fullName: "text", username: "text" });

// Hash password before saving
userSchema.pre("save",async function() {
    // Only hash the password if it has been modified (or is new)
    if(!this.isModified("password")) {
        return;
    }
    
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);

});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// Remove password field when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

// -------- VIRTUAL: IS FOLLOWING CHECK --------
userSchema.methods.isFollowing = function (userId) {
  return this.following.includes(userId);
};

// -------- VIRTUAL: IS FOLLOWED BY CHECK --------
userSchema.methods.isFollowedBy = function (userId) {
  return this.followers.includes(userId);
};

const User = mongoose.model("User", userSchema);

export default User;