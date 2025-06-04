import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';

const Rating = ({
  value = 0,
  onChange,
  size = 'md',
  readonly = false,
  showValue = false,
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const handleMouseEnter = (index) => {
    if (!readonly) {
      setHoverValue(index);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };

  const handleClick = (index) => {
    if (!readonly && onChange) {
      onChange(index);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const ratingValue = index + 1;
      const isHovered = hoverValue >= ratingValue;
      const isSelected = value >= ratingValue;

      return (
        <motion.button
          key={index}
          type="button"
          disabled={readonly}
          onMouseEnter={() => handleMouseEnter(ratingValue)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(ratingValue)}
          whileHover={!readonly ? { scale: 1.1 } : {}}
          whileTap={!readonly ? { scale: 0.9 } : {}}
          className={`focus:outline-none ${
            readonly ? 'cursor-default' : 'cursor-pointer'
          }`}
        >
          <FaStar
            className={`${sizeClasses[size]} ${
              isHovered || isSelected ? 'text-yellow-400' : 'text-gray-300'
            } transition-colors duration-200`}
          />
        </motion.button>
      );
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">{renderStars()}</div>
      {showValue && (
        <span className="text-sm text-gray-600">
          {value.toFixed(1)} / 5.0
        </span>
      )}
    </div>
  );
};

export default Rating; 