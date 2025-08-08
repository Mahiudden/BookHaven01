import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaSpinner, FaBook, FaStar, FaBookmark, FaHeart, FaChevronLeft, FaChevronRight, FaArrowRight, FaEnvelope, FaQuoteLeft, FaQuoteRight, FaUser, FaCalendar } from 'react-icons/fa';
import SearchBar from '../components/SearchBar';
import BookCard from '../components/BookCard';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import FAQAccordion from '../components/FAQAccordion';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, idToken } = useAuth();
  const { isDarkMode } = useTheme();
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [fictionBooks, setFictionBooks] = useState([]);
  const [nonFictionBooks, setNonFictionBooks] = useState([]);
  const [fantasyBooks, setFantasyBooks] = useState([]);
  const [bookmarkedBooks, setBookmarkedBooks] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSliderPaused, setIsSliderPaused] = useState(false);

  const bannerItems = [
    {
      id: 1,
      title: 'Welcome to the World of Books',
      subtitle: 'Find Your Next Favorite Book',
      description: 'Discover your preferred books from our vast collection and share your reading experience.',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2128&q=80',
      buttonText: 'View Books',
      buttonLink: '/bookshelf',
      gradient: 'from-blue-600/80 to-purple-600/80'
    },
    {
      id: 2,
      title: 'Curated Books for You',
      subtitle: 'Personalized Recommendations',
      description: 'Discover handpicked books based on your interests and popular trends.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      buttonText: 'View Books',
      buttonLink: '/bookshelf',
      gradient: 'from-green-600/80 to-blue-600/80'
    },
    {
      id: 3,
      title: 'Join the Reader Community',
      subtitle: 'Connect with Other Readers',
      description: 'Connect with other book lovers, share reviews, and discuss your favorite books.',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      buttonText: 'View Community',
      buttonLink: '/bookshelf',
      gradient: 'from-orange-600/80 to-red-600/80'
    },
    {
      id: 4,
      title: 'Track Your Reading Journey',
      subtitle: 'Set Reading Goals',
      description: 'Monitor your progress, set goals, and see your reading habits over time.',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2128&q=80',
      buttonText: 'My Books',
      buttonLink: '/my-books',
      gradient: 'from-purple-600/80 to-pink-600/80'
    },
  ];

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const faqData = [
    {
      question: 'How do I create an account?',
      answer: 'Click on the login button and choose your preferred sign-up method. You can use email or social login.'
    },
    {
      question: 'How do I add a book?',
      answer: 'After logging in, go to Add Book, fill in the details, and submit. The book will appear in your bookshelf.'
    },
    {
      question: 'Can I bookmark books without logging in?',
      answer: 'No, you need to log in to bookmark books.'
    },
    {
      question: 'How do I write a review?',
      answer: 'Go to the book details page and click on Write a Review. You need to be logged in to submit a review.'
    },
    {
      question: 'Is my data safe?',
      answer: 'Yes, your data is stored securely and is only accessible to you.'
    },
  ];

  useEffect(() => {
    fetchTrendingBooks();
    fetchBooksByCategory('Fiction', setFictionBooks);
    fetchBooksByCategory('Non-Fiction', setNonFictionBooks);
    fetchBooksByCategory('Fantasy', setFantasyBooks);
    fetchBookmarkedBooks();

    // Auto-advance slider
    const bannerInterval = setInterval(() => {
      if (!isSliderPaused) {
        setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % bannerItems.length);
      }
    }, 6000);

    return () => clearInterval(bannerInterval);
  }, [currentUser, idToken, isSliderPaused]);

  const fetchTrendingBooks = async () => {
    try {
      const response = await axios.get('https://server-api-three.vercel.app/api/books/trending');
      setTrendingBooks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trending books:', error);
      setLoading(false);
    }
  };

  const fetchBooksByCategory = async (category, setState) => {
    try {
      const response = await axios.get(`https://server-api-three.vercel.app/api/books?category=${category}&limit=6`);
      setState(response.data.books);
    } catch (error) {
      console.error(`Error fetching ${category} books:`, error);
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

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(`https://server-api-three.vercel.app/api/books/search?q=${query}`);
      setSearchResults(response.data.books);
      setIsSearching(false);
    } catch (error) {
      console.error('Error searching books:', error);
      toast.error('Failed to search books');
      setIsSearching(false);
    }
  };

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const handleBookmarkToggle = async (book) => {
    if (!currentUser || !idToken) {
      navigate('/login');
      return;
    }

    const isCurrentlyBookmarked = (bookmarkedBooks || []).some(b => b._id === book._id);
    const method = isCurrentlyBookmarked ? 'delete' : 'post';
    const url = `https://server-api-three.vercel.app/api/books/${book._id}/bookmark`;

    try {
      await axios({ method, url, headers: { Authorization: `Bearer ${idToken}` } });

      if (isCurrentlyBookmarked) {
        setBookmarkedBooks((bookmarkedBooks || []).filter(b => b._id !== book._id));
        toast.success('Book removed from bookmarks');
      } else {
        setBookmarkedBooks([...(bookmarkedBooks || []), book]);
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
              toast.error("You cannot upvote your own book!");
      return;
    }

    const url = `https://server-api-three.vercel.app/api/books/${book._id}/upvote`;

    try {
      const response = await axios.post(url, {}, { headers: { Authorization: `Bearer ${idToken}` } });

      setTrendingBooks(prevBooks => 
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

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
              toast.success('Thank you for subscribing to our newsletter!');
      setNewsletterEmail('');
    }
  };

  const handlePrevSlide = () => {
    setCurrentBannerIndex((prevIndex) => 
      prevIndex === 0 ? bannerItems.length - 1 : prevIndex - 1
    );
  };

  const handleNextSlide = () => {
    setCurrentBannerIndex((prevIndex) => 
      (prevIndex + 1) % bannerItems.length
    );
  };

  const toggleSlider = () => {
    setIsSliderPaused(!isSliderPaused);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className={`text-lg ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Loading books...
          </p>
        </div>
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
      {/* Enhanced Banner/Slider Section */}
      <section className="relative w-full max-w-[1500px] mx-auto h-[480px] md:h-[560px] lg:h-[640px] overflow-hidden rounded-3xl">
        <AnimatePresence mode="wait">
          {bannerItems.map((item, index) => (
            index === currentBannerIndex && (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute top-0 left-0 w-full h-full"
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ 
                    backgroundImage: `url(${item.image})`,
                    filter: 'brightness(0.65)'
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient}`} />

                {/* Content Container */}
                <div className="relative h-full flex items-center">
                  <div className="container mx-auto px-4 md:px-8">
                    <div className="max-w-3xl">
                      <div className="mb-4">
                        <h3 className="text-lg md:text-xl text-yellow-400 font-medium mb-2">
                          {item.subtitle}
                        </h3>
                      </div>
                      
                      <h2 
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
                      >
                        {item.title}
                      </h2>
                      
                      <p className="text-lg md:text-xl text-gray-200/90 mb-8 max-w-2xl">
                        {item.description}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                          to={item.buttonLink}
                          className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300 shadow-lg"
                        >
                          {item.buttonText}
                          <FaArrowRight className="ml-2" />
                        </Link>
                        
                        {/* Removed play/pause toggle button as requested */}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all duration-300 z-10 backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <FaChevronLeft className="w-6 h-6" />
        </button>
        
        <button
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all duration-300 z-10 backdrop-blur-sm"
          aria-label="Next slide"
        >
          <FaChevronRight className="w-6 h-6" />
        </button>

        {/* Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
          {bannerItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                index === currentBannerIndex 
                  ? 'bg-white shadow-lg' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20 z-10">
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: isSliderPaused ? '0%' : '100%' }}
            transition={{ duration: 6, ease: "linear" }}
            key={currentBannerIndex}
          />
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Search Results (if searching) */}
        {isSearching ? (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
          </div>
        ) : searchQuery ? (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Search results for "{searchQuery}"
            </h2>
            {searchResults.length === 0 ? (
              <p className={`text-center ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No books found matching your search
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((book) => {
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
          <>
            {/* Section 1: Popular Books */}
            <section className="mb-20">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex justify-between items-center mb-12"
              >
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Popular Books
                  </h2>
                  <p className={`text-lg ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Discover the most loved books by our community
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/bookshelf')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                >
                  View All
                </motion.button>
              </motion.div>
              
              {trendingBooks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className={`text-center py-16 rounded-2xl ${
                    isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                  }`}
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <FaBook className="text-3xl text-white" />
                  </div>
                  <p className={`text-xl ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    No popular books found.
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                  {trendingBooks.slice(0, 8).map((book, index) => {
                    const readingStatus = book.readingStatus || (bookmarkedBooks.find(b => b._id === book._id)?.readingStatus || '');

                    return (
                      <motion.div
                        key={book._id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        whileHover={{ y: -10 }}
                      >
                        <BookCard
                          book={book}
                          onClick={() => handleBookClick(book._id)}
                          onBookmarkToggle={handleBookmarkToggle}
                          isBookmarked={(bookmarkedBooks || []).some(b => b._id === book._id)}
                          onUpvoteClick={handleUpvoteClick}
                          currentUser={currentUser}
                          readingStatus={readingStatus}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </section>

            {/* Special Category: Fantasy */}
            <section className="mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex justify-between items-center mb-8"
              >
                <h2 className="text-3xl md:text-4xl font-bold">
                  Fantasy Picks
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/bookshelf')}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg"
                >
                  View All
                </motion.button>
              </motion.div>

              {fantasyBooks.length === 0 ? (
                <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No fantasy books available right now.
                </p>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                  {fantasyBooks.map((book, index) => {
                    const readingStatus = book.readingStatus || (bookmarkedBooks.find(b => b._id === book._id)?.readingStatus || '');
                    return (
                      <motion.div
                        key={book._id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                      >
                        <BookCard
                          book={book}
                          onClick={() => handleBookClick(book._id)}
                          onBookmarkToggle={handleBookmarkToggle}
                          isBookmarked={(bookmarkedBooks || []).some(b => b._id === book._id)}
                          onUpvoteClick={handleUpvoteClick}
                          currentUser={currentUser}
                          readingStatus={readingStatus}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </section>

            {/* Special Category: Non-Fiction */}
            <section className="mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex justify-between items-center mb-8"
              >
                <h2 className="text-3xl md:text-4xl font-bold">
                  Non‑Fiction Highlights
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/bookshelf')}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg"
                >
                  View All
                </motion.button>
              </motion.div>

              {nonFictionBooks.length === 0 ? (
                <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No non‑fiction books available right now.
                </p>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                  {nonFictionBooks.map((book, index) => {
                    const readingStatus = book.readingStatus || (bookmarkedBooks.find(b => b._id === book._id)?.readingStatus || '');
                    return (
                      <motion.div
                        key={book._id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                      >
                        <BookCard
                          book={book}
                          onClick={() => handleBookClick(book._id)}
                          onBookmarkToggle={handleBookmarkToggle}
                          isBookmarked={(bookmarkedBooks || []).some(b => b._id === book._id)}
                          onUpvoteClick={handleUpvoteClick}
                          currentUser={currentUser}
                          readingStatus={readingStatus}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </section>

            {/* Section 2: Features Section */}
            <section className="mb-20">
              <div className="text-center mb-16">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                  Why Choose BookHaven?
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className={`text-lg max-w-2xl mx-auto ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Discover the features that make BookHaven your perfect reading companion
                </motion.p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    boxShadow: isDarkMode 
                      ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
                      : '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
                  }}
                  className={`relative rounded-2xl p-8 text-center transition-all duration-500 overflow-hidden ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 border border-gray-600' 
                      : 'bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <FaBook className="text-3xl text-white" />
                    </div>
                    <h3 className={`text-2xl font-bold mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Track Your Reading</h3>
                    <p className={`text-lg leading-relaxed ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Track your reading progress and discover new books with our intelligent recommendation system
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    boxShadow: isDarkMode 
                      ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
                      : '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
                  }}
                  className={`relative rounded-2xl p-8 text-center transition-all duration-500 overflow-hidden ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 border border-gray-600' 
                      : 'bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                      <FaStar className="text-3xl text-white" />
                    </div>
                    <h3 className={`text-2xl font-bold mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Ratings & Reviews</h3>
                    <p className={`text-lg leading-relaxed ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Share your opinions and read reviews from other book lovers in our vibrant community
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    boxShadow: isDarkMode 
                      ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
                      : '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
                  }}
                  className={`relative rounded-2xl p-8 text-center transition-all duration-500 overflow-hidden ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 border border-gray-600' 
                      : 'bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-2xl"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <FaHeart className="text-3xl text-white" />
                    </div>
                    <h3 className={`text-2xl font-bold mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Connect & Share</h3>
                    <p className={`text-lg leading-relaxed ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Connect with other readers and share your reading journey with our social features
                    </p>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Section 3: Newsletter */}
            <section className="mb-20">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className={`relative rounded-3xl p-12 text-center overflow-hidden ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800' 
                    : 'bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100'
                }`}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                  <div className="absolute top-1/2 right-0 w-24 h-24 bg-white rounded-full translate-x-12 -translate-y-12"></div>
                  <div className="absolute bottom-0 left-1/3 w-20 h-20 bg-white rounded-full translate-y-10"></div>
                </div>
                
                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl"
                  >
                    <FaEnvelope className="text-4xl text-white" />
                  </motion.div>
                  
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className={`text-4xl md:text-5xl font-bold mb-6 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Stay Updated
                  </motion.h2>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className={`text-xl mb-8 max-w-3xl mx-auto ${
                      isDarkMode ? 'text-blue-100' : 'text-gray-600'
                    }`}
                  >
                    Subscribe to our newsletter for the latest book recommendations, author interviews, and reading tips.
                  </motion.p>
                  
                  <motion.form 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    onSubmit={handleNewsletterSubmit} 
                    className="max-w-lg mx-auto"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        type="email"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all duration-300 ${
                          isDarkMode 
                            ? 'border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm'
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        required
                      />
                      <button
                        type="submit"
                        className="px-8 py-4 bg-gradient-to-r from-white to-gray-100 text-blue-900 rounded-xl font-semibold hover:from-gray-100 hover:to-white transform hover:scale-105 transition-all duration-300 shadow-lg"
                      >
                        Subscribe
                      </button>
                    </div>
                  </motion.form>
                </div>
              </motion.div>
            </section>
          </>
        )}
      </div>

            {/* FAQ Section */}
      <section className="mb-0">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={`relative rounded-t-3xl p-12 text-center overflow-hidden max-w-[1500px] mx-auto ${
            isDarkMode 
              ? 'bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800' 
              : 'bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100'
          }`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className={`absolute top-10 left-10 w-64 h-64 rounded-full ${
              isDarkMode ? 'bg-blue-300' : 'bg-white'
            }`}></div>
            <div className={`absolute bottom-10 right-10 w-48 h-48 rounded-full ${
              isDarkMode ? 'bg-purple-300' : 'bg-white'
            }`}></div>
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full ${
              isDarkMode ? 'bg-blue-200' : 'bg-white'
            }`}></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Frequently Asked Questions
              </h2>
              <p className={`text-lg max-w-2xl mx-auto ${
                isDarkMode 
                  ? 'text-blue-200' 
                  : 'text-blue-800 font-medium'
              }`}>
                Find answers to common questions about our platform and services
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <FAQAccordion faqs={faqData} isDarkMode={isDarkMode} />
            </motion.div>
          </div>
        </motion.div>
      </section>
      
      {/* Gap Section with Dynamic Background */}
      <section className={`py-8 ${
        isDarkMode ? 'bg-gray-950' : 'bg-gray-50'
      }`}>
        <div className="max-w-[1500px] mx-auto">
          {/* Optional: Add some subtle content or just keep it as a gap */}
        </div>
      </section>
    </motion.div>
  );
}

export default Home;