import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png'; // Import the logo image

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally show a toast notification for logout failure
    }
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Bookshelf', path: '/bookshelf' },
    { name: 'Add Book', path: '/add-book', protected: true },
    { name: 'My Books', path: '/my-books', protected: true },
    { name: 'Profile', path: '/profile', protected: true },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="bg-white shadow-md sticky top-0 z-30"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <NavLink to="/" className="flex items-center text-2xl font-bold text-blue-600">
            <img src={logo} alt="BookHaven Logo" className="h-10 w-auto mr-2" />
            BookHaven
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link,id) =>
              link.protected && !currentUser ? null : (
                link.name === 'Profile' ? (
                  currentUser && (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      className={({ isActive }) =>
                        `flex items-center relative transition-all duration-200 ${
                          isActive 
                            ? 'text-blue-600 font-semibold after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-blue-600 after:rounded-full' 
                            : 'text-gray-700 hover:text-blue-600 hover:after:absolute hover:after:bottom-[-8px] hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-blue-600/50 hover:after:rounded-full'
                        }`
                      }
                    >
                      {link.name}
                    </NavLink>
                  )
                ) : (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) =>
                      `relative transition-all duration-200 ${
                        isActive 
                          ? 'text-blue-600 font-semibold after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-blue-600 after:rounded-full' 
                          : 'text-gray-700 hover:text-blue-600 hover:after:absolute hover:after:bottom-[-8px] hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-blue-600/50 hover:after:rounded-full'
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                )
              )
            )}
            {/* Login/Logout Button */}
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <FaBars className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white border-t border-gray-200"
            >
              <nav className="flex flex-col space-y-4 px-4 py-4">
                {navLinks.map((link) =>
                  link.protected && !currentUser ? null : (
                    link.name === 'Profile' ? (
                      currentUser && (
                        <NavLink
                          key={link.name}
                          to={link.path}
                          onClick={toggleMenu}
                          className={({ isActive }) =>
                            `block flex items-center relative transition-all duration-200 ${
                              isActive 
                                ? 'text-blue-600 font-semibold after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-blue-600 after:rounded-full' 
                                : 'text-gray-700 hover:text-blue-600 hover:after:absolute hover:after:bottom-[-4px] hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-blue-600/50 hover:after:rounded-full'
                            }`
                          }
                        >
                          {/* Display profile image if available, otherwise show icon */}
                          {currentUser.photoURL ? (
                            <img
                              src={currentUser.photoURL}
                              alt="Profile"
                              className="h-6 w-6 rounded-full object-cover"
                            />
                          ) : (
                            <FaUserCircle className="h-6 w-6" />
                          )}
                        </NavLink>
                      )
                    ) : (
                      <NavLink
                        key={link.name}
                        to={link.path}
                        onClick={toggleMenu}
                        className={({ isActive }) =>
                          `block relative transition-all duration-200 ${
                            isActive 
                              ? 'text-blue-600 font-semibold after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-blue-600 after:rounded-full' 
                              : 'text-gray-700 hover:text-blue-600 hover:after:absolute hover:after:bottom-[-4px] hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-blue-600/50 hover:after:rounded-full'
                          }`
                        }
                      >
                        {link.name}
                      </NavLink>
                    )
                  )
                )}
                {/* Login/Logout Button for Mobile */}
                {currentUser ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu(); // Close menu after logout
                    }}
                    className="block w-full text-left px-4 py-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={toggleMenu} // Close menu on login click
                    className="block w-full text-left px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Login
                  </Link>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar; 