import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';

const AddBook = () => {
  const navigate = useNavigate();
  const { currentUser, idToken } = useAuth();
  const [loading, setLoading] = useState(false);
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
      toast.error('Please login to add a book');
      return;
    }

    // Validate form data
    if (!formData.bookTitle.trim()) {
      toast.error('Book title is required');
      return;
    }
    if (!formData.bookAuthor.trim()) {
      toast.error('Author name is required');
      return;
    }
    if (!formData.bookCategory) {
      toast.error('Please select a category');
      return;
    }
    if (!formData.totalPage || formData.totalPage <= 0) {
      toast.error('Please enter a valid number of pages');
      return;
    }
    if (!formData.bookOverview.trim()) {
      toast.error('Book overview is required');
      return;
    }
    if (!formData.coverImageUrl.trim()) {
      toast.error('Please enter a cover image URL');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        bookTitle: formData.bookTitle,
        bookAuthor: formData.bookAuthor,
        bookCategory: formData.bookCategory,
        totalPage: parseInt(formData.totalPage, 10),
        bookOverview: formData.bookOverview,
        coverImage: formData.coverImageUrl,
        readingStatus: formData.readingStatus,
        userEmail: currentUser.email
      };

      const response = await axios.post(
        'http://localhost:5000/api/books',
        submitData,
        {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      );

      toast.success('Book added successfully!');
      navigate(`/book/${response.data._id}`);
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error(error.response?.data?.message || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-black">Add New Book</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Author */}
          <div>
            <label htmlFor="bookAuthor" className="block text-sm font-medium text-gray-700 mb-1">
              Author *
            </label>
            <input
              type="text"
              id="bookAuthor"
              name="bookAuthor"
              value={formData.bookAuthor}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter author name"
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

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Adding Book...
                </span>
              ) : (
                'Add Book'
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddBook; 