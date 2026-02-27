// src/components/post/CreatePostModal.jsx
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Loader, Smile } from 'lucide-react';
import { createPost } from '../../api/postApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CreatePostModal = ({ onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return toast.error('Image must be less than 5MB');
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!caption.trim() && !image) {
      return toast.error('Add a caption or image');
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      if (caption.trim()) formData.append('caption', caption);
      if (image) formData.append('images', image);

      const { data } = await createPost(formData);
      toast.success('Post created!');
      onPostCreated?.(data.data?.post || data.post || data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  const captionLength = caption.length;
  const maxLength = 2200;
  const isNearLimit = captionLength > maxLength * 0.9;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
        {/* Overlay */}
        <motion.div
          className="absolute inset-0"
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-2xl scrollbar-thin"
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(99, 102, 241, 0.12)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
          }}
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
            <h2 className="text-white font-semibold text-lg">Create Post</h2>
            <motion.button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"
              whileTap={{ scale: 0.9 }}
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <X size={22} />
            </motion.button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="p-4">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={user?.profilePicture?.url || user?.profilePicture || '/default-avatar.png'}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                  style={{ border: '2px solid rgba(99, 102, 241, 0.2)' }}
                />
                <div>
                  <p className="text-white font-semibold text-sm">{user?.username}</p>
                  <p className="text-gray-500 text-xs">{user?.fullName}</p>
                </div>
              </div>

              {/* Caption */}
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                className="w-full bg-transparent text-white placeholder-gray-500 text-sm resize-none focus:outline-none leading-relaxed"
                maxLength={maxLength}
              />

              {/* Character Count */}
              <div className="flex justify-end">
                <motion.p
                  className="text-xs font-medium"
                  animate={{
                    color: isNearLimit ? '#ef4444' : 'rgba(107, 114, 128, 0.6)',
                  }}
                >
                  {captionLength}/{maxLength}
                </motion.p>
              </div>

              {/* Drag & Drop / Image Preview */}
              {!preview ? (
                <motion.div
                  className="mt-4 rounded-xl p-8 text-center cursor-pointer transition-all"
                  style={{
                    border: `2px dashed ${isDragging ? 'rgba(99, 102, 241, 0.5)' : 'rgba(75, 85, 99, 0.3)'}`,
                    background: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                  }}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  whileHover={{ borderColor: 'rgba(99, 102, 241, 0.4)' }}
                >
                  <Image size={32} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    {isDragging ? 'Drop your image here' : 'Click or drag to add a photo'}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  className="relative mt-4 rounded-xl overflow-hidden"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-h-80 object-cover rounded-xl"
                  />
                  <motion.button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 rounded-full"
                    style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
                    whileHover={{ scale: 1.1, background: 'rgba(0, 0, 0, 0.8)' }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={16} className="text-white" />
                  </motion.button>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4" style={{ borderTop: '1px solid rgba(75, 85, 99, 0.2)' }}>
              <motion.button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 text-gray-400 hover:text-indigo-400 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image size={20} />
                <span className="text-sm">Photo</span>
              </motion.button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              <motion.button
                type="submit"
                disabled={isLoading || (!caption.trim() && !image)}
                className="btn-primary px-6 py-2 text-sm flex items-center gap-2"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Posting...
                  </>
                ) : (
                  'Share'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreatePostModal;