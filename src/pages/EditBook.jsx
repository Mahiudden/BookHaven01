import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';

const EditBook = () => {
  const { id } = useParams(); // Get book ID from URL
  const navigate = useNavigate();
  const { currentUser, idToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    bookTitle: '',
    bookAuthor: '',
    bookCategory: '',
    totalPage: '',
    bookOverview: '',
    coverImageUrl: '',
    readingStatus: 'Want-to-Read'
  });

  const categories = [
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

  useEffect(() => {
    if (!currentUser || !idToken) {
      toast.error('Please login to edit books');
      navigate('/login'); // Redirect to login if not authenticated
      return;
    }

    const fetchBookData = async () => {
      try {
        const response = await axios.get(`https://server-api-three.vercel.app/api/books/${id}`, {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        });
        const bookData = response.data;

        // Check if the current user is the owner of the book
        if (bookData.userEmail !== currentUser.email) {
          toast.error('You are not authorized to edit this book');
          navigate('/my-books'); // Redirect if not authorized
          return;
        }

        // Populate form data with fetched book data
        setFormData({
          bookTitle: bookData.bookTitle || '',
          bookAuthor: bookData.bookAuthor || '',
          bookCategory: bookData.bookCategory || '',
          totalPage: bookData.totalPage || '',
          bookOverview: bookData.bookOverview || '',
          coverImageUrl: bookData.coverImageUrl || '',
          readingStatus: bookData.readingStatus || 'Want-to-Read'
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching book data for editing:', error);
        setError('Failed to load book data for editing.');
        setLoading(false);
        toast.error(error.response?.data?.message || 'Failed to load book data');
      }
    };

    fetchBookData();
  }, [id, currentUser, idToken, navigate]); // Add dependencies

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !idToken) {
      toast.error('Please login to update a book');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch(`https://server-api-three.vercel.app/api/books/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      toast.success('Book updated successfully!');
      navigate('/my-books'); // Navigate back to My Books after update
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error(error.response?.data?.message || 'Failed to update book');
      setLoading(false);
    }
  };

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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Book</h1>
      
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md space-y-6">
        {/* Book Title */}
        <div>
          <label htmlFor="bookTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Book Title *
          </label>
          <input
            type="text"
            id="bookTitle"
            name="bookTitle"
            value={formData.bookTitle}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter book title"
            required
          />
        </div>

        {/* Book Author */}
        <div>
          <label htmlFor="bookAuthor" className="block text-sm font-medium text-gray-700 mb-1">
            Book Author *
          </label>
          <input
            type="text"
            id="bookAuthor"
            name="bookAuthor"
            value={formData.bookAuthor}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter book author"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="bookCategory" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="bookCategory"
            name="bookCategory"
            value={formData.bookCategory}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Total Pages */}
        <div>
          <label htmlFor="totalPage" className="block text-sm font-medium text-gray-700 mb-1">
            Total Pages *
          </label>
          <input
            type="number"
            id="totalPage"
            name="totalPage"
            value={formData.totalPage}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter total number of pages"
            min="1"
            required
          />
        </div>

        {/* Book Overview */}
        <div>
          <label htmlFor="bookOverview" className="block text-sm font-medium text-gray-700 mb-1">
            Book Overview *
          </label>
          <textarea
            id="bookOverview"
            name="bookOverview"
            value={formData.bookOverview}
            onChange={handleInputChange}
            rows="4"
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter book overview"
            required
          />
        </div>

        {/* Cover Image URL */}
        <div>
          <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Cover Image URL *
          </label>
          <input
            type="url"
            id="coverImageUrl"
            name="coverImageUrl"
            value={formData.coverImageUrl}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter cover image URL (e.g., https://example.com/cover.jpg)"
            required
          />
          {formData.coverImageUrl && (
            <div className="mt-4">
              <img src={formData.coverImageUrl} alt="Cover preview" className="h-48 w-auto object-contain rounded mx-auto" />
            </div>
          )}
        </div>

        {/* Reading Status */}
        <div>
          <label htmlFor="readingStatus" className="block text-sm font-medium text-gray-700 mb-1">
            Reading Status
          </label>
          <select
            id="readingStatus"
            name="readingStatus"
            value={formData.readingStatus}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Want-to-Read">Want to Read</option>
            <option value="Reading">Reading</option>
            <option value="Read">Read</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Book'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditBook; 