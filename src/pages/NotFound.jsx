import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaSearch, FaBook, FaArrowLeft, FaSmile } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const NotFound = () => {
  const { isDarkMode } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
        isDarkMode ? 'bg-secondary-900 text-white' : 'bg-secondary-50 text-secondary-900'
      }`}
    >
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <motion.div
          initial={{ scale: 0.5, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          className="mb-8"
        >
          <div className="relative">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-primary-900' : 'bg-primary-100'
            }`}>
              <span className="text-6xl font-bold text-primary-600">404</span>
            </div>
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              className={`absolute -top-4 -right-4 w-16 h-16 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-accent-900' : 'bg-accent-100'
              }`}
            >
              <FaSmile className="w-8 h-8 text-accent-600" />
            </motion.div>
            <motion.div
              animate={{
                x: [0, 5, -5, 0],
                y: [0, -5, 5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              className={`absolute -bottom-2 -left-2 w-12 h-12 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-yellow-900' : 'bg-yellow-100'
              }`}
            >
              <FaBook className="w-6 h-6 text-yellow-600" />
            </motion.div>
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-extrabold mb-4"
        >
          Page not found
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`text-lg mb-8 ${
            isDarkMode ? 'text-secondary-300' : 'text-secondary-600'
          }`}
        >
          Oops! The page you're looking for doesn't exist or has been moved.
        </motion.p>

        {/* Navigation Options */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <Link
            to="/"
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-300"
          >
            <FaHome className="mr-2" />
            Go to Homepage
          </Link>
          <Link
            to="/bookshelf"
            className="w-full flex items-center justify-center px-6 py-3 border border-secondary-300 text-base font-medium rounded-lg transition-colors duration-300 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FaSearch className="mr-2" />
            Browse Books
          </Link>
        </motion.div>

        {/* Help Text */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`mt-8 text-sm ${
            isDarkMode ? 'text-secondary-400' : 'text-secondary-500'
          }`}
        >
          Need help?{' '}
          <Link
            to="/bookshelf"
            className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-300"
          >
            Browse our collection
          </Link>
        </motion.p>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute top-20 left-10 text-primary-400 opacity-20"
        >
          <FaBook className="w-8 h-8" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute bottom-20 right-10 text-accent-400 opacity-20"
        >
          <FaSmile className="w-6 h-6" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotFound; 