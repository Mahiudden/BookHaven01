import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaSearch, FaFilter, FaSort, FaBook, FaStar, FaHeart } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import debounce from 'lodash/debounce';

const Search = () => {
  const navigate = useNavigate();
  const { currentUser, idToken } = useAuth();
  const { isDarkMode } = useTheme();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'All',
    status: 'All',
    rating: 'All'
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [bookmarkedBooks, setBookmarkedBooks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Title A-Z', value: 'title_asc' },
    { label: 'Title Z-A', value: 'title_desc' },
    { label: 'Most Popular', value: 'popular' },
    { label: 'Highest Rated', value: 'rating_desc' },
    { label: 'Lowest Rated', value: 'rating_asc' }
  ];

  const categoryOptions = [
    'All',
    'Fiction',
    'Non-Fiction',
    'Science Fiction',
    'Mystery',
    'Romance',
    'Biography',
    'History',
    'Science',
    'Technology',
    'Self-Help',
    'Poetry',
    'Drama',
    'Fantasy',
    'Horror',
    'Children',
    'Young Adult',
    'Other'
  ];

  const statusOptions = [
    'All',
    'Reading',
    'Want to Read',
    'Read'
  ];

  const ratingOptions = [
    'All',
    '5 Stars',
    '4+ Stars',
    '3+ Stars',
    '2+ Stars',
    '1+ Stars'
  ];

  useEffect(() => {
    fetchBookmarkedBooks();
  }, [currentUser, idToken]);

  const fetchBookmarkedBooks = async () => {
    if (!currentUser || !idToken) {
      setBookmarkedBooks([]);
      return;
    }
    try {
      const response = await axios.get('https://server-api-three.vercel.app/api/users/bookmarks', {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setBookmarkedBooks(response.data);
    } catch (error) {
      console.error('Error fetching bookmarked books:', error);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query, filters, sortBy) => {
      if (!query.trim()) {
        setBooks([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          q: query,
          sort: sortBy,
          category: filters.category === 'All' ? '' : filters.category,
          status: filters.status === 'All' ? '' : filters.status,
          rating: filters.rating === 'All' ? '' : filters.rating
        });

        const response = await axios.get(`https://server-api-three.vercel.app/api/books/search?${queryParams}`);
        setBooks(response.data.books || []);
      } catch (error) {
        console.error('Error searching books:', error);
        toast.error('Failed to search books');
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery, filters, sortBy);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, filters, sortBy, debouncedSearch]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const handleBookmarkToggle = async (book) => {
    if (!currentUser || !idToken) {
      toast.error('Please login to bookmark books');
      return;
    }

    const isCurrentlyBookmarked = bookmarkedBooks.some(b => b._id === book._id);
    const method = isCurrentlyBookmarked ? 'delete' : 'post';
    const url = `https://server-api-three.vercel.app/api/books/${book._id}/bookmark`;

    try {
      await axios({ method, url, headers: { Authorization: `Bearer ${idToken}` } });

      if (isCurrentlyBookmarked) {
        setBookmarkedBooks(bookmarkedBooks.filter(b => b._id !== book._id));
        toast.success('Book removed from bookmarks');
      } else {
        setBookmarkedBooks([...bookmarkedBooks, book]);
        toast.success('Book added to bookmarks');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error(error.response?.data?.message || 'Failed to update bookmark');
    }
  };

  const handleUpvoteClick = async (book) => {
    if (!currentUser || !idToken) {
      navigate('/login');
      return;
    }

    if (book.userEmail === currentUser.email) {
      toast.error('Cannot upvote your own book');
      return;
    }

    const url = `https://server-api-three.vercel.app/api/books/${book._id}/upvote`;

    try {
      const response = await axios.post(url, {}, { headers: { Authorization: `Bearer ${idToken}` } });

      setBooks(prevBooks => 
        prevBooks.map(b => 
          b._id === book._id ? { ...b, upvote: response.data.book.upvote } : b
        )
      );

      toast.success('Book upvoted successfully!');
    } catch (error) {
      console.error('Error upvoting book:', error);
      toast.error(error.response?.data?.message || 'Failed to upvote book');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`container mx-auto px-4 py-8 transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-secondary-900'
      }`}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Advanced Search</h1>
        <p className={`text-lg mb-6 ${
          isDarkMode ? 'text-secondary-300' : 'text-secondary-600'
        }`}>
          Find your next great read with our advanced search and filtering options
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for books, authors, or genres..."
          isLoading={loading}
        />
      </div>

      {/* Filters and Sort Controls */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-lg border transition-colors duration-300 ${
              isDarkMode 
                ? 'border-secondary-600 text-secondary-300 hover:bg-secondary-700' 
                : 'border-secondary-300 text-secondary-700 hover:bg-secondary-100'
            }`}
          >
            <FaFilter className="mr-2" />
            Filters
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className={`block appearance-none px-4 py-2 pr-8 rounded-lg border transition-colors duration-300 ${
                isDarkMode 
                  ? 'border-secondary-600 bg-secondary-800 text-secondary-300 focus:border-primary-500' 
                  : 'border-secondary-300 bg-white text-secondary-700 focus:border-primary-500'
              }`}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <FaSort className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mt-4 p-4 rounded-lg border ${
                isDarkMode 
                  ? 'border-secondary-700 bg-secondary-800' 
                  : 'border-secondary-200 bg-secondary-50'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-secondary-300' : 'text-secondary-700'
                  }`}>
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-300 ${
                      isDarkMode 
                        ? 'border-secondary-600 bg-secondary-700 text-secondary-300' 
                        : 'border-secondary-300 bg-white text-secondary-700'
                    }`}
                  >
                    {categoryOptions.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-secondary-300' : 'text-secondary-700'
                  }`}>
                    Reading Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-300 ${
                      isDarkMode 
                        ? 'border-secondary-600 bg-secondary-700 text-secondary-300' 
                        : 'border-secondary-300 bg-white text-secondary-700'
                    }`}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-secondary-300' : 'text-secondary-700'
                  }`}>
                    Rating
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-300 ${
                      isDarkMode 
                        ? 'border-secondary-600 bg-secondary-700 text-secondary-300' 
                        : 'border-secondary-300 bg-white text-secondary-700'
                    }`}
                  >
                    {ratingOptions.map(rating => (
                      <option key={rating} value={rating}>
                        {rating}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Results */}
      <div className="mb-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-4xl text-primary-500" />
          </div>
        ) : searchQuery ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Search Results for "{searchQuery}"
            </h2>
            {books.length === 0 ? (
              <div className="text-center py-12">
                <FaSearch className="text-6xl text-secondary-400 mx-auto mb-4" />
                <p className={`text-lg ${
                  isDarkMode ? 'text-secondary-400' : 'text-secondary-600'
                }`}>
                  No books found matching your search criteria
                </p>
                <p className={`text-sm mt-2 ${
                  isDarkMode ? 'text-secondary-500' : 'text-secondary-500'
                }`}>
                  Try adjusting your search terms or filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map((book) => {
                  const readingStatus = book.readingStatus || (bookmarkedBooks.find(b => b._id === book._id)?.readingStatus || '');

                  return (
                    <BookCard
                      key={book._id}
                      book={book}
                      onClick={() => handleBookClick(book._id)}
                      onBookmarkToggle={handleBookmarkToggle}
                      isBookmarked={(bookmarkedBooks || []).some(b => b._id === book._id)}
                      onUpvoteClick={handleUpvoteClick}
                      currentUser={currentUser}
                      readingStatus={readingStatus}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaSearch className="text-6xl text-secondary-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Start Your Search</h2>
            <p className={`text-lg ${
              isDarkMode ? 'text-secondary-400' : 'text-secondary-600'
            }`}>
              Enter keywords to find books, authors, or genres
            </p>
          </div>
        )}
      </div>

      {/* Search Tips */}
      {!searchQuery && (
        <div className={`p-6 rounded-lg ${
          isDarkMode ? 'bg-secondary-800 border border-secondary-700' : 'bg-secondary-50 border border-secondary-200'
        }`}>
          <h3 className="text-lg font-semibold mb-4">Search Tips</h3>
          <ul className={`space-y-2 text-sm ${
            isDarkMode ? 'text-secondary-300' : 'text-secondary-600'
          }`}>
            <li>• Search by book title, author name, or genre</li>
            <li>• Use filters to narrow down your results</li>
            <li>• Sort results by relevance, date, or popularity</li>
            <li>• Bookmark books you're interested in</li>
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default Search; 