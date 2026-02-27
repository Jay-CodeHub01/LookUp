// src/components/layout/Sidebar.jsx
import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Compass,
  PlusSquare,
  User,
  LogOut,
  Search,
  Bell,
  Settings,
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
    <aside className="fixed left-0 top-0 h-full w-20 xl:w-64 bg-gray-950 border-r border-gray-800 flex flex-col z-50">
      {/* Logo */}
      <Link to="/" className="p-6 hidden xl:block">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          LookUp
        </h1>
      </Link>
      <Link to="/" className="p-4 xl:hidden flex justify-center">
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          L
        </span>
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
                  <button
                    onClick={item.action}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
                  >
                    <Icon size={24} />
                    <span className="hidden xl:block font-medium">{item.label}</span>
                  </button>
                </li>
              );
            }

            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'text-white bg-gray-800/70 font-semibold'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="hidden xl:block">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <img
            src={user?.profilePicture || '/default-avatar.png'}
            alt={user?.username}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-700"
          />
          <div className="hidden xl:block flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-gray-500 text-xs truncate">@{user?.username}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={24} />
          <span className="hidden xl:block font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;