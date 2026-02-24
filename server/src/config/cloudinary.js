const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Profile picture storage
const profilePictureStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "lookup/profile-pictures",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 500, height: 500, crop: "fill", gravity: "face" },
    ],
  },
});

// Cover photo storage
const coverPhotoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "lookup/cover-photos",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 400, crop: "fill" }],
  },
});

const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const uploadCoverPhoto = multer({
  storage: coverPhotoStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

module.exports = {
  cloudinary,
  uploadProfilePicture,
  uploadCoverPhoto,
};