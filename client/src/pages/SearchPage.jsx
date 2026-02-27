// src/pages/SearchPage.jsx
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader } from 'lucide-react';
import { searchUsers } from '../api/userApi';
import MainLayout from '../components/layout/MainLayout';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await searchUsers(query);
        setResults(data.data?.users || data.users || []);
        setSearched(true);
      } catch (error) {
        console.error('Search failed');
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <motion.h1
          className="text-2xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Search
        </motion.h1>

        {/* Search Input */}
        <motion.div
          className="relative mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="input-premium"
            style={{ paddingLeft: '44px', paddingRight: '40px' }}
            autoFocus
          />
          <AnimatePresence>
            {query && (
              <motion.button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                whileTap={{ scale: 0.8 }}
              >
                <X size={18} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <motion.div
              className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {!loading && results.length > 0 && (
            <motion.div
              className="card overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {results.map((person, index) => (
                <motion.div
                  key={person._id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Link
                    to={`/${person.username}`}
                    className="flex items-center gap-4 p-4 hover:bg-white/3 transition-colors group"
                    style={index > 0 ? { borderTop: '1px solid rgba(75, 85, 99, 0.15)' } : {}}
                  >
                    <motion.img
                      src={person.profilePicture?.url || person.profilePicture || '/default-avatar.png'}
                      alt={person.username}
                      className="w-12 h-12 rounded-full object-cover"
                      style={{ border: '2px solid rgba(99, 102, 241, 0.15)' }}
                      whileHover={{ scale: 1.1 }}
                    />
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate group-hover:text-indigo-400 transition-colors">
                        {person.username}
                      </p>
                      <p className="text-gray-500 text-sm truncate">
                        {person.fullName}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results */}
        {!loading && searched && results.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Search size={48} className="text-gray-600 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-white font-semibold mb-1">No users found</h3>
            <p className="text-gray-500 text-sm">Try a different search term</p>
          </motion.div>
        )}

        {/* Empty State */}
        {!query && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Search size={48} className="text-gray-700 mx-auto mb-4" />
            </motion.div>
            <p className="text-gray-500 text-sm">Search for users by name or username</p>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export default SearchPage;