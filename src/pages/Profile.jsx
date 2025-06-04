import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaEdit, FaSpinner, FaBook, FaBookmark, FaHeart, FaChartBar } from 'react-icons/fa';
import BookCard from '../components/BookCard';

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, idToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    photoURL: '',
    bio: ''
  });
  const [stats, setStats] = useState({
    totalBooks: 0,
    booksRead: 0,
    currentlyReading: 0,
    wantToRead: 0,
    totalReviews: 0,
    totalUpvotes: 0
  });
  const [bookmarks, setBookmarks] = useState([]);
  const [likes, setLikes] = useState([]);
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'bookmarks', 'likes'
  const [bookmarkedBooks, setBookmarkedBooks] = useState([]); // State to track bookmarked books locally

  useEffect(() => {
    if (!currentUser || !idToken) {
      navigate('/login');
      return;
    }

    // Initialize profile data from currentUser
    setProfileData({
      displayName: currentUser.displayName || '',
      photoURL: currentUser.photoURL || '',
      bio: currentUser.bio || ''
    });

    fetchUserData();
    fetchBookmarkedBooks(); // Fetch bookmarks on mount or auth change
  }, [currentUser, idToken, navigate]);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null); // Clear previous errors

    const headers = {
      Authorization: `Bearer ${idToken}`
    };

    try {
      // Fetch user statistics
      const statsResponse = await axios.get('http://localhost:5000/api/users/stats', { headers });
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Optionally set a specific error for stats, but don't block the whole page
      // setError('Failed to fetch user statistics');
       toast.error('Failed to fetch user statistics'); // Use toast for non-blocking error
    }

    try {
      // Fetch user profile data
      const profileResponse = await axios.get('http://localhost:5000/api/users/profile', { headers });
      // The backend returns an object with user, bookStats, and engagementStats.
      // The user details are directly under the 'user' property.
      setProfileData(profileResponse.data.user); // Set profileData to the user object
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to fetch user profile');
      // You might want to handle this error more gracefully, e.g., show a default profile
    }

    try {
      // Fetch bookmarks
      const bookmarksResponse = await axios.get('http://localhost:5000/api/users/bookmarks', { headers });
      setBookmarks(bookmarksResponse.data);
      setBookmarkedBooks(bookmarksResponse.data); // Also update local bookmarkedBooks state
    } catch (error) {
      console.error('Error fetching user bookmarks:', error);
      // If bookmarks endpoint is not found (404), just set bookmarks to an empty array
      if (error.response && error.response.status === 404) {
        console.warn('Bookmarks endpoint not found, setting bookmarks to empty array.');
        setBookmarks([]); // Set to empty array on 404
        setBookmarkedBooks([]);
        toast.warn('Bookmarks feature not available yet.'); // Inform the user
      } else {
         // Handle other potential errors for bookmarks fetch
         toast.error('Failed to fetch user bookmarks'); // Use toast for non-blocking error
        setBookmarks([]); // Set to empty array on other errors as well
        setBookmarkedBooks([]);
      }
    }

    try {
      // Fetch likes
      const likesResponse = await axios.get('http://localhost:5000/api/users/likes', { headers });
      setLikes(likesResponse.data);
    } catch (error) {
      console.error('Error fetching user likes:', error);
       toast.error('Failed to fetch user likes'); // Use toast for non-blocking error
       // Optionally set a specific error for likes, but don't block the whole page
       // setLikes([]); // Set to empty array on error
    }

    // Set loading to false after all independent fetches are attempted
    setLoading(false);
  };

  // Fetch bookmarked books specifically for toggling state
  const fetchBookmarkedBooks = async () => {
    if (!currentUser || !idToken) {
      setBookmarkedBooks([]);
      return;
    }
    try {
      const response = await axios.get('http://localhost:5000/api/users/bookmarks', { // Use correct backend URL
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setBookmarkedBooks(response.data); // Assuming backend returns array of book objects
    } catch (error) {
      console.error('Error fetching bookmarked books for toggle state:', error);
      // Optionally show a toast or handle the error
    }
  };

  // Handle adding or removing a bookmark
  const handleBookmarkToggle = async (book) => {
    if (!currentUser || !idToken) {
      toast.error('Please login to bookmark books');
      return;
    }

    const isCurrentlyBookmarked = (bookmarkedBooks || []).some(b => b._id === book._id);
    const method = isCurrentlyBookmarked ? 'delete' : 'post';
    const url = `http://localhost:5000/api/books/${book._id}/bookmark`;

    try {
      await axios({ method, url, headers: { Authorization: `Bearer ${idToken}` } });

      // Update local state based on the action performed
      if (isCurrentlyBookmarked) {
        // Remove from both bookmarkedBooks and bookmarks states
        setBookmarkedBooks((bookmarkedBooks || []).filter(b => b._id !== book._id));
        setBookmarks(bookmarks.filter(b => b._id !== book._id)); // Remove from the list state
        toast.success('Book removed from bookmarks');
      } else {
        // Add to bookmarkedBooks state (adding to bookmarks list is not needed here
        // as new bookmarks from other pages won't appear instantly without a fetch)
        setBookmarkedBooks([...(bookmarkedBooks || []), book]);
        toast.success('Book added to bookmarks');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error(error.response?.data?.message || 'Failed to update bookmark');
    }
  };

  // Handle adding or removing a like
  const handleLike = async (book) => { // Add book parameter to access its _id
    if (!currentUser || !idToken) {
      toast.error('Please login to like books');
      return;
    }

    // Check if the book is currently liked (assuming 'likes' state holds liked books)
    const isCurrentlyLiked = (likes || []).some(b => b._id === book._id);
    const method = isCurrentlyLiked ? 'delete' : 'post';
    const url = `http://localhost:5000/api/books/${book._id}/like`; // Use book._id

    try {
      await axios({ method, url, headers: { Authorization: `Bearer ${idToken}` } });

      // Update local state based on the action performed
      if (isCurrentlyLiked) {
        // Remove from both likes state and potentially update the isLiked prop if used elsewhere
        setLikes((likes || []).filter(b => b._id !== book._id)); // Remove from the list state
        // If you have an isLiked state for individual books or in a list, update it here
        toast.success('Book unliked');
      } else {
        // Add the book to the likes state if successfully liked
        // Note: Adding the full book object here might be needed if you display details from the likes list
        // For simplicity and consistency with bookmarks, we'll add the book object.
        setLikes([...(likes || []), book]);
        toast.success('Book liked');
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error(error.response?.data?.message || 'Failed to update like', 'error');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch(
        'http://localhost:5000/api/users/profile',
        profileData,
        {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      );
      toast.success('Profile updated successfully');
      setIsEditing(false);
      // Update local state with new profile data
      setProfileData(response.data);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
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
      {/* Profile Header or Edit Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {profileData && (
          <>
            {!isEditing ? (
              // Display Profile Info
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Profile Picture */}
                <div className="relative">
                  <img
                    src={profileData.profilePhoto ? profileData.profilePhoto : 'https://via.placeholder.com/150'}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                  <button
                    onClick={() => setIsEditing(true)} // Toggle to editing mode
                    className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    title="Edit Profile"
                  >
                    <FaEdit />
                  </button>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2 text-black">{profileData.name}</h1>
                  <p className="text-gray-600 mb-4">{profileData.bio || 'No bio yet'}</p>
                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{stats.totalBooks}</p>
                      <p className="text-sm text-gray-600">Total Books</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{stats.booksRead}</p>
                      <p className="text-sm text-gray-600">Books Read</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{stats.totalReviews}</p>
                      <p className="text-sm text-gray-600">Reviews</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{stats.totalUpvotes}</p>
                      <p className="text-sm text-gray-600">Upvotes Received</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Profile Form
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                    Display Name:
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="photoURL" className="block text-sm font-medium text-gray-700">
                    Profile Picture URL:
                  </label>
                  <input
                    type="url"
                    id="photoURL"
                    name="photoURL"
                    value={profileData.profilePhoto}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="https://example.com/profile.jpg"
                  />
                  {profileData.profilePhoto && (
                    <div className="mt-2">
                      <img src={profileData.profilePhoto} alt="Profile Preview" className="w-20 h-20 rounded-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio:
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    rows="3"
                    className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)} // Cancel button
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaChartBar className="inline-block mr-2" />
            Reading Statistics
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bookmarks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaBookmark className="inline-block mr-2" />
            Bookmarks
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'likes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaHeart className="inline-block mr-2" />
            Liked Books
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Reading Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Currently Reading</span>
                    <span className="text-sm font-medium">{stats.currentlyReading}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(stats.currentlyReading / stats.totalBooks) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Books Read</span>
                    <span className="text-sm font-medium">{stats.booksRead}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(stats.booksRead / stats.totalBooks) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Want to Read</span>
                    <span className="text-sm font-medium">{stats.wantToRead}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${(stats.wantToRead / stats.totalBooks) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Reading Goals</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Books Read This Year</span>
                  <span className="text-sm font-medium">{stats.booksRead}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reviews Written</span>
                  <span className="text-sm font-medium">{stats.totalReviews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Upvotes Received</span>
                  <span className="text-sm font-medium">{stats.totalUpvotes}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bookmarks.length === 0 ? (
              <p className="text-gray-500 col-span-full text-center">No bookmarked books yet</p>
            ) : (
              bookmarks.map(book => (
                <BookCard 
                  key={book._id} 
                  book={book} 
                  onBookmarkToggle={handleBookmarkToggle} 
                  isBookmarked={(bookmarkedBooks || []).some(b => b._id === book._id)} 
                  currentUser={currentUser} 
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'likes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {likes.length === 0 ? (
              <p className="text-gray-500 col-span-full text-center">No liked books yet</p>
            ) : (
              likes.map(book => (
                <BookCard 
                  key={book._id} 
                  book={book} 
                  onBookmarkToggle={handleBookmarkToggle} 
                  isBookmarked={(bookmarkedBooks || []).some(b => b._id === book._id)} 
                  onLikeToggle={() => handleLike(book)}
                  isLiked={(likes || []).some(b => b._id === book._id)}
                  currentUser={currentUser}
                />
              ))
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Profile; 