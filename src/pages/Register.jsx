import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FaGoogle, FaEnvelope, FaLock, FaUser, FaImage } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const Register = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { register, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    photoURL: '',
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, photoURL: url }));
    setPreviewImage(url);
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return false;
    }

    // Password validation rules
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasMinLength = formData.password.length >= 6;

    if (!hasUpperCase) {
      showToast('Password must contain at least one uppercase letter', 'error');
      return false;
    }
    if (!hasLowerCase) {
      showToast('Password must contain at least one lowercase letter', 'error');
      return false;
    }
    if (!hasMinLength) {
      showToast('Password must be at least 6 characters long', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register(
        formData.email, 
        formData.password, 
        formData.name,
        formData.photoURL || null
      );
      navigate('/');
      showToast('Registration successful');
    } catch (error) {
      console.error('Registration error:', error);
      showToast(
        error.message || 'Failed to register. Please try again.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider) => {
    setIsLoading(true);

    try {
      if (provider === 'google') {
        await loginWithGoogle();
      }
      navigate('/');
      showToast('Registration successful');
    } catch (error) {
      console.error(`${provider} signup error:`, error);
      showToast(
        `Failed to sign up with ${provider}. Please try again.`,
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
        isDarkMode ? 'bg-secondary-900 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}
    >
      <div className={`w-full max-w-md rounded-2xl p-8 shadow-xl border space-y-6 ${
        isDarkMode ? 'bg-secondary-800/60 border-gray-700 backdrop-blur-sm' : 'bg-white/60 border-gray-200 backdrop-blur-sm'
      }`}>
        {/* Header */}
        <div className="text-center">
          <h2 className={`mt-6 text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Create your account
          </h2>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Social Signup Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => handleSocialSignup('google')}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isDarkMode ? 'border border-gray-600 text-gray-100 bg-secondary-800 hover:bg-secondary-700' : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
          >
            <FaGoogle className="w-5 h-5 mr-2 text-red-500" />
            Sign up with Google
          </button>
        </div>

        <div className="relative">
          <div className="flex items-center gap-3">
          <div className={`flex-1 h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Or continue with</span>
          <div className={`flex-1 h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
        </div>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <label htmlFor="name" className="sr-only">
                Full name
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 pl-10 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${isDarkMode ? 'border-gray-600 bg-secondary-800 placeholder-gray-400 text-gray-100' : 'border-gray-300 bg-white placeholder-gray-500 text-gray-900'}`}
                placeholder="Full name"
              />
            </div>
            <div className="relative">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${isDarkMode ? 'border-gray-600 bg-secondary-800 placeholder-gray-400 text-gray-100' : 'border-gray-300 bg-white placeholder-gray-500 text-gray-900'}`}
                placeholder="Email address"
              />
            </div>
            <div className="relative">
              <label htmlFor="photoURL" className="sr-only">
                Profile Image URL (optional)
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaImage className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="photoURL"
                name="photoURL"
                type="url"
                value={formData.photoURL}
                onChange={handleImageChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${isDarkMode ? 'border-gray-600 bg-secondary-800 placeholder-gray-400 text-gray-100' : 'border-gray-300 bg-white placeholder-gray-500 text-gray-900'}`}
                placeholder="Profile Image URL (optional)"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${isDarkMode ? 'border-gray-600 bg-secondary-800 placeholder-gray-400 text-gray-100' : 'border-gray-300 bg-white placeholder-gray-500 text-gray-900'}`}
                placeholder="Password"
              />
            </div>
            <div className="relative">
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm password
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 pl-10 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${isDarkMode ? 'border-gray-600 bg-secondary-800 placeholder-gray-400 text-gray-100' : 'border-gray-300 bg-white placeholder-gray-500 text-gray-900'}`}
                placeholder="Confirm password"
              />
            </div>
          </div>

          {previewImage && (
            <div className="mt-4 flex justify-center">
              <img
                src={previewImage}
                alt="Profile preview"
                className="h-20 w-20 rounded-full object-cover border-2 border-blue-500"
                onError={() => {
                  setPreviewImage(null);
                  showToast('Invalid image URL', 'error');
                }}
              />
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2.5 px-4 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="text-white" />
              ) : (
                'Sign up'
              )}
            </button>
          </div>

          <div className="text-sm text-center text-gray-600">
            By signing up, you agree to our{' '}
            <Link
              to="/terms"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              to="/privacy"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Privacy Policy
            </Link>
          </div>
        </form>

        {/* Toast Notifications */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: '', type: '' })}
          />
        )}
      </div>
    </motion.div>
  );
};

export default Register; 