import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaBookmark, FaArrowUp, FaRegBookmark } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const BookCard = ({ book, onClick, onBookmarkToggle, isBookmarked, onUpvoteClick, currentUser, readingStatus }) => {
  const bookTitle = book.bookTitle || 'Unknown Title';
  const bookAuthor = book.bookAuthor || 'Unknown Author';
  const bookCoverUrl = book.coverImage || book.bookCover || 'https://via.placeholder.com/300x450?text=No+Cover';
  const averageRating = book.rating !== undefined ? book.rating : 0;
  const totalReviews = book.totalReviews !== undefined ? book.totalReviews : 0;
  const upvoteCount = book.upvote !== undefined ? book.upvote : 0;
  const userEmail = currentUser?.email;

  const isOwner = userEmail === book.userEmail;

  // Helper function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Reading':
        return 'bg-blue-500';
      case 'Completed':
        return 'bg-green-500';
      case 'Want-to-Read':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100"
      onClick={() => onClick(book._id)}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={bookCoverUrl}
          alt={`Cover of ${bookTitle}`}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Display Reading Status Badge */}
        {readingStatus && readingStatus !== '' && (
           <div className="absolute top-3 left-3 z-10">
             <span className={`px-3 py-1 text-xs font-bold text-white rounded-full shadow-md ${getStatusColor(readingStatus)}`}>
               {readingStatus.replace('-', ' ')}
             </span>
           </div>
        )}

        {currentUser && onBookmarkToggle && (
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle(book);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-500 hover:text-blue-600 transition-colors focus:outline-none shadow-md"
            aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
          >
            {isBookmarked ? <FaBookmark className="text-blue-600" size={20} /> : <FaRegBookmark size={20} />}
          </motion.button>
        )}

        {book.bookCategory && (
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-full shadow-sm">
              {book.bookCategory}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 space-y-3 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-900 line-clamp-2 text-lg group-hover:text-blue-600 transition-colors">
            {bookTitle}
          </h3>

          <p className="text-gray-600 text-sm font-medium line-clamp-1 mt-1">{bookAuthor}</p>

          {totalReviews > 0 && (
            <div className="flex items-center mt-2">
              <FaStar className="text-yellow-400 mr-1" />
              <span className="font-semibold text-gray-900 text-sm">{averageRating.toFixed(1)}</span>
              <span className="text-gray-500 text-xs ml-1">({totalReviews} reviews)</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          {/* Always show Upvote Section */}
          <motion.button
            whileHover={{ scale: isOwner ? 1 : 1.1 }}
            whileTap={{ scale: isOwner ? 1 : 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              // This onClick will be handled by the parent component (Home.jsx)
              // which will check login status and either upvote or redirect.
              if (onUpvoteClick) {
                  onUpvoteClick(book);
              }
            }}
            disabled={isOwner && currentUser !== null} // Disable only for owner when logged in
            className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
              (isOwner && currentUser !== null)
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            aria-label={isOwner ? 'Cannot upvote your own book' : 'Upvote book'}
          >
            <FaArrowUp className="mr-2 h-4 w-4" />
            Upvote ({upvoteCount})
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default BookCard; 