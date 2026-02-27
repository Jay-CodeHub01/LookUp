// src/components/layout/MobileNav.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50 glass"
      style={{
        borderTop: '1px solid rgba(99, 102, 241, 0.08)',
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(24px)',
      }}>
      <ul className="flex items-center justify-around py-2 px-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.path && location.pathname === item.path;
          const isCreate = !!item.action;

          if (isCreate) {
            return (
              <li key={index}>
                <motion.button
                  onClick={item.action}
                  className="relative p-3 rounded-xl"
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                  }}
                >
                  <Icon size={22} className="text-white" />
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    }}
                    animate={{
                      boxShadow: [
                        '0 0 15px rgba(99, 102, 241, 0.3)',
                        '0 0 30px rgba(99, 102, 241, 0.5)',
                        '0 0 15px rgba(99, 102, 241, 0.3)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.button>
              </li>
            );
          }

          return (
            <li key={index}>
              <Link
                to={item.path}
                className="relative flex flex-col items-center p-2"
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-colors duration-200 ${
                      isActive ? 'text-indigo-400' : 'text-gray-500'
                    }`}
                    style={isActive ? {
                      filter: 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.5))',
                    } : {}}
                  />
                </motion.div>
                
                {/* Active dot indicator */}
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="w-1 h-1 rounded-full mt-1"
                    style={{ background: '#6366f1' }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                {!isActive && <div className="w-1 h-1 mt-1" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileNav;