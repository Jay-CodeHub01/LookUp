// src/components/layout/MobileNav.jsx
import React from 'react'
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, Compass, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileNav = ({ onCreatePost }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: Home, path: '/' },
    { icon: Search, path: '/search' },
    { icon: PlusSquare, action: onCreatePost },
    { icon: Compass, path: '/explore' },
    { icon: User, path: `/${user?.username}` },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 md:hidden z-50">
      <ul className="flex items-center justify-around py-3">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.path && location.pathname === item.path;

          if (item.action) {
            return (
              <li key={index}>
                <button
                  onClick={item.action}
                  className="text-gray-400 hover:text-white p-2"
                >
                  <Icon size={24} />
                </button>
              </li>
            );
          }

          return (
            <li key={index}>
              <Link
                to={item.path}
                className={`p-2 block ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileNav;