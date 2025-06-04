import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const socialLinks = [
    { icon: FaTwitter, url: '#' },
    { icon: FaFacebook, url: '#' },
    { icon: FaInstagram, url: '#' },
    { icon: FaLinkedin, url: '#' },
  ];

  const footerLinks = [
    { name: 'Home', path: '/' },
    { name: 'Bookshelf', path: '/bookshelf' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Terms', path: '/terms' },
    { name: 'Privacy', path: '/privacy' },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800 text-gray-300 py-12"
    >
      <div className="container mx-auto px-4 text-center md:text-left">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-bold text-blue-400">
              BookHaven
            </Link>
            <p className="text-sm leading-relaxed">
              Your ultimate destination for discovering, reading, and sharing books
              with fellow book lovers.
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <link.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-sm hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <div className="text-sm space-y-2">
              <p>Email: support@bookhaven.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>
                Address: 123 Book Street, Reading City, RC 12345, United States
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-700 pt-8 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} BookHaven. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer; 