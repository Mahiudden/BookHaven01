import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaSpinner, FaBook, FaStar, FaBookmark, FaHeart } from 'react-icons/fa';
import SearchBar from '../components/SearchBar';
import BookCard from '../components/BookCard';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

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
  const [likedBooks, setLikedBooks] = useState([]);
  const { currentUser, idToken } = useAuth();

  const bannerItems = [
    { id: 1, title: 'Explore Vast Literary Worlds', description: 'Dive into our extensive collection and find your next great read.', image: 'https://i.ibb.co/PvYDmBjd/4591314.jpg' },
    { id: 2, title: 'Curated Picks Just For You', description: 'Discover hand-picked books based on your interests and popular trends.', image: 'https://i.ibb.co/M5nsDy7q/5110476.jpg' },
    { id: 3, title: 'Join a Thriving Reading Community', description: 'Connect with fellow book lovers, share reviews, and discuss your favorite titles.', image: 'https://i.ibb.co/DHh1M731/6850062.jpg' },
    { id: 4, title: 'Track Your Personal Reading Journey', description: 'Monitor your progress, set goals, and visualize your reading habits over time.', image: 'https://i.ibb.co/jP41Yc8X/5671236.jpg' },
  ];

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    fetchTrendingBooks();
    fetchBooksByCategory('Fiction', setFictionBooks);
    fetchBooksByCategory('Non-fiction', setNonFictionBooks);
    fetchBooksByCategory('Fantasy', setFantasyBooks);
    fetchBookmarkedBooks();
    fetchLikedBooks();

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

  const fetchLikedBooks = async () => {
    if (!currentUser || !idToken) {
      setLikedBooks([]);
      return;
    }
    try {
      const response = await axios.get('http://localhost:5000/api/users/likes', {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      // Assuming the backend returns an array of liked book objects directly
      setLikedBooks(response.data);
    } catch (error) {
      console.error('Error fetching liked books:', error);
      // setError('Failed to fetch liked books'); // Avoid setting global error state here
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

  const handleLikeToggle = async (book) => {
    if (!currentUser || !idToken) {
      navigate('/login');
      return;
    }

    // Check if the user is trying to like their own book
    if (book.userEmail === currentUser.email) {
        toast.error('Cannot like your own book');
        return;
    }

    const isCurrentlyLiked = (likedBooks || []).some(b => b._id === book._id);
    const method = isCurrentlyLiked ? 'delete' : 'post';
    const url = `http://localhost:5000/api/books/${book._id}/like`;

    try {
      await axios({ method, url, headers: { Authorization: `Bearer ${idToken}` } });

      // Update local likedBooks state
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
      {/* Banner/Slider Section */}
      <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden mb-12 rounded-md">
        {bannerItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentBannerIndex ? 1 : 0 }}
            transition={{ opacity: { duration: 1 } }}
            className="absolute top-0 left-0 w-full h-full bg-cover bg-center flex items-center justify-center text-white"
            style={{ backgroundImage: `url(${item.image})` }}
          >
            <div className="bg-black bg-opacity-50 p-8 rounded-md text-center max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{item.title}</h2>
              <p className="text-lg">{item.description}</p>
            </div>
          </motion.div>
        ))}
        {/* Navigation Dots (Optional) */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {bannerItems.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentBannerIndex ? 'bg-white' : 'bg-gray-400'
              }`}
              onClick={() => setCurrentBannerIndex(index)}
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
                {searchResults.map((book) => (
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
                  {trendingBooks.slice(0, 9).map((book) => (
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
            </section>

            {/* Featured Categories Sections */}
            {fictionBooks.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured: Fiction</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {fictionBooks.map((book) => (
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
              </section>
            )}

            {nonFictionBooks.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured: Non-fiction</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {nonFictionBooks.map((book) => (
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
              </section>
            )}

            {fantasyBooks.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured: Fantasy</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {fantasyBooks.map((book) => (
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
   </motion.div>
);
}

export default Home;