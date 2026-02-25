import cloudinary from "cloudinary";
import cloudinaryStorage from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Profile picture storage
const profilePictureStorage = cloudinaryStorage({
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
const coverPhotoStorage = cloudinaryStorage({
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

const uploadPostImages = multer({
  storage: cloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "lookup/post-images",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 1200, height: 1200, crop: "limit" }],
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per image
});

export { cloudinary, uploadProfilePicture, uploadCoverPhoto, uploadPostImages };