import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter } from 'react-icons/fa';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import Filter from '../components/Filter';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [filters, setFilters] = useState({
    genre: '',
    language: '',
    year: '',
    rating: '',
  });

  // Mock data - Replace with actual API calls
  const mockBooks = [
    {
      id: 1,
      title: 'The Silent Patient',
      author: 'Alex Michaelides',
      cover: 'https://images.unsplash.com/photo-1544723795-3fb6469f835e?q=80&w=1887&auto=format&fit=crop',
      rating: 4.5,
      publishedYear: 2019,
      genre: 'Psychological Thriller',
      language: 'English',
    },
    {
      id: 2,
      title: 'Where the Crawdads Sing',
      author: 'Delia Owens',
      cover: 'https://images.unsplash.com/photo-1532153781299-7376031b525c?q=80&w=1965&auto=format&fit=crop',
      rating: 4.8,
      publishedYear: 2018,
      genre: 'Fiction',
      language: 'English',
    },
    // Add more mock books...
  ];

  const mockFilters = {
    genres: [
      'Fiction',
      'Non-Fiction',
      'Mystery',
      'Science Fiction',
      'Romance',
      'Biography',
      'History',
      'Self-Help',
    ],
    languages: ['English', 'Spanish', 'French', 'German', 'Chinese'],
    years: Array.from({ length: 25 }, (_, i) => (2024 - i).toString()),
    ratings: ['4+', '3+', '2+', '1+'],
  };

  useEffect(() => {
    const query = searchParams.get('q') || '';
    const genre = searchParams.get('genre') || '';
    const language = searchParams.get('language') || '';
    const year = searchParams.get('year') || '';
    const rating = searchParams.get('rating') || '';

    setFilters({ genre, language, year, rating });
    searchBooks(query, { genre, language, year, rating });
  }, [searchParams]);

  const searchBooks = async (query, filters) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const filteredBooks = mockBooks.filter((book) => {
        const matchesQuery =
          !query ||
          book.title.toLowerCase().includes(query.toLowerCase()) ||
          book.author.toLowerCase().includes(query.toLowerCase());
        const matchesGenre = !filters.genre || book.genre === filters.genre;
        const matchesLanguage =
          !filters.language || book.language === filters.language;
        const matchesYear =
          !filters.year || book.publishedYear.toString() === filters.year;
        const matchesRating =
          !filters.rating ||
          book.rating >= parseInt(filters.rating.replace('+', ''));

        return (
          matchesQuery &&
          matchesGenre &&
          matchesLanguage &&
          matchesYear &&
          matchesRating
        );
      });

      setBooks(filteredBooks);
    } catch (error) {
      console.error('Error searching books:', error);
      showToast('Error searching books', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleSearch = (query) => {
    setSearchParams({ ...filters, q: query });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setSearchParams({ ...newFilters, q: searchParams.get('q') || '' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Search Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              initialQuery={searchParams.get('q') || ''}
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
              isFilterOpen
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaFilter className="mr-2" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 overflow-hidden"
            >
              <Filter
                filters={filters}
                options={mockFilters}
                onChange={handleFilterChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Results */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Search Results
            {searchParams.get('q') && (
              <span className="text-gray-500 ml-2">
                for "{searchParams.get('q')}"
              </span>
            )}
          </h2>
          <p className="text-gray-600">
            {books.length} {books.length === 1 ? 'book' : 'books'} found
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              No books found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}
    </motion.div>
  );
};

export default Search; 