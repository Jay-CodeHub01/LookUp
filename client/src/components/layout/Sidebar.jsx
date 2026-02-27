// src/components/layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Compass,
  PlusSquare,
  User,
  LogOut,
  Search,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Sidebar = ({ onCreatePost }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: PlusSquare, label: 'Create', action: onCreatePost },
    { icon: User, label: 'Profile', path: `/${user?.username}` },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-20 xl:w-64 glass flex flex-col z-50"
      style={{ borderRight: '1px solid rgba(99, 102, 241, 0.08)' }}>
      
      {/* Logo */}
      <Link to="/" className="p-6 hidden xl:block">
        <motion.h1
          className="text-2xl font-bold gradient-text animate-text-glow"
          whileHover={{ scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          LookUp
        </motion.h1>
      </Link>
      <Link to="/" className="p-4 xl:hidden flex justify-center mt-2">
        <motion.span
          className="text-2xl font-bold gradient-text"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          L
        </motion.span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.path && location.pathname === item.path;
            const Icon = item.icon;

            if (item.action) {
              return (
                <li key={item.label}>
                  <motion.button
                    onClick={item.action}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:text-white transition-colors relative group"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <motion.div
                      className="relative"
                      whileHover={{
                        filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))',
                      }}
                    >
                      <Icon size={24} />
                    </motion.div>
                    <span className="hidden xl:block font-medium">{item.label}</span>
                    
                    {/* Tooltip for collapsed */}
                    <div className="xl:hidden absolute left-16 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg z-50">
                      {item.label}
                    </div>
                  </motion.button>
                </li>
              );
            }

            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className="relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all group"
                >
                  {/* Active background indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                      }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  
                  <motion.div
                    className="relative z-10"
                    whileHover={{
                      filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))',
                    }}
                    animate={isActive ? {
                      filter: 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.4))',
                    } : {}}
                  >
                    <Icon
                      size={24}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-white transition-colors'}
                    />
                  </motion.div>
                  <span className={`hidden xl:block relative z-10 font-medium ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white transition-colors'
                  }`}>
                    {item.label}
                  </span>

                  {/* Tooltip for collapsed */}
                  <div className="xl:hidden absolute left-16 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg z-50">
                    {item.label}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile & Logout */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(99, 102, 241, 0.08)' }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <img
              src={user?.profilePicture?.url || user?.profilePicture || '/default-avatar.png'}
              alt={user?.username}
              className="w-8 h-8 rounded-full object-cover"
              style={{ border: '2px solid rgba(99, 102, 241, 0.3)' }}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-gray-950" />
          </motion.div>
          <div className="hidden xl:block flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-gray-500 text-xs truncate">@{user?.username}</p>
          </div>
        </div>
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 transition-colors group"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.97 }}
          style={{ transition: 'background 0.3s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={24} />
          <span className="hidden xl:block font-medium">Logout</span>
        </motion.button>
      </div>
    </aside>
  );
};

export default Sidebar;