import React, { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaUserCircle, FaSun, FaMoon, FaBook, FaSearch, FaHeart, FaUser, FaCog, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import debounce from 'lodash/debounce';
import BookCard from './BookCard';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentUser, logout, idToken } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Navigation links for logged-out users
  const publicNavLinks = [
    { name: 'Home', path: '/', icon: FaBook },
    { name: 'Bookshelf', path: '/bookshelf', icon: FaBook },
  ];

  // Additional navigation links for logged-in users
  const protectedNavLinks = [
    { name: 'My Books', path: '/my-books', icon: FaHeart },
    { name: 'Add Book', path: '/add-book', icon: FaBook },
  ];

  const allNavLinks = [...publicNavLinks, ...protectedNavLinks];

  // Inline search (navbar)
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [bookmarkedBooks, setBookmarkedBooks] = useState([]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!currentUser || !idToken) { setBookmarkedBooks([]); return; }
      try {
        const res = await axios.get('https://server-api-three.vercel.app/api/users/bookmarks', {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        setBookmarkedBooks(res.data || []);
      } catch (_) {}
    };
    fetchBookmarks();
  }, [currentUser, idToken]);

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) { setSearchResults([]); setLoadingSearch(false); return; }
      setLoadingSearch(true);
      try {
        const res = await axios.get(`https://server-api-three.vercel.app/api/books/search?q=${encodeURIComponent(query)}`);
        setSearchResults(res.data.books || []);
      } catch (_) {
        setSearchResults([]);
      } finally { setLoadingSearch(false); }
    }, 400),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  const handleBookmarkToggle = async (book) => {
    if (!currentUser || !idToken) { navigate('/login'); return; }
    const isBookmarked = (bookmarkedBooks || []).some(b => b._id === book._id);
    const method = isBookmarked ? 'delete' : 'post';
    try {
      await axios({ method, url: `https://server-api-three.vercel.app/api/books/${book._id}/bookmark`, headers: { Authorization: `Bearer ${idToken}` } });
      setBookmarkedBooks(isBookmarked ? bookmarkedBooks.filter(b => b._id !== book._id) : [...bookmarkedBooks, book]);
    } catch (_) { /* ignore in navbar */ }
  };

  const handleUpvoteClick = async (book) => {
    if (!currentUser || !idToken) { navigate('/login'); return; }
    if (book.userEmail === currentUser.email) { return; }
    try {
      const res = await axios.post(`https://server-api-three.vercel.app/api/books/${book._id}/upvote`, {}, { headers: { Authorization: `Bearer ${idToken}` } });
      const updated = res.data?.book?.upvote;
      setSearchResults(prev => prev.map(b => (b._id === book._id ? { ...b, upvote: updated } : b)));
    } catch (_) {}
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-800 shadow-lg shadow-gray-900/20' 
          : 'bg-white shadow-md'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <NavLink 
            to="/" 
            className={`flex items-center text-2xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}
          >
            <img src={logo} alt="BookHaven Logo" className="h-10 w-auto mr-2" />
            BookHaven
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Inline Search */}
            <div className="relative">
              <div className={`flex items-center rounded-full border px-4 py-2 transition-colors duration-300 shadow-sm ${isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-200' : 'border-gray-300 bg-white text-gray-700'}`}>
                <FaSearch className={`mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                <input
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Search books..."
                  className={`bg-transparent outline-none w-64 md:w-72 ${isDarkMode ? 'text-gray-100 placeholder-gray-400' : 'text-gray-800 placeholder-gray-500'}`}
                />
              </div>
              <AnimatePresence>
                {isSearchOpen && (searchQuery.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className={`absolute left-0 mt-2 w-[28rem] max-h-[70vh] overflow-auto rounded-xl border p-3 z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    onMouseLeave={() => setIsSearchOpen(false)}
                  >
                    {loadingSearch ? (
                      <div className="flex items-center justify-center py-6 text-sm">
                        <FaSpinner className="animate-spin mr-2" /> Searching...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className={`py-6 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No results</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {searchResults.slice(0, 8).map((book) => {
                          const readingStatus = book.readingStatus || (bookmarkedBooks.find(b => b._id === book._id)?.readingStatus || '');
                          return (
                            <div key={book._id} className="cursor-pointer" onClick={() => navigate(`/book/${book._id}`)}>
                              <BookCard
                                book={book}
                                onClick={() => navigate(`/book/${book._id}`)}
                                onBookmarkToggle={handleBookmarkToggle}
                                isBookmarked={(bookmarkedBooks || []).some(b => b._id === book._id)}
                                onUpvoteClick={handleUpvoteClick}
                                currentUser={currentUser}
                                readingStatus={readingStatus}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {allNavLinks.map((link) =>
              link.name === 'Add Book' || link.name === 'My Books' ? 
                (currentUser ? (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center relative transition-all duration-200 ${
                        isActive 
                          ? `${isDarkMode ? 'text-blue-400' : 'text-blue-600'} font-semibold after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:rounded-full` 
                          : `${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} hover:after:absolute hover:after:bottom-[-8px] hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-blue-500/50 hover:after:rounded-full`
                      }`
                    }
                  >
                    <link.icon className="mr-2 h-4 w-4" />
                    {link.name}
                  </NavLink>
                ) : null) : (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center relative transition-all duration-200 ${
                        isActive 
                          ? `${isDarkMode ? 'text-blue-400' : 'text-blue-600'} font-semibold after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:rounded-full` 
                          : `${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} hover:after:absolute hover:after:bottom-[-8px] hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-blue-500/50 hover:after:rounded-full`
                      }`
                    }
                  >
                    <link.icon className="mr-2 h-4 w-4" />
                    {link.name}
                  </NavLink>
                )
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isDarkMode 
                  ? 'text-yellow-400 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
            </button>

            {/* User Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center space-x-2 p-2 rounded-lg transition-colors duration-300 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="h-8 w-8" />
                  )}
                  <span className="hidden md:block">{currentUser.displayName || currentUser.email}</span>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 ${
                        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                      }`}
                    >
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                          isDarkMode 
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400' 
                            : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                        }`}
                      >
                        <FaUser className="inline mr-2" />
                        Profile
                      </Link>
                      {/* Removed My Books from dropdown as requested */}
                      <button
                        onClick={handleLogout}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                          isDarkMode 
                            ? 'text-red-400 hover:bg-gray-700 hover:text-red-300' 
                            : 'text-red-600 hover:bg-gray-100 hover:text-red-700'
                        }`}
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className={`px-4 py-2 border border-transparent rounded-lg font-medium transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-white bg-blue-600 hover:bg-blue-700' 
                    : 'text-white bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Theme Toggle for Mobile */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isDarkMode 
                  ? 'text-yellow-400 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
            </button>

            <button
              onClick={toggleMenu}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`lg:hidden border-t ${
                isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}
            >
              <nav className="flex flex-col space-y-4 px-4 py-4">
                {allNavLinks.map((link) =>
                  link.name === 'Add Book' || link.name === 'My Books' ? 
                    (currentUser ? (
                      <NavLink
                        key={link.name}
                        to={link.path}
                        onClick={toggleMenu}
                        className={({ isActive }) =>
                          `flex items-center relative transition-all duration-200 ${
                            isActive 
                              ? `${isDarkMode ? 'text-blue-400' : 'text-blue-600'} font-semibold after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:rounded-full` 
                              : `${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} hover:after:absolute hover:after:bottom-[-4px] hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-blue-500/50 hover:after:rounded-full`
                          }`
                        }
                      >
                        <link.icon className="mr-3 h-5 w-5" />
                        {link.name}
                      </NavLink>
                    ) : null) : (
                      <NavLink
                        key={link.name}
                        to={link.path}
                        onClick={toggleMenu}
                        className={({ isActive }) =>
                          `flex items-center relative transition-all duration-200 ${
                            isActive 
                              ? `${isDarkMode ? 'text-blue-400' : 'text-blue-600'} font-semibold after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:rounded-full` 
                              : `${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} hover:after:absolute hover:after:bottom-[-4px] hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-blue-500/50 hover:after:rounded-full`
                          }`
                        }
                      >
                        <link.icon className="mr-3 h-5 w-5" />
                        {link.name}
                      </NavLink>
                    )
                )}

                {/* User Profile Link for Mobile */}
                {currentUser && (
                  <Link
                    to="/profile"
                    onClick={toggleMenu}
                    className={`flex items-center relative transition-all duration-200 ${
                      isDarkMode 
                        ? 'text-gray-300 hover:text-blue-400' 
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    <FaUser className="mr-3 h-5 w-5" />
                    Profile
                  </Link>
                )}

                {/* Login/Logout Button for Mobile */}
                {currentUser ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className={`block w-full text-left px-4 py-2 border border-transparent rounded-lg font-medium transition-colors duration-300 ${
                      isDarkMode 
                        ? 'text-white bg-red-600 hover:bg-red-700' 
                        : 'text-white bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={toggleMenu}
                    className={`block w-full text-left px-4 py-2 border border-transparent rounded-lg font-medium transition-colors duration-300 ${
                      isDarkMode 
                        ? 'text-white bg-blue-600 hover:bg-blue-700' 
                        : 'text-white bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    Login
                  </Link>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar; 