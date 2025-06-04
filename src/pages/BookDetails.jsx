import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaStar, FaBookmark, FaShare,FaFacebook,FaTwitter,FaLinkedin, FaRegBookmark, FaArrowUp } from 'react-icons/fa';
import BookCard from '../components/BookCard';
import ReviewCard from '../components/ReviewCard';
import Rating from '../components/Rating';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, idToken } = useAuth();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReviewText, setNewReviewText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [showReviewInput, setShowReviewInput] = useState(false);
  const [bookmarkedBooks, setBookmarkedBooks] = useState([]);

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const bookResponse = await axios.get(`http://localhost:5000/api/books/${id}`);
        setBook(bookResponse.data);

        setAverageRating(bookResponse.data.rating || 0);
        setTotalReviews(bookResponse.data.totalReviews || 0);

        const reviewsResponse = await axios.get(`http://localhost:5000/api/books/${id}/reviews`);
        setReviews(reviewsResponse.data);

        if (currentUser && idToken) {
          try {
            const bookmarksResponse = await axios.get('http://localhost:5000/api/users/bookmarks', {
              headers: { Authorization: `Bearer ${idToken}` }
            });
            const bookmarkedBooksData = bookmarksResponse.data || [];
            setIsBookmarked(bookmarkedBooksData.some(b => b._id === bookResponse.data._id));
            setBookmarkedBooks(bookmarkedBooksData);
          } catch (bookmarkError) {
            console.error('Error fetching user bookmarks for initial status:', bookmarkError);
            setIsBookmarked(false);
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

    // TODO: Fetch related books

  }, [id, currentUser, idToken]);

  // Function to handle review editing
  const handleEditReview = async (reviewId, updatedReviewData) => {
    if (!currentUser || !idToken) {
      toast.error('Please login to edit reviews');
      navigate('/login');
      return;
    }
    try {
      const response = await axios.patch(`http://localhost:5000/api/reviews/${reviewId}`, updatedReviewData, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      // Update the reviews state with the edited review
      setReviews(reviews.map(review =>
        review._id === reviewId ? { ...review, ...response.data.review } : review
      ));

      // Update average rating and total reviews if they changed from the backend response
      if(response.data.averageRating !== undefined) setAverageRating(response.data.averageRating);
      if(response.data.totalReviews !== undefined) setTotalReviews(response.data.totalReviews);

      toast.success(response.data.message || 'Review updated successfully!');

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update review');
      console.error(error);
    }
  };

  // Function to handle review deletion
  const handleDeleteReview = async (reviewId) => {
    if (!currentUser || !idToken) {
      toast.error('Please login to delete reviews');
      navigate('/login');
      return;
    }

    // Replace window.confirm with react-hot-toast confirmation
    toast((t) => (
      <div className="bg-white p-4 rounded-md shadow-lg">
        <p className="text-gray-800 mb-3">Are you sure you want to delete this review?</p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const response = await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
                  headers: { Authorization: `Bearer ${idToken}` }
                });

                // Remove the deleted review from state
                setReviews(reviews.filter(review => review._id !== reviewId));

                 // Update average rating and total reviews if they changed from the backend response
                if(response.data.averageRating !== undefined) setAverageRating(response.data.averageRating);
                if(response.data.totalReviews !== undefined) setTotalReviews(response.data.totalReviews);

                toast.success(response.data.message || 'Review deleted successfully!');

              } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete review');
                console.error(error);
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      duration: Infinity, // Keep the toast open until dismissed manually
      id: `delete-review-${reviewId}`, // Unique ID for each confirmation toast
    });
  };

  const handleBookmarkToggle = async () => {
    if (!currentUser || !idToken || !book) {
      navigate('/login');
      return;
    }

    const isCurrentlyBookmarked = isBookmarked;
    const method = isCurrentlyBookmarked ? 'delete' : 'post';
    const url = `http://localhost:5000/api/books/${book._id}/bookmark`;

    try {
      await axios({ method, url, headers: { Authorization: `Bearer ${idToken}` } });

      setIsBookmarked(!isCurrentlyBookmarked);
      toast.success(isCurrentlyBookmarked ? 'Book removed from bookmarks' : 'Book added to bookmarks');

    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error(error.response?.data?.message || 'Failed to update bookmark');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !idToken || !book) {
      navigate('/login');
      return;
    }
    if (!newReviewText.trim()) {
      toast.error('Review cannot be empty');
      return;
    }
    if (userRating === null) {
       toast.error('Please select a rating');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/books/${id}/reviews`, {
        reviewText: newReviewText,
        rating: userRating
      }, { headers: { Authorization: `Bearer ${idToken}` } });

      setReviews([response.data.review, ...reviews]);
      setNewReviewText('');
      setUserRating(null);
      setShowReviewInput(false);

      if(response.data.averageRating !== undefined) setAverageRating(response.data.averageRating);
      if(response.data.totalReviews !== undefined) setTotalReviews(response.data.totalReviews);

      toast.success('Review added successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add review');
      console.error(error);
    }
  };

  const handleUpvoteClick = async () => {
    if (!currentUser || !idToken || !book) {
      navigate('/login');
      return;
    }

    if (book.userEmail === currentUser.email) {
        toast.error("You can't upvote your own book!");
        return;
    }

    const url = `http://localhost:5000/api/books/${book._id}/upvote`;

    try {
      const response = await axios.post(url, {}, { headers: { Authorization: `Bearer ${idToken}` } });

      if(response.data.book?.upvote !== undefined) {
         setBook(prevBook => ({ ...prevBook, upvote: response.data.book.upvote }));
      }

      toast.success('Book upvoted successfully!');

    } catch (error) {
      console.error('Error upvoting book:', error);
      if (error.response?.data?.message === "You can't upvote your own book") {
        toast.error("You can't upvote your own book!");
      } else {
        toast.error(error.response?.data?.message || 'Failed to upvote book');
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!currentUser || !idToken || !book) {
       navigate('/login');
       return;
    }
    if (book.userEmail !== currentUser.email) {
      toast.error('Not authorized to change status');
      return;
    }
    if (book.readingStatus === newStatus) {
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:5000/api/books/${id}`,
        { readingStatus: newStatus },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setBook({ ...book, readingStatus: newStatus });
      toast.success(response.data.message || 'Reading status updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
      console.error(error);
    }
  };

  const handleShare = async (platform) => {
    toast.info(`Sharing to ${platform}...`);
    setIsShareModalOpen(false);
  };

  const handleDeleteBook = async () => {
    if (!currentUser || !idToken || !book) return;
    if (book.userEmail !== currentUser.email) {
      toast.error('Not authorized to delete this book');
      return;
    }

    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await axios.delete(`http://localhost:5000/api/books/${book._id}`, {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        toast.success('Book deleted successfully!');
        navigate('/my-books');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete book');
        console.error(error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-8">{error}</div>
    );
  }

  if (!book) {
    return (
      <div className="text-center text-gray-500 mt-8">Book not found.</div>
    );
  }

  const isOwner = currentUser?.email === book.userEmail;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 bg-white rounded-lg shadow-xl p-8 mb-8 border border-gray-200">
        <div className="md:col-span-1 flex justify-center items-start">
          <div className="relative w-full max-w-xs">
             <img
                src={book.coverImage || 'https://via.placeholder.com/300x450?text=No+Cover'}
                alt={book.bookTitle}
                className="w-full h-auto object-cover rounded-lg shadow-2xl border border-gray-300 transition-transform duration-300 hover:scale-105"
             />
          </div>
        </div>
        <div className="md:col-span-2 flex flex-col justify-center">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">{book.bookTitle}</h1>
          <p className="text-xl lg:text-2xl text-gray-700 font-medium mb-4">by <span className="font-semibold text-gray-800">{book.bookAuthor}</span></p>

          {book.bookCategory && (
          <div>
            <span className="text-sm font-semibold inline-block py-1.5 px-4 uppercase rounded-full text-blue-800 bg-blue-100 last:mr-0 mr-2 mb-4 shadow-sm">
              {book.bookCategory}
            </span>
          </div>
          )}

          {(averageRating > 0 || totalReviews > 0) && (
             <div className="flex items-center space-x-2 mt-2 mb-4">
               <FaStar className="text-yellow-500 text-xl" />
               <span className="text-gray-800 text-lg font-semibold">{averageRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'})</span>
             </div>
          )}

          <p className="text-gray-600 leading-relaxed mt-4 mb-6">{book.bookOverview || 'No overview available.'}</p>

          <div className="flex flex-wrap items-center gap-4 mt-6">
             {/* Upvote Section */}
             <motion.button
               whileHover={{ scale: isOwner ? 1 : 1.05 }}
               whileTap={{ scale: isOwner ? 1 : 0.95 }}
               onClick={currentUser ? handleUpvoteClick : () => navigate('/login')}
               disabled={isOwner && currentUser !== null} // Disable only for owner when logged in
               className={`inline-flex items-center px-6 py-3 border rounded-full text-base font-medium transition-colors duration-200 shadow-md ${ // Combined class for both states
                 (isOwner && currentUser !== null) // If owner and logged in, disable style
                   ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                   : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50'
               }`}
               aria-label={isOwner ? 'Cannot upvote your own book' : 'Upvote book'}
             >
               <FaArrowUp className="mr-2 h-5 w-5" />
               Upvote ({book.upvote !== undefined ? book.upvote : 0})
             </motion.button>

            {currentUser && (
                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => handleBookmarkToggle(book)}
                   className={`inline-flex items-center px-6 py-3 border rounded-full text-base font-medium transition-colors duration-200 shadow-md ${
                     isBookmarked ? 'bg-yellow-500 hover:bg-yellow-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50'
                   }`}
                   aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                 >
                   {isBookmarked ? <FaBookmark className="mr-2"/> : <FaRegBookmark className="mr-2"/>} {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                 </motion.button>
            )}

             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setIsShareModalOpen(true)}
               className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-full text-gray-700 bg-white text-base font-medium hover:bg-gray-100 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
             >
                <FaShare className="mr-2"/> Share
             </motion.button>

             {currentUser && isOwner && (
                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={handleDeleteBook}
                   className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full text-base font-medium transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                 >
                   Delete Book
                 </motion.button>
             )}

          </div>

          {/* Uploader Info */}
          {book.userName && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Uploaded by</h4>
              <p className="text-gray-600">Name: {book.userName}</p>
              {book.userEmail && (
                <p className="text-gray-600">Email: {book.userEmail}</p>
              )}
            </div>
          )}

          {/* Show reading status section for all books */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-inner">
            {currentUser && book.userEmail === currentUser.email ? (
              // For user's own books, show update options
              <>
                <h4 className="font-semibold text-gray-800 mb-3">Update Reading Status:</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleStatusChange('Reading')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                      book.readingStatus === 'Reading' ? 'bg-blue-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                    }`}
                    disabled={book.readingStatus === 'Reading'}
                  >
                    Reading
                  </button>

                  <button
                    onClick={() => handleStatusChange('Completed')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 ${
                      book.readingStatus === 'Completed' ? 'bg-green-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                    }`}
                    disabled={book.readingStatus === 'Completed'}
                  >
                    Completed
                  </button>

                  <button
                    onClick={() => handleStatusChange('Want-to-Read')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${
                      book.readingStatus === 'Want-to-Read' ? 'bg-purple-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                    }`}
                    disabled={book.readingStatus === 'Want-to-Read'}
                  >
                    Want to Read
                  </button>

                  {book.readingStatus && (
                    <button
                      onClick={() => handleStatusChange('')}
                      className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                      Remove Status
                    </button>
                  )}
                </div>
              </>
            ) : (
              // For other users' books, just show the status if it exists
              <>
               <div className='flex items-center text-center gap-3'>
                <h4 className="font-semibold text-gray-800">Reading Status:</h4>
                {book.readingStatus ? (
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    book.readingStatus === 'Reading' ? 'bg-blue-600 text-white' :
                    book.readingStatus === 'Completed' ? 'bg-green-600 text-white' :
                    'bg-purple-600 text-white'
                  }`}>
                    {book.readingStatus}
                  </span>
                ) : (
                  <span className="text-gray-500 text-sm">No reading status set</span>
                )}
               </div>
              </>
            )}
          </div>

        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
         <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>

          {currentUser === null && (
             <div className="mb-6 pb-4 border-b border-gray-200">
                   <button
                    onClick={() => navigate('/login')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline transition-colors duration-200"
                   >
                    Login to Write a Review
                   </button>
             </div>
          )}

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
                          <Rating value={userRating} onChange={(rating) => setUserRating(rating)} size="lg" />
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

         {reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet. Be the first to write one!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map(review => (
                  <ReviewCard
                     key={review._id}
                     review={review}
                     currentUser={currentUser}
                     onLikeToggle={/* pass your like toggle handler */ null} // Pass your actual like/dislike handlers if needed
                     onDislikeToggle={/* pass your dislike toggle handler */ null} // Pass your actual like/dislike handlers if needed
                     onEdit={handleEditReview}
                     onDelete={handleDeleteReview}
                  />
              ))}
            </div>
          )}
      </div>

      {book.similarBooks && book.similarBooks.length > 0 && (
           <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
             <h2 className="text-2xl font-bold text-gray-900 mb-4">Similar Books</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
               {book.similarBooks.map((relatedBook) => {
                  // Prioritize the book's own readingStatus if available
                  const readingStatus = relatedBook.readingStatus || (bookmarkedBooks.find(b => b._id === relatedBook._id)?.readingStatus || '');

                  return (
                    <BookCard
                       key={relatedBook._id || relatedBook.id}
                       book={relatedBook}
                       onClick={() => navigate(`/book/${relatedBook._id || relatedBook.id}`)}
                       onBookmarkToggle={handleBookmarkToggle}
                       isBookmarked={(bookmarkedBooks || []).some(b => b._id === relatedBook._id)}
                       onUpvoteClick={handleUpvoteClick}
                       currentUser={currentUser}
                       readingStatus={readingStatus}
                    />
                  );
               })}
             </div>
           </div>
      )}

      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share This Book"
      >
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

    </motion.div>
  );
};

export default BookDetails; 