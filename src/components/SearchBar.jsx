import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';

const SearchBar = ({ onSearch, value, onChange, placeholder = 'Search...', isLoading }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const debouncedOnSearch = useCallback(
    debounce((query) => {
      onSearch(query);
    }, 500),
    [onSearch]
  );

  useEffect(() => {
    setQuery(value);
    if (value.trim()) {
      debouncedOnSearch(value);
    } else {
      debouncedOnSearch.cancel();
      setSuggestions([]);
      setShowSuggestions(false);
    }
    return () => {
      debouncedOnSearch.cancel();
    };
  }, [value, debouncedOnSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setSuggestionsLoading(false);
        return;
      }

      setSuggestionsLoading(true);
      try {
        const response = await fetch(`/api/books/search?q=${query}`);
        const data = await response.json();
        setSuggestions(data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setSuggestionsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(e);
    setShowSuggestions(true);
  };

  const handleClear = () => {
    onChange({ target: { value: '' } });
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.title);
    navigate(`/book/${suggestion.id}`);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full px-4 py-3 pl-12 pr-12 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          {value && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <FaTimes />
            </button>
          )}
          {isLoading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-12">
              <FaSpinner className="animate-spin text-blue-500" />
            </div>
          )}
        </div>
      </form>

      <AnimatePresence>
        {showSuggestions && (query.length >= 2) && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
          >
            {suggestionsLoading ? (
              <div className="p-4 text-center text-gray-500">Loading suggestions...</div>
            ) : (
              <ul>
                {suggestions.map((suggestion) => (
                  <motion.li
                    key={suggestion.id || suggestion._id}
                    whileHover={{ backgroundColor: '#f3f4f6' }}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={suggestion.cover || suggestion.coverImage || 'https://via.placeholder.com/40x60?text=No+Cover'}
                        alt={suggestion.title || suggestion.bookTitle}
                        className="w-10 h-14 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{suggestion.title || suggestion.bookTitle}</p>
                        <p className="text-sm text-gray-500">{suggestion.author || suggestion.bookAuthor}</p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar; 