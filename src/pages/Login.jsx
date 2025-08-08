import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FaGoogle, FaEnvelope, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const Login = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo);
      showToast('Login successful');
    } catch (error) {
      console.error('Login error:', error);
      showToast(
        error.message || 'Failed to login. Please check your credentials.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);

    try {
      if (provider === 'google') {
        await loginWithGoogle();
      }
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo);
      showToast('Login successful');
    } catch (error) {
      console.error(`${provider} login error:`, error);
      showToast(
        `Failed to login with ${provider}. Please try again.`,
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
            Welcome back
          </h2>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => handleSocialLogin('google')}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isDarkMode ? 'border border-gray-600 text-gray-100 bg-secondary-800 hover:bg-secondary-700' : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
          >
            <FaGoogle className="w-5 h-5 mr-2 text-red-500" />
            Sign in with Google
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex-1 h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Or continue with</span>
          <div className={`flex-1 h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 pl-10 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${isDarkMode ? 'border-gray-600 bg-secondary-800 placeholder-gray-400 text-gray-100' : 'border-gray-300 bg-white placeholder-gray-500 text-gray-900'}`}
                placeholder="Email address"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 pl-10 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${isDarkMode ? 'border-gray-600 bg-secondary-800 placeholder-gray-400 text-gray-100' : 'border-gray-300 bg-white placeholder-gray-500 text-gray-900'}`}
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${isDarkMode ? 'border-gray-600 bg-secondary-800' : 'border-gray-300'}`}
              />
              <label
                htmlFor="remember-me"
                className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-400 hover:text-blue-300"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2.5 px-4 text-sm font-semibold rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700`}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="text-white" />
              ) : (
                'Sign in'
              )}
            </button>
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

export default Login; 