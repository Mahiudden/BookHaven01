import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaBookmark, FaHeart, FaBook, FaRegBookmark, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const BookCard = ({ book, onClick, onBookmarkToggle, isBookmarked, currentUser, onLikeToggle, isLiked }) => {

  const {
    bookTitle,
    bookAuthor,
    coverImage,
    rating,
    bookCategory,
    readingStatus,
    totalReviews,
    likes,
    bookmarks,
    _id // Add _id to destructuring
  } = book;

  const handleClick = () => {
    if (onClick && _id) {
      onClick(_id);
    }
  };

  const handleUpvoteClick = (e) => {
    // ... existing upvote click logic ...
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'reading':
        return 'bg-blue-500 text-white';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'want_to_read':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'reading':
        return <FaBook className="mr-1" />;
      case 'completed':
        return <FaBookmark className="mr-1" />;
      case 'want_to_read':
        return <FaHeart className="mr-1" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100"
      onClick={handleClick} // Use the new handleClick function
    >
      {/* Book Cover with Gradient Overlay */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={coverImage || 'https://via.placeholder.com/300x450?text=No+Cover'}
          alt={bookTitle}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status Badge */}
        {readingStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${getStatusColor(readingStatus)} shadow-lg backdrop-blur-sm bg-opacity-90`}
          >
            {getStatusIcon(readingStatus)}
            {readingStatus.replace('_', ' ')}
          </motion.div>
        )}

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-full shadow-sm">
            {bookCategory}
          </span>
        </div>
      </div>

      {/* Book Info */}
      <div className="p-6 space-y-3">
        <div className='flex justify-between'>
          <div>
            <h3 className="font-bold text-gray-900 line-clamp-2 text-lg group-hover:text-blue-600 transition-colors">
              {bookTitle}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {/* Bookmark Button */}
            {onBookmarkToggle && (
              <motion.button
              whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmarkToggle(book);
                }}
                className="text-gray-500 hover:text-blue-600 transition-colors focus:outline-none"
                aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                >
                {isBookmarked ? <FaBookmark className="text-blue-600" size={20} /> : <FaRegBookmark size={20} />}
              </motion.button>
            )}
             {/* Like Button */}
             {onLikeToggle && ( // Only render if onLikeToggle is provided
               <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLikeToggle(book);
                  }}
                   className="text-gray-500 hover:text-red-600 transition-colors focus:outline-none"
                   aria-label={isLiked ? 'Unlike book' : 'Like book'}
                 >
                  {isLiked ? <FaHeart className="text-red-600" size={20} /> : <FaRegHeart size={20} />}
               </motion.button>
             )}
          </div>
        </div>
        <p className="text-gray-600 text-sm font-medium line-clamp-1">{bookAuthor}</p>

        {/* Rating and Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <FaStar className="text-yellow-400" />
            <span className="font-semibold text-gray-900 text-sm">{rating?.toFixed(1) || 'N/A'}</span>
            {totalReviews > 0 && (
              <span className="text-gray-500 text-xs">({totalReviews})</span>
            )}
          </div>

          {/* Display total likes, upvotes, and bookmarks counts */}
          <div className="flex items-center space-x-4 text-gray-500 text-sm">
            {likes > 0 && !onLikeToggle && ( // Only show total likes if not using the toggle button
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center"
              >
                <FaHeart className="mr-1 text-red-500" />
                <span>{likes}</span>
              </motion.div>
            )}
            {/* Upvote Count */}
            {book.upvote > 0 && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center text-green-700" // Using green for upvotes as in BookDetails
              >
                <p className='text-black font-bold'>upvotes: </p>
                {/* <FaHeart className="mr-1" /> Using FaHeart for upvotes */}
                <span> {book.upvote}</span>
              </motion.div>
            )}
            {bookmarks > 0 && !onBookmarkToggle && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                className=""
              >
                <FaBookmark className="mr-1 text-blue-500" />
                <span>{bookmarks}</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookCard; 