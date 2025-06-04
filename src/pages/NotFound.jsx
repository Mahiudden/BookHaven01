import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaSearch, FaBook } from 'react-icons/fa';

const NotFound = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          className="mb-8"
        >
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-6xl font-bold text-blue-600">404</span>
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
              className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center"
            >
              <FaBook className="w-8 h-8 text-yellow-600" />
            </motion.div>
          </div>
        </motion.div>

        {/* Error Message */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
          Page not found
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Navigation Options */}
        <div className="space-y-4">
          <Link
            to="/"
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaHome className="mr-2" />
            Go to Homepage
          </Link>
          <Link
            to="/search"
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaSearch className="mr-2" />
            Browse Books
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500">
          Need help?{' '}
          <Link
            to="/contact"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Contact us
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default NotFound; 