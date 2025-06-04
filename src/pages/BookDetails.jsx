import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaStar, FaBookmark, FaShare, FaHeart, FaRegBookmark, FaRegHeart, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import BookCard from '../components/BookCard';
import ReviewCard from '../components/ReviewCard';
import Rating from '../components/Rating';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, idToken } = useAuth();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReviewText, setNewReviewText] = useState('');
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [userRating, setUserRating] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [bookmarkedBooks, setBookmarkedBooks] = useState([]);
  const [showReviewInput, setShowReviewInput] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const bookResponse = await axios.get(`http://localhost:5000/api/books/${id}`);
        setBook(bookResponse.data);

        // Determine initial isUpvoted status (already implemented)
        setIsUpvoted(bookResponse.data.upvotedBy?.includes(currentUser?.email));

        const reviewsResponse = await axios.get(`http://localhost:5000/api/books/${id}/reviews`);
        setReviews(reviewsResponse.data);

        if (currentUser && idToken) {
          // Fetch user's bookmarks and likes to determine initial status
          try {
            const bookmarksResponse = await axios.get('http://localhost:5000/api/users/bookmarks', {
              headers: { Authorization: `Bearer ${idToken}` }
            });
            // Assuming the backend returns an array of bookmarked book objects directly
            const bookmarkedBooksData = bookmarksResponse.data || [];
            setIsBookmarked(bookmarkedBooksData.some(b => b._id === bookResponse.data._id));
          } catch (bookmarkError) {
            console.error('Error fetching user bookmarks for initial status:', bookmarkError);
            setIsBookmarked(false); // Assume not bookmarked on error
          }

          try {
            const likesResponse = await axios.get('http://localhost:5000/api/users/likes', {
              headers: { Authorization: `Bearer ${idToken}` }
            });
            // Assuming the backend returns an array of liked book objects directly
            const likedBooksData = likesResponse.data || [];
            setIsLiked(likedBooksData.some(b => b._id === bookResponse.data._id));
          } catch (likeError) {
            console.error('Error fetching user likes for initial status:', likeError);
            setIsLiked(false); // Assume not liked on error
          }
        }

        setIsLoading(false);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch book details');
        setLoading(false);
        setIsLoading(false);
        console.error(err);
      }
    };

    fetchBookDetails();
    // We don't need to fetchBookmarkedBooks separately here if fetchBookDetails does it
    // fetchBookmarkedBooks();

    // TODO: Fetch related books

  }, [id, currentUser, idToken]);

  const handleBookmarkToggle = async (book) => {
    if (!currentUser || !idToken) {
      navigate('/login');
      return;
    }

    const isCurrentlyBookmarked = isBookmarked;
    const method = isCurrentlyBookmarked ? 'delete' : 'post';
    const url = `http://localhost:5000/api/books/${book._id}/bookmark`;

    try {
      await axios({ method, url, headers: { Authorization: `Bearer ${idToken}` } });

      setIsBookmarked(!isCurrentlyBookmarked);
      showToast(isCurrentlyBookmarked ? 'Book removed from bookmarks' : 'Book added to bookmarks', 'success');

    } catch (error) {
      console.error('Error toggling bookmark:', error);
      showToast(error.response?.data?.message || 'Failed to update bookmark', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !idToken) {
      navigate('/login');
      return;
    }
    if (!newReviewText.trim()) {
      showToast('Review cannot be empty', 'error');
      return;
    }
    if (userRating === 0) {
       showToast('Please select a rating', 'error');
       return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/books/${id}/reviews`, {
        reviewText: newReviewText,
        rating: userRating
      }, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      setReviews([response.data.review, ...reviews]);
      setNewReviewText('');
      setUserRating(0);
      setShowReviewInput(false);
      setBook(prevBook => ({ 
        ...prevBook, 
        rating: response.data.averageRating, 
        totalReviews: response.data.totalReviews 
      }));
      toast.success('Review added successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add review');
      console.error(error);
    }
  };

  const handleUpvote = async () => {
    if (!currentUser || !idToken) {
      navigate('/login');
      return;
    }
    if (book.userEmail === currentUser.email) {
      showToast('Cannot upvote your own book', 'error');
      return;
    }
    if (isUpvoted) {
       showToast('Already upvoted', 'warning');
       return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/books/${id}/upvote`, {}, { // Use correct backend URL
        headers: {
          Authorization: `Bearer ${idToken}` // Use idToken for backend auth
        }
      });
      setBook(response.data.book); // Update book with new upvote count from response
      setIsUpvoted(true);
      toast.success(response.data.message || 'Book upvoted!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upvote');
      console.error(error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!currentUser || !idToken) {
       navigate('/login');
       return;
    }
    if (book.userEmail !== currentUser.email) {
      showToast('Not authorized to change status', 'error');
      return;
    }
    if (book.readingStatus === newStatus) {
      return; // No change needed
    }

    try {
      const response = await axios.patch(
        `http://localhost:5000/api/books/${id}`,
        { readingStatus: newStatus },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      setBook({ ...book, readingStatus: newStatus }); // Update local state
      toast.success(response.data.message || 'Reading status updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
      console.error(error);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleLike = async () => {
    if (!currentUser || !idToken) {
      showToast('Please login to like books', 'error');
      return;
    }

    if (book.userEmail === currentUser?.email) {
        showToast('Cannot like your own book', 'error');
        return;
    }

    const isCurrentlyLiked = isLiked;
    const method = isCurrentlyLiked ? 'delete' : 'post';
    const url = `http://localhost:5000/api/books/${book._id}/like`;

    try {
      const response = await axios({ method, url, headers: { Authorization: `Bearer ${idToken}` } });

      setIsLiked(!isCurrentlyLiked);
      showToast(isCurrentlyLiked ? 'Book unliked' : 'Book liked', 'success');

      // Update the local book state with the new like count from the backend response
      if (response.data && response.data.book && response.data.book.likes !== undefined) {
         setBook(prevBook => ({ ...prevBook, likes: response.data.book.likes }));
      } else if (response.data && response.data.likes !== undefined) { // Fallback if backend structure is different
         setBook(prevBook => ({ ...prevBook, likes: response.data.likes }));
      }

    } catch (error) {
      console.error('Error updating like:', error);
      showToast(error.response?.data?.message || 'Error updating like', 'error');
    }
  };

  // Handle liking a review
  const handleLikeReview = async (reviewId, isLiking) => {
    if (!currentUser || !idToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios({
        method: 'post',
        url: `http://localhost:5000/api/reviews/${reviewId}/like`,
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });

      // Update the specific review in the reviews state with the new like count and user's like status
      setReviews(reviews.map(review =>
        review._id === reviewId ? { 
          ...review, 
          likes: response.data.likes,
          userLiked: response.data.userLiked,
          // If user liked, remove any existing dislike
          dislikes: response.data.userLiked ? Math.max(0, review.dislikes - 1) : review.dislikes,
          userDisliked: response.data.userLiked ? false : review.userDisliked
        } : review
      ));

      showToast(response.data.message, 'success');

    } catch (error) {
      console.error('Error updating review like status:', error);
      showToast(error.response?.data?.message || 'Failed to update like status', 'error');
    }
  };

  // Handle disliking a review
  const handleDislikeReview = async (reviewId, isDisliking) => {
    if (!currentUser || !idToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios({
        method: 'post',
        url: `http://localhost:5000/api/reviews/${reviewId}/dislike`,
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });

      // Update the specific review in the reviews state with the new dislike count and user's dislike status
      setReviews(reviews.map(review =>
        review._id === reviewId ? { 
          ...review, 
          dislikes: response.data.dislikes,
          userDisliked: response.data.userDisliked,
          // If user disliked, remove any existing like
          likes: response.data.userDisliked ? Math.max(0, review.likes - 1) : review.likes,
          userLiked: response.data.userDisliked ? false : review.userLiked
        } : review
      ));

      showToast(response.data.message, 'success');

    } catch (error) {
      console.error('Error updating review dislike status:', error);
      showToast(error.response?.data?.message || 'Failed to update dislike status', 'error');
    }
  };

  // Fetch review like/dislike status when reviews are loaded
  useEffect(() => {
    const fetchReviewStatuses = async () => {
      if (!currentUser || !idToken || !reviews.length) return;

      try {
        const statusPromises = reviews.map(review =>
          axios.get(`http://localhost:5000/api/reviews/${review._id}/status`, {
            headers: { Authorization: `Bearer ${idToken}` }
          })
        );

        const statuses = await Promise.all(statusPromises);

        // Update reviews with user's like/dislike status
        setReviews(reviews.map((review, index) => ({
          ...review,
          userLiked: statuses[index].data.userLiked,
          userDisliked: statuses[index].data.userDisliked
        })));

      } catch (error) {
        console.error('Error fetching review statuses:', error);
      }
    };

    fetchReviewStatuses();
  }, [currentUser, idToken, reviews.length]);

  const handleShare = async (platform) => {
    // TODO: Implement social sharing - If backend tracking is needed, add an API call here
    showToast(`Sharing to ${platform}...`);
    setIsShareModalOpen(false);
  };

  if (loading) {
    return <div className="text-center mt-8">Loading book details...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  if (!book) {
    return <div className="text-center mt-8">Book not found.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex flex-col md:flex-row gap-10 bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="md:w-1/3 flex justify-center items-start">
          <div className="relative w-full max-w-xs">
             <img 
                src={book.coverImage || 'https://via.placeholder.com/300x450?text=No+Cover'}
                alt={book.bookTitle}
                className="w-full h-auto object-cover rounded-lg shadow-xl border border-gray-200"
             />
             {/* Optional: Add a subtle overlay or badge on the cover */}
          </div>
        </div>
        <div className="md:w-2/3 flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">{book.bookTitle}</h1>
          <p className="text-xl text-gray-700 mb-4">by <span className="font-semibold">{book.bookAuthor}</span></p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 text-gray-600 text-sm font-medium">
             <span className="flex items-center"><FaStar className="text-yellow-400 mr-1" /> {book.rating?.toFixed(1) || 'N/A'} ({book.totalReviews || 0} reviews)</span>
             <span>Category: <span className="font-semibold">{book.bookCategory}</span></span>
             <span>Pages: <span className="font-semibold">{book.totalPage}</span></span>
             <span>Upvotes: <span className="font-semibold text-green-700">{book.upvote || 0}</span></span>
             <span>Likes: <span className="font-semibold text-red-500">{book.likes || 0}</span></span>
          </div>

           {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpvote}
              disabled={isUpvoted || book.userEmail === currentUser?.email}
              className={`flex items-center px-6 py-2 rounded-full transition-colors duration-200 ${isUpvoted || book.userEmail === currentUser?.email ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'} font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
            >
               {isUpvoted ? <FaHeart className="mr-2"/> : <FaRegHeart className="mr-2"/>} {isUpvoted ? 'Upvoted' : 'Upvote'}
            </motion.button>

            {currentUser && (
                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => handleBookmarkToggle(book)}
                   className={`flex items-center px-6 py-2 rounded-full transition-colors duration-200 ${isBookmarked ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50`}
                 >
                   {isBookmarked ? <FaBookmark className="mr-2"/> : <FaRegBookmark className="mr-2"/>} {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                 </motion.button>
            )}

             {currentUser && (
                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={handleLike}
                   className={`flex items-center px-6 py-2 rounded-full transition-colors duration-200 ${isLiked ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50`}
                 >
                   {isLiked ? <FaHeart className="mr-2"/> : <FaRegHeart className="mr-2"/>} {isLiked ? 'Liked' : 'Like'}
                 </motion.button>
             )}

             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setIsShareModalOpen(true)}
               className="flex items-center px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
             >
                <FaShare className="mr-2"/> Share
             </motion.button>

          </div>

           {/* Reading Status Tracker (Conditional rendering for owner) */}
            {currentUser && book.userEmail === currentUser.email && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Update Reading Status:</h4>
                <div className="flex flex-wrap items-center gap-3">

                <button
                     onClick={() => handleStatusChange('Reading')}
                     className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${book.readingStatus === 'Reading' ? 'bg-blue-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}`}
                     disabled={book.readingStatus === 'Reading'}
                   >
                     Reading
                   </button>

                   <button
                     onClick={() => handleStatusChange('Completed')}
                     className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${book.readingStatus === 'Completed' ? 'bg-green-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}`}
                     disabled={book.readingStatus === 'Completed'}
                   >
                     Completed
                   </button>

                   <button
                     onClick={() => handleStatusChange('Want-to-Read')}
                     className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${book.readingStatus === 'Want-to-Read' ? 'bg-purple-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}`}
                     disabled={book.readingStatus === 'Want-to-Read'}
                   >
                     Want to Read
                   </button>

                 {book.readingStatus && (
                   <button
                     onClick={() => handleStatusChange('')}
                     className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                   >
                     Remove Status
                   </button>
                )}
              </div>
            </div>
            )}

        </div>
      </div>

      {/* Overview Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
         <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
         <p className="text-gray-700 leading-relaxed">{book.bookOverview}</p>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
         <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>

          {/* Write a Review Button (or hide if form is open) */}
          {currentUser === null && (
             <div className="mb-6 pb-4 border-b border-gray-200">
                 <button
                    onClick={() => navigate('/login')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline transition-colors duration-200"
                  >
                    Write a Review
                  </button>
             </div>
          )}

          {/* Write a Review Button (show if logged in and form is closed) */}
          {currentUser && !showReviewInput && (
             <div className="mb-6 pb-4 border-b border-gray-200">
                 <button
                    onClick={() => setShowReviewInput(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline transition-colors duration-200"
                  >
                    Write a Review
                  </button>
             </div>
          )}

          {/* Inline Review Input Form */}
          {currentUser && showReviewInput && (
              <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 pb-6 border-b border-gray-200"
              >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Write Your Review</h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                          <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Your Rating</label>
                          <Rating value={userRating} onChange={setUserRating} size="lg" />
                      </div>
                      <div>
                          <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700">Your Review</label>
                          <textarea
                              id="reviewText"
                              rows="4"
                              className="mt-1 block w-full text-black p-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              value={newReviewText}
                              onChange={(e) => setNewReviewText(e.target.value)}
                              placeholder="Share your thoughts on this book..."
                              required
                          ></textarea>
                      </div>
                      <div className="flex justify-end space-x-3">
                          <button
                              type="button"
                              onClick={() => setShowReviewInput(false)}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                          >
                              Cancel
                          </button>
                          <button
                              type="submit"
                              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                          >
                              Submit Review
                          </button>
                      </div>
                  </form>
              </motion.div>
          )}

         {/* Display Reviews */}
         {reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet. Be the first to write one!</p>
         ) : (
            <div className="space-y-6">
               {reviews.map(review => (
                  <ReviewCard 
                     key={review._id} 
                     review={review} 
                     onLike={handleLikeReview}
                     onDislike={handleDislikeReview}
                     currentUser={currentUser}
                  />
               ))}
            </div>
         )}
      </div>

      {/* Similar Books */}
      {/* Ensure book.similarBooks exists and is an array before mapping */}
      {book.similarBooks && book.similarBooks.length > 0 && (
           <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
             <h2 className="text-2xl font-bold text-gray-900 mb-4">Similar Books</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
               {book.similarBooks.map((relatedBook) => (
                 <BookCard key={relatedBook._id || relatedBook.id} book={relatedBook} onClick={() => navigate(`/book/${relatedBook._id || relatedBook.id}`)} />
               ))}
             </div>
           </div>
      )}

      {/* Share Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share This Book"
      >
        {/* Add sharing options here */}
        <div className="space-y-4">
           <p>Choose a platform to share:</p>
           <div className="flex gap-4">
             <motion.button
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               onClick={() => handleShare('Facebook')}
               className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md"
             >
                <FaFacebook className="mr-2"/> Facebook
             </motion.button>
              <motion.button
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               onClick={() => handleShare('Twitter')}
               className="flex items-center px-4 py-2 bg-blue-400 text-white rounded-md"
             >
                <FaTwitter className="mr-2"/> Twitter
             </motion.button>
              <motion.button
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               onClick={() => handleShare('LinkedIn')}
               className="flex items-center px-4 py-2 bg-blue-700 text-white rounded-md"
             >
                <FaLinkedin className="mr-2"/> LinkedIn
             </motion.button>
              <motion.button
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               onClick={() => handleShare('Email')}
               className="flex items-center px-4 py-2 bg-gray-400 text-gray-800 rounded-md"
             >
                Share via Email
             </motion.button>
           </div>
        </div>
      </Modal>

      {/* Custom Toast Container - Ensure this is only rendered once in your app, e.g., in Layout.jsx or App.jsx */}
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

export default BookDetails; 