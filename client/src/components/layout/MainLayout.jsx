// src/components/layout/MainLayout.jsx
import React from 'react'
import { useState } from 'react';
import Sidebar from './SideBar';
import MobileNav from './MobileNav';
import CreatePostModal from '../post/CreatePostModal';

const MainLayout = ({ children }) => {
  const [showCreatePost, setShowCreatePost] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar onCreatePost={() => setShowCreatePost(true)} />
      </div>

      {/* Main Content */}
      <main className="md:ml-20 xl:ml-64 pb-16 md:pb-0 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {children}
        </div>
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