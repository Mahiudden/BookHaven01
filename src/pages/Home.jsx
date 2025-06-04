import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaSpinner, FaBook, FaStar, FaBookmark, FaHeart, FaChevronLeft, FaChevronRight, FaArrowRight } from 'react-icons/fa';
import SearchBar from '../components/SearchBar';
import BookCard from '../components/BookCard';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import FAQAccordion from '../components/FAQAccordion';

const categories = [
  'All',
  'Fiction',
  'Non-fiction',
  'Fantasy',
  'Mystery',
  'Romance',
  'Biography',
  'Self-Help'
];

const Home = () => {
  const navigate = useNavigate();
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [fictionBooks, setFictionBooks] = useState([]);
  const [nonFictionBooks, setNonFictionBooks] = useState([]);
  const [fantasyBooks, setFantasyBooks] = useState([]);
  const [bookmarkedBooks, setBookmarkedBooks] = useState([]);
  const { currentUser, idToken } = useAuth();

  const bannerItems = [
    {
      id: 1,
      title: 'Explore Vast Literary Worlds',
      description: 'Dive into our extensive collection and find your next great read.',
      image: 'https://i.ibb.co/PvYDmBjd/4591314.jpg',
      buttonText: 'Browse Books',
      buttonLink: '/bookshelf'
    },
    {
      id: 2,
      title: 'Curated Picks Just For You',
      description: 'Discover hand-picked books based on your interests and popular trends.',
      image: 'https://i.ibb.co/M5nsDy7q/5110476.jpg',
      buttonText: 'Browse Books',
      buttonLink: '/bookshelf'
    },
    {
      id: 3,
      title: 'Join a Thriving Reading Community',
      description: 'Connect with fellow book lovers, share reviews, and discuss your favorite titles.',
      image: 'https://i.ibb.co/DHh1M731/6850062.jpg',
      buttonText: 'Browse Books',
      buttonLink: '/bookshelf'
    },
    {
      id: 4,
      title: 'Track Your Personal Reading Journey',
      description: 'Monitor your progress, set goals, and visualize your reading habits over time.',
      image: 'https://i.ibb.co/jP41Yc8X/5671236.jpg',
      buttonText: 'Start Reading',
      buttonLink: '/my-books'
    },
  ];

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const faqData = [
    {
      question: 'How do I create an account?',
      answer: 'Click on the Login button and choose your preferred sign up method. You can use email or social login.'
    },
    {
      question: 'How can I add a book to my bookshelf?',
      answer: 'After logging in, go to Add Book, fill in the details, and submit. The book will appear in your bookshelf.'
    },
    {
      question: 'Can I bookmark or like a book without logging in?',
      answer: 'No, you must be logged in to bookmark or like a book.'
    },
    {
      question: 'How do I write a review?',
      answer: 'Go to the book details page and click on Write a Review. You must be logged in to submit a review.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, your data is securely stored and only accessible to you.'
    },
  ];

  useEffect(() => {
    fetchTrendingBooks();
    fetchBooksByCategory('Fiction', setFictionBooks);
    fetchBooksByCategory('Non-fiction', setNonFictionBooks);
    fetchBooksByCategory('Fantasy', setFantasyBooks);
    fetchBookmarkedBooks();

    const bannerInterval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % bannerItems.length);
    }, 5000); // Change banner every 5 seconds

    return () => clearInterval(bannerInterval);

  }, [currentUser, idToken]);

  const fetchTrendingBooks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/books/trending');
      setTrendingBooks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trending books:', error);
      setError('Failed to fetch trending books');
      setLoading(false);
    }
  };

  const fetchBooksByCategory = async (category, setState) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/books?category=${category}&limit=6`); // Fetch 6 books per category
      setState(response.data.books);
    } catch (error) {
      console.error(`Error fetching ${category} books:`, error);
      // Handle error (e.g., set an error state for this section)
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
      // Assuming the backend returns an array of bookmarked books directly
      setBookmarkedBooks(response.data);
    } catch (error) {
      console.error('Error fetching bookmarked books:', error);
      setError('Failed to fetch bookmarked books');
      // setLoading(false); // Avoid setting global loading state here
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
      const response = await axios.get(`http://localhost:5000/api/books/search?q=${query}`);
      setSearchResults(response.data.books); // Assuming the search endpoint returns { books: [...] }
      setIsSearching(false);
    } catch (error) {
      console.error('Error searching books:', error);
      toast.error('Failed to search books');
      setIsSearching(false);
    }
  };

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
       fetchTrendingBooks(); // Refetch trending books for 'All'
       setSearchResults([]); // Clear search results
      return;
    }

    setLoading(true); // Show loading for category filter
    setSearchResults([]); // Clear search results when filtering by category
    try {
      const response = await axios.get(`http://localhost:5000/api/books?category=${category}`);
      setTrendingBooks(response.data.books); // Use the main books state for filtered results
      setLoading(false);
    } catch (error) {
      console.error('Error fetching category books:', error);
      setError('Failed to fetch books for this category');
      setLoading(false);
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
    const url = `http://localhost:5000/api/books/${book._id}/bookmark`;

    try {
      await axios({ method, url, headers: { Authorization: `Bearer ${idToken}` } });

      // Update local state
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

    // Check if the user is trying to upvote their own book
    if (book.userEmail === currentUser.email) {
      toast.error("You can't upvote your own book!");
      return;
    }

    const url = `http://localhost:5000/api/books/${book._id}/upvote`; // Use the upvote endpoint

    try {
      // Send a POST request to the upvote endpoint
      const response = await axios.post(url, {}, { headers: { Authorization: `Bearer ${idToken}` } });

      // Update the book list with the new upvote count
      // This requires finding the book in the relevant state array (trendingBooks, searchResults, fictionBooks, etc.)
      // and updating its upvote count. This can be complex if the book appears in multiple lists.
      // A simpler approach for now is to refetch the relevant data, or just update the single book's state if possible.
      // For simplicity, let's just refetch trending books for now as an example.
      // In a real app, you'd want a more efficient state update or central state management.

      // Option 1: Refetching (simple but less efficient)
      // fetchTrendingBooks();

      // Option 2: Update state directly (more efficient but requires finding the book)
      // Example for trendingBooks:
      setTrendingBooks(prevBooks => 
        prevBooks.map(b => 
          b._id === book._id ? { ...b, upvote: response.data.book.upvote } : b
        )
      );
      // You would need to do this for all relevant book lists (searchResults, fictionBooks, etc.)

      toast.success('Book upvoted successfully!');

    } catch (error) {
      console.error('Error upvoting book:', error);
      // Check if the error is due to trying to upvote own book
      if (error.response?.data?.message === "You can't upvote your own book") {
        toast.error("You can't upvote your own book!");
      } else {
        toast.error(error.response?.data?.message || 'Failed to upvote book');
      }
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

  if (loading && selectedCategory === 'All') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-0 py-0"
    >
      {/* Enhanced Banner/Slider Section */}
      <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden mb-12">
        <AnimatePresence mode="wait">
          {bannerItems.map((item, index) => (
            index === currentBannerIndex && (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.7 }}
                className="absolute top-0 left-0 w-full h-full"
              >
                {/* Background Image with Gradient Overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ 
                    backgroundImage: `url(${item.image})`,
                    filter: 'brightness(0.8)'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

                {/* Content Container */}
                <div className="relative h-full flex items-center">
                  <div className="container mx-auto px-4 md:px-8">
                    <div className="max-w-2xl">
                      <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
                      >
                        {item.title}
                      </motion.h2>
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg md:text-xl text-gray-200 mb-8"
                      >
                        {item.description}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Link
                          to={item.buttonLink}
                          className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105"
                        >
                          {item.buttonText}
                          <FaArrowRight className="ml-2" />
                        </Link>
                      </motion.div>
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
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors duration-300 z-10"
          aria-label="Previous slide"
        >
          <FaChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors duration-300 z-10"
          aria-label="Next slide"
        >
          <FaChevronRight className="w-6 h-6" />
        </button>

        {/* Enhanced Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
          {bannerItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentBannerIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <div className="px-4">
        {/* Search Results (if searching) */}
        {isSearching ? (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
          </div>
        ) : searchQuery ? (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Search Results for "{searchQuery}"
            </h2>
            {searchResults.length === 0 ? (
              <p className="text-center text-gray-500">No books found matching your search</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((book) => {
                  // Prioritize the book's own readingStatus if available
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
            {/* Popular Books Section */}
            <section className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Popular Books</h2>
                <button
                  onClick={() => navigate('/bookshelf')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All
                </button>
              </div>
              {trendingBooks.length === 0 ? (
                 <p className="text-center text-gray-500">No popular books found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {trendingBooks.slice(0, 9).map((book) => {
                    // Prioritize the book's own readingStatus if available
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
            </section>

            {/* Featured Categories Sections */}
            {fictionBooks.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured: Fiction</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {fictionBooks.map((book) => {
                    // Prioritize the book's own readingStatus if available
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
              </section>
            )}

            {nonFictionBooks.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured: Non-fiction</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {nonFictionBooks.map((book) => {
                    // Prioritize the book's own readingStatus if available
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
              </section>
            )}

            {fantasyBooks.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured: Fantasy</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {fantasyBooks.map((book) => {
                    // Prioritize the book's own readingStatus if available
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
              </section>
            )}

            {/* Features Section (retained and slightly modified) */}
              <h1 className='text-2xl text-center mb-8 text-black'>Features Section</h1>
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg shadow-md p-6 text-center"
              >
                <FaBook className="text-4xl text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Track Your Reading</h3>
                <p className="text-gray-600">
                  Keep track of your reading progress and discover new books to read
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg shadow-md p-6 text-center"
              >
                <FaStar className="text-4xl text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Rate & Review</h3>
                <p className="text-gray-600">
                  Share your thoughts and read reviews from other book lovers
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg shadow-md p-6 text-center"
              >
                <FaHeart className="text-4xl text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Connect & Share</h3>
                <p className="text-gray-600">
                  Connect with fellow readers and share your reading journey
                </p>
              </motion.div>
            </section>

            {/* Extra Section 2: From Our Blog (Placeholder) */}
            <section className="mb-12">
               <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">From Our Blog</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                     <img src="https://i.ibb.co/rgxRGDf/images.jpg" alt="Blog Post 1" className="w-full h-48 object-cover" />
                     <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">Top 5 Books to Read This Summer</h3>
                      <p className="text-gray-600 text-sm">Discover our picks for your summer reading list...</p>
                      <button className="mt-4 text-blue-600 hover:underline text-sm">Read More</button>
                     </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                     <img src="https://i.ibb.co/676rwRbz/ft.jpg" alt="Blog Post 2" className="w-full h-48 object-cover" />
                     <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">How to Write a Great Book Review</h3>
                        <p className="text-gray-600 text-sm">Learn how to write a great book review and share your thoughts with the community</p>
                        <button className="mt-4 text-blue-600 hover:underline text-sm">Read More</button>
                     </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                     <img src="https://i.ibb.co/ns8qCFxH/tjh.jpg " alt="Blog Post 3" className="w-full h-48 object-cover" />
                     <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">The Importance of Reading</h3>
                        <p className="text-gray-600 text-sm">Discover the benefits of reading and why it's important for your personal growth</p>
                        <button className="mt-4 text-blue-600 hover:underline text-sm">Read More</button>
                     </div>
                  </div>
               </div>
            </section>
         </>
      )}
      </div>

      {/* FAQ Section */}
      <section className="my-20 py-16 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-3xl shadow-xl">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-blue-800">Frequently Asked Questions</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Find answers to common questions about our platform and services
          </p>
          <FAQAccordion faqs={faqData} />
        </div>
      </section>
   </motion.div>
);
}

export default Home;