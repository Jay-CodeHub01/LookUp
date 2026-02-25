// src/components/post/CreatePostModal.jsx
import { useState, useRef } from 'react';
import { X, Image, Loader } from 'lucide-react';
import { createPost } from '../../api/postApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CreatePostModal = ({ onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return toast.error('Image must be less than 5MB');
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
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
      if (image) formData.append('image', image);

      const { data } = await createPost(formData);
      toast.success('Post created!');
      onPostCreated?.(data.post || data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg">Create Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            {/* User Info */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={user?.profilePicture || '/default-avatar.png'}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
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
              className="w-full bg-transparent text-white placeholder-gray-500 text-sm resize-none focus:outline-none"
              maxLength={2200}
            />

            {/* Character Count */}
            <p className="text-gray-600 text-xs text-right">
              {caption.length}/2200
            </p>

            {/* Image Preview */}
            {preview && (
              <div className="relative mt-4 rounded-xl overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-80 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-800">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
            >
              <Image size={20} />
              <span className="text-sm">Add Photo</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            <button
              type="submit"
              disabled={isLoading || (!caption.trim() && !image)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Posting...
                </>
              ) : (
                'Share'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;