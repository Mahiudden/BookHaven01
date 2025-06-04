import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaEdit, FaTrash, FaSpinner, FaBook, FaBookmark, FaHeart, FaChartBar } from 'react-icons/fa';
import BookCard from '../components/BookCard';
import Modal from '../components/Modal';

const MyBooks = () => {
  const navigate = useNavigate();
  const { currentUser, idToken } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'reading', 'read', 'want-to-read'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'title', 'upvotes'
  const [bookmarkedBooks, setBookmarkedBooks] = useState([]);

  useEffect(() => {
    if (!currentUser || !idToken) {
      navigate('/login');
      return;
    }

    fetchMyBooks();
    fetchBookmarkedBooks();
  }, [currentUser, idToken, navigate]);

  const fetchMyBooks = async () => {
    try {
      const response = await axios.get(`https://server-api-three.vercel.app/api/books?userEmail=${currentUser.email}`, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      setBooks(response.data.books);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books:', error);
      setError('Failed to fetch your books');
      setLoading(false);
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
      console.error('Error fetching bookmarked books for toggle state:', error);
    }
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

  const handleDeleteClick = (book) => {
    setBookToDelete(book);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return;

    try {
      await axios.delete(`https://server-api-three.vercel.app/api/books/${bookToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      setBooks(books.filter(book => book._id !== bookToDelete._id));
      toast.success('Book deleted successfully');
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error(error.response?.data?.message || 'Failed to delete book');
    } finally {
      setIsDeleteModalOpen(false);
      setBookToDelete(null);
    }
  };

  const handleEditClick = (bookId) => {
    navigate(`/edit-book/${bookId}`);
  };

  const handleStatusChange = async (bookId, newStatus) => {
    try {
      const response = await axios.patch(
        `https://server-api-three.vercel.app/api/books/${bookId}`,
        { readingStatus: newStatus },
        {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      );
      setBooks(books.map(book => 
        book._id === bookId ? { ...book, readingStatus: newStatus } : book
      ));
      toast.success('Reading status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const filteredBooks = books.filter(book => {
    if (filter === 'all') return true;
    return book.readingStatus === filter;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.bookTitle.localeCompare(b.bookTitle);
      case 'upvotes':
        return b.upvote - a.upvote;
      case 'recent':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  if (loading) {
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-stone-950">My Books</h1>
        <button
          onClick={() => navigate('/add-book')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add New Book
        </button>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md text-black px-4 py-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Books</option>
            <option value="Reading">Reading</option>
            <option value="Read">Read</option>
            <option value="Want-to-Read">Want to Read</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm  font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-md border-gray-500 text-black px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="recent">Most Recent</option>
            <option value="title">Title</option>
            <option value="upvotes">Most Upvoted</option>
          </select>
        </div>
      </div>

      {/* Books Grid */}
      {sortedBooks.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No books found. Add your first book!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-gray-900">
          {sortedBooks.map(book => (
            <div key={book._id} className="relative group">
              <BookCard 
                book={book} 
                onBookmarkToggle={handleBookmarkToggle}
                isBookmarked={bookmarkedBooks.some(b => b._id === book._id)}
                onClick={() => handleBookClick(book._id)}
              />
              
              {/* Action Buttons */}
              <div className="absolute top-2 left-2 flex space-x-2">
                <button
                  onClick={() => handleEditClick(book._id)}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  title="Edit Book"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteClick(book)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  title="Delete Book"
                >
                  <FaTrash />
                </button>
              </div>

              {/* Reading Status Dropdown */}
              <div className="absolute bottom-38 right-2">
                <select
                  value={book.readingStatus}
                  onChange={(e) => handleStatusChange(book._id, e.target.value)}
                  className="text-sm rounded-md px-2 py-1 mt-5 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/90"
                >
                  <option value="Want-to-Read">Want to Read</option>
                  <option value="Reading">Reading</option>
                  <option value="Read">Read</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setBookToDelete(null);
        }}
        title="Delete Book"
      >
        <div className="p-4">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete "{bookToDelete?.bookTitle}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setBookToDelete(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default MyBooks; 