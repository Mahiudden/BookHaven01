import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaSort, FaFilter, FaSearch } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import debounce from 'lodash/debounce';

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Title A-Z', value: 'title_asc' },
  { label: 'Title Z-A', value: 'title_desc' }
];

const filterOptions = {
  status: [
    { label: 'All', value: 'all' },
    { label: 'Currently Reading', value: 'reading' },
    { label: 'Want to Read', value: 'want_to_read' },
    { label: 'Completed', value: 'completed' }
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
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'All'
  });
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [bookmarkedBooks, setBookmarkedBooks] = useState([]);
  const [likedBooks, setLikedBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
    fetchBookmarkedBooks();
    fetchLikedBooks();
  }, [currentPage, filters, sortBy, currentUser, idToken]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 12,
        sort: sortBy,
        status: filters.status,
        category: filters.category === 'All' ? '' : filters.category
      });

      const response = await axios.get(`http://localhost:5000/api/books?${queryParams}`);
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
      const response = await axios.get('http://localhost:5000/api/users/bookmarks', {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setBookmarkedBooks(response.data);
    } catch (error) {
      console.error('Error fetching bookmarked books:', error);
    }
  };

  const fetchLikedBooks = async () => {
    if (!currentUser || !idToken) {
      setLikedBooks([]);
      return;
    }
    try {
      const response = await axios.get('http://localhost:5000/api/users/likes', {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setLikedBooks(response.data);
    } catch (error) {
      console.error('Error fetching liked books:', error);
    }
  };

  // Create a debounced search function
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
        const response = await axios.get(`http://localhost:5000/api/books/search?q=${encodeURIComponent(query)}`);
        setBooks(response.data.books);
        setTotalPages(1);
        setCurrentPage(1);
      } catch (error) {
        console.error('Error searching books:', error);
        toast.error('Failed to search books');
      } finally {
        setIsSearching(false);
      }
    }, 500), // 500ms delay
    [] // Empty dependency array since we don't want to recreate this function
  );

  // Effect to trigger search when searchQuery changes
  useEffect(() => {
    debouncedSearch(searchQuery);
    // Cleanup function to cancel any pending debounced calls
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
    const url = `http://localhost:5000/api/books/${book._id}/bookmark`;

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

  const handleLikeToggle = async (book) => {
    if (!currentUser || !idToken) {
      navigate('/login');
      return;
    }

    if (book.userEmail === currentUser.email) {
        toast.error('Cannot like your own book');
        return;
    }

    const isCurrentlyLiked = (likedBooks || []).some(b => b._id === book._id);
    const method = isCurrentlyLiked ? 'delete' : 'post';
    const url = `http://localhost:5000/api/books/${book._id}/like`;

    try {
      await axios({ method, url, headers: { Authorization: `Bearer ${idToken}` } });

      if (isCurrentlyLiked) {
        setLikedBooks((likedBooks || []).filter(b => b._id !== book._id));
        toast.success('Book unliked');
      } else {
        setLikedBooks([...(likedBooks || []), book]);
        toast.success('Book liked');
      }

    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error(error.response?.data?.message || 'Failed to update like');
    }
  };

  if (loading && !isSearching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-8">
        {error}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Bookshelf</h1>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="w-full md:w-96">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books..."
              isLoading={isSearching}
            />
          </div>
          {/* Updated Filter and Sort controls with improved styling */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter Dropdown */}
              <div className="relative">
                 <label htmlFor="category-filter" className="sr-only">Category</label>
                 <select
                   id="category-filter"
                   value={filters.category}
                   onChange={(e) => handleFilterChange('category', e.target.value)}
                   className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                 >
                   <option value="">All Categories</option>
                   {filterOptions.category.filter(cat => cat !== 'All').map(category => (
                     <option key={category} value={category}>
                       {category}
                     </option>
                   ))}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                 </div>
              </div>
            {/* Sort Dropdown */}
            <div className="relative">
               <label htmlFor="sort-by" className="sr-only">Sort By</label>
               <select
                 id="sort-by"
                 value={sortBy}
                 onChange={(e) => handleSortChange(e.target.value)}
                 className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
               >
                 {sortOptions.map(option => (
                   <option key={option.value} value={option.value}>
                     {option.label}
                   </option>
                 ))}
               </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                 <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="mb-8">
        {books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No books found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map(book => (
              <BookCard
                key={book._id}
                book={book}
                onClick={() => handleBookClick(book._id)}
                onBookmarkToggle={handleBookmarkToggle}
                isBookmarked={(bookmarkedBooks || []).some(b => b._id === book._id)}
                onLikeToggle={handleLikeToggle}
                isLiked={(likedBooks || []).some(b => b._id === book._id)}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !searchQuery && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Next
          </button>
        </div>
      )}

      {/* Results Summary */}
      {!searchQuery && (
        <div className="text-center text-gray-500 mt-4">
          Showing {books.length} of {totalBooks} books
        </div>
      )}
    </motion.div>
  );
};

export default Bookshelf; 