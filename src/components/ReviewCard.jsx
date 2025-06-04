import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaThumbsUp, FaThumbsDown, FaEdit, FaTrash } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import Rating from './Rating';

const ReviewCard = ({ review, onLike, onDislike, currentUser, onEdit, onDelete }) => {
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
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedReviewText, setEditedReviewText] = useState(reviewText);
  const [editedRating, setEditedRating] = useState(rating);

  const isReviewOwner = currentUser && userEmail === currentUser.email;

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

  const handleSaveEdit = async () => {
    if (onEdit && _id) {
      await onEdit(_id, { reviewText: editedReviewText, rating: editedRating });
      setIsEditing(false);
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
        {isReviewOwner && !isEditing && (
          <div className="flex space-x-3">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              aria-label="Edit review"
            >
              <FaEdit className="mr-1"/> Edit
            </button>
            <button
              onClick={() => onDelete(_id)}
              className="flex items-center text-red-600 hover:text-red-800 transition-colors"
              aria-label="Delete review"
            >
              <FaTrash className="mr-1"/> Delete
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="mt-3 space-y-3">
          <div>
            <label htmlFor="editedRating" className="block text-sm font-medium text-gray-700">Your Rating</label>
            <Rating value={editedRating} onChange={setEditedRating} size="md" />
          </div>
          <div>
            <label htmlFor="editedReviewText" className="sr-only">Edit Review</label>
            <textarea
              id="editedReviewText"
              rows="3"
              className="mt-1 block w-full text-black p-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={editedReviewText}
              onChange={(e) => setEditedReviewText(e.target.value)}
              placeholder="Edit your review..."
              required
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 leading-relaxed mb-4">{reviewText}</p>
      )}

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