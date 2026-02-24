import multer from "multer";
// Handle multer errors gracefully
const handleUploadError = (uploadFn) => {
  return (req, res, next) => {
    uploadFn(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File too large. Maximum size allowed is 5MB.",
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      }

      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Error uploading file.",
        });
      }

      next();
    });
  };
};

export { handleUploadError };