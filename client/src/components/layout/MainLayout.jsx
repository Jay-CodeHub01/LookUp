// src/components/layout/MainLayout.jsx
import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './SideBar';
import MobileNav from './MobileNav';
import CreatePostModal from '../post/CreatePostModal';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const MainLayout = ({ children }) => {
  const [showCreatePost, setShowCreatePost] = useState(false);

  return (
    <div className="min-h-screen text-white" style={{ background: '#030712' }}>
      {/* Subtle ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute animate-blob"
          style={{
            top: '-10%',
            right: '-5%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.04) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute animate-blob"
          style={{
            bottom: '-10%',
            left: '-5%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.03) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animationDelay: '-4s',
          }}
        />
      </div>

      {/* Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar onCreatePost={() => setShowCreatePost(true)} />
      </div>

      {/* Main Content */}
      <main className="relative md:ml-20 xl:ml-64 pb-20 md:pb-0 min-h-screen" style={{ zIndex: 1 }}>
        <motion.div
          className="max-w-2xl mx-auto px-4 py-6"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav onCreatePost={() => setShowCreatePost(true)} />

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} />
      )}
    </div>
  );
};

export default MainLayout;