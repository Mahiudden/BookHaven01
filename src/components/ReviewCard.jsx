import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

const ReviewCard = ({ review, onLike, onDislike, currentUser }) => {
  const {
    _id,
    userEmail,
    userName,
    userPhoto,
    rating,
    reviewText,
    likes = 0,
    dislikes = 0,
    createdAt,
    userLiked,
    userDisliked,
  } = review;
  

  const handleLikeClick = () => {
    if (currentUser && currentUser.email === userEmail) {
      toast.error("You can't like your own review");
      return;
    }
    if (onLike && _id) {
      onLike(_id, !userLiked);
    }
  };

  const handleDislikeClick = () => {
    if (currentUser && currentUser.email === userEmail) {
      toast.error("You can't dislike your own review");
      return;
    }
    if (onDislike && _id) {
      onDislike(_id, !userDisliked);
    }
  };

  const renderStars = (ratingValue) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`w-4 h-4 ${
          index < ratingValue ? 'text-yellow-400' : 'text-gray-300'
        } inline-block`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-gray-50 rounded-lg shadow-sm p-5 mb-4 border border-gray-200 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <img
            src={userPhoto || 'https://via.placeholder.com/40'}
            alt={userName || 'Anonymous User'}
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
          <div>
            <h4 className="font-semibold text-gray-800">{userName || 'Anonymous User'}</h4>
            <div className="flex items-center space-x-2 mt-1 text-sm">
              {renderStars(rating)}
              <span className="text-gray-500 ml-2">
                {createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
        {currentUser && currentUser.email === userEmail && (
          <div className="text-sm text-gray-500">
            {/* Add edit/delete buttons here */}
          </div>
        )}
      </div>

      <p className="text-gray-700 leading-relaxed mb-4">{reviewText}</p>

      <div className="flex items-center space-x-4 text-sm">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLikeClick}
          disabled={currentUser && currentUser.email === userEmail}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full font-medium transition-colors duration-200 ${
            currentUser && currentUser.email === userEmail
              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
              : userLiked
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaThumbsUp className="text-sm" />
          <span>{likes}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleDislikeClick}
          disabled={currentUser && currentUser.email === userEmail}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full font-medium transition-colors duration-200 ${
            currentUser && currentUser.email === userEmail
              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
              : userDisliked
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaThumbsDown className="text-sm" />
          <span>{dislikes}</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ReviewCard; 