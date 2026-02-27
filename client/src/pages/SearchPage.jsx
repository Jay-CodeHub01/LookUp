// src/pages/SearchPage.jsx
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
        setResults(data.users || data);
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
        <h1 className="text-2xl font-bold text-white mb-6">Search</h1>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-11 pr-10 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <Loader className="animate-spin text-blue-500" size={24} />
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-800/50">
            {results.map((person) => (
              <Link
                key={person._id}
                to={`/${person.username}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-800/50 transition-colors"
              >
                <img
                  src={person.profilePicture || '/default-avatar.png'}
                  alt={person.username}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-700"
                />
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {person.username}
                  </p>
                  <p className="text-gray-500 text-sm truncate">
                    {person.fullName}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && searched && results.length === 0 && (
          <div className="text-center py-12">
            <Search size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-1">No users found</h3>
            <p className="text-gray-500 text-sm">
              Try a different search term
            </p>
          </div>
        )}

        {/* Empty State */}
        {!query && (
          <div className="text-center py-12">
            <Search size={48} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">Search for users by name or username</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SearchPage;