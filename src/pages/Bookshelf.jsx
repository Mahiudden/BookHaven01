import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaSort, FaFilter, FaSearch, FaBook, FaStar, FaHeart, FaEye } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import debounce from 'lodash/debounce';

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Title A-Z', value: 'title_asc' },
  { label: 'Title Z-A', value: 'title_desc' },
  { label: 'Rating: High to Low', value: 'rating_desc' },
  { label: 'Rating: Low to High', value: 'rating_asc' }
];

const filterOptions = {
  status: [
    { label: 'All', value: 'all' },
    { label: 'Reading', value: 'Reading' },
    { label: 'Want to Read', value: 'Want-to-Read' },
    { label: 'Read', value: 'Read' }
  ],
  category: [
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
  ]
};

const Bookshelf = () => {
  const navigate = useNavigate();
  const { currentUser, idToken } = useAuth();
  const { isDarkMode } = useTheme();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'All',
    readingStatus: 'all'
  });
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [bookmarkedBooks, setBookmarkedBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
    fetchBookmarkedBooks();
  }, [currentPage, filters, sortBy, currentUser, idToken]);

  useEffect(() => {
    if (!currentUser && !loading) {
      if (window.location.pathname === '/my-books') {
         navigate('/login');
      }
      if (window.location.pathname === '/bookshelf' && books.length > 0 && bookmarkedBooks.length > 0) {
         setBooks([]);
         setBookmarkedBooks([]);
      }
    }
  }, [currentUser, loading, navigate, window.location.pathname]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 12,
        sort: sortBy,
        status: filters.status,
        category: filters.category === 'All' ? '' : filters.category,
        readingStatus: filters.readingStatus === 'all' ? '' : filters.readingStatus
      });

      if (window.location.pathname === '/my-books' && currentUser) {
        queryParams.append('userEmail', currentUser.email);
      }

      const response = await axios.get(`https://server-api-three.vercel.app/api/books?${queryParams}`);
      setBooks(response.data.books);
      setTotalPages(response.data.totalPages);
      setTotalBooks(response.data.totalBooks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books:', error);
      setError('Failed to fetch books');
      setLoading(false);
      toast.error('Failed to fetch books');
    }
  };

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

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSearchQuery('');
        setIsSearching(false);
        fetchBooks();
        return;
      }

      setIsSearching(true);
      try {
        const response = await axios.get(`https://server-api-three.vercel.app/api/books/search?q=${encodeURIComponent(query)}`);
        setBooks(response.data.books);
        setTotalPages(1);
        setCurrentPage(1);
      } catch (error) {
        console.error('Error searching books:', error);
        toast.error('Failed to search books');
      } finally {
        setIsSearching(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      setBookmarkedBooks(prevBooks => 
        prevBooks.map(b => 
          b._id === book._id ? { ...b, upvote: response.data.book.upvote } : b
        )
      );

      toast.success('Book upvoted successfully!');

    } catch (error) {
      console.error('Error upvoting book:', error);
      if (error.response?.data?.message === "You can't upvote your own book") {
        toast.error("You can't upvote your own book!");
      } else {
        toast.error(error.response?.data?.message || 'Failed to upvote book');
      }
    }
  };

  if (loading && !isSearching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-500 mx-auto mb-4" />
          <p className={`text-lg ${
            isDarkMode ? 'text-secondary-300' : 'text-secondary-600'
          }`}>
            Loading books...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'
      }`}
    >
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Bookshelf</h1>
        <p className={`text-lg mb-6 ${
          isDarkMode ? 'text-secondary-300' : 'text-secondary-600'
        }`}>
          Discover and explore our vast collection of books
        </p>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="w-full lg:w-96">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books..."
              isLoading={isSearching}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Quick Reading Status Filter */}
            <div className="relative">
              <select
                value={filters.readingStatus}
                onChange={(e) => handleFilterChange('readingStatus', e.target.value)}
                className={`block appearance-none px-4 py-2 pr-8 rounded-lg border transition-colors duration-300 ${
                  isDarkMode 
                    ? 'border-secondary-600 bg-secondary-800 text-secondary-300 focus:border-primary-500' 
                    : 'border-secondary-300 bg-white text-secondary-700 focus:border-primary-500'
                }`}
              >
                {filterOptions.status.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
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
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-6 p-6 rounded-lg border ${
              isDarkMode 
                ? 'border-secondary-700 bg-secondary-800' 
                : 'border-secondary-200 bg-secondary-50'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Reading Status Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-secondary-300' : 'text-secondary-700'
                }`}>
                  Reading Status
                </label>
                <select
                  value={filters.readingStatus}
                  onChange={(e) => handleFilterChange('readingStatus', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors duration-300 ${
                    isDarkMode 
                      ? 'border-secondary-600 bg-secondary-700 text-secondary-300' 
                      : 'border-secondary-300 bg-white text-secondary-700'
                  }`}
                >
                  {filterOptions.status.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

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
                  {filterOptions.category.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({
                      status: 'all',
                      category: 'All',
                      readingStatus: 'all'
                    });
                    setSortBy('newest');
                  }}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors duration-300 ${
                    isDarkMode 
                      ? 'border-secondary-600 text-secondary-300 hover:bg-secondary-700' 
                      : 'border-secondary-300 text-secondary-700 hover:bg-secondary-100'
                  }`}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Books Grid */}
      <div className="mb-8">
        {books.length === 0 ? (
          <div className="text-center py-12">
            <FaBook className="text-6xl text-secondary-400 mx-auto mb-4" />
            <p className={`text-lg ${
              isDarkMode ? 'text-secondary-400' : 'text-secondary-600'
            }`}>
              No books found
            </p>
            <p className={`text-sm mt-2 ${
              isDarkMode ? 'text-secondary-500' : 'text-secondary-500'
            }`}>
              Try adjusting your search or filter criteria
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

      {/* Pagination */}
      {totalPages > 1 && !searchQuery && (
        <div className="flex justify-center items-center gap-2 mb-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg border transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode 
                ? 'border-secondary-600 bg-secondary-800 text-secondary-300 hover:bg-secondary-700' 
                : 'border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-100'
            }`}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                currentPage === page
                  ? 'bg-primary-600 text-white'
                  : isDarkMode 
                    ? 'border border-secondary-600 bg-secondary-800 text-secondary-300 hover:bg-secondary-700'
                    : 'border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-100'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg border transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode 
                ? 'border-secondary-600 bg-secondary-800 text-secondary-300 hover:bg-secondary-700' 
                : 'border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-100'
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Results Summary */}
      {!searchQuery && (
        <div className={`text-center ${
          isDarkMode ? 'text-secondary-400' : 'text-secondary-500'
        }`}>
          Showing {books.length} of {totalBooks} books
        </div>
      )}
      </div>
    </motion.div>
  );
};

export default Bookshelf; 