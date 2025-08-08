import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaQuestionCircle, FaBookOpen } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const FAQAccordion = ({ faqs, isDarkMode = false }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full">
      {faqs.map((faq, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.1 }}
          className={`mb-6 transform transition-all duration-300 hover:scale-[1.02] ${
            openIndex === idx 
              ? isDarkMode 
                ? 'bg-gradient-to-r from-gray-800/90 to-gray-700/90 ring-2 ring-blue-400 shadow-xl' 
                : 'bg-gradient-to-r from-white/90 to-blue-50/90 ring-2 ring-blue-300 shadow-xl'
              : isDarkMode 
                ? 'bg-gray-800/80 hover:bg-gray-700/90 hover:shadow-lg backdrop-blur-sm' 
                : 'bg-white/80 hover:bg-white/90 hover:shadow-lg backdrop-blur-sm'
          } rounded-2xl shadow-md border ${
            isDarkMode ? 'border-gray-600/30' : 'border-white/30'
          }`}
        >
          <button
            className="w-full flex items-center justify-between p-6 font-semibold text-lg focus:outline-none transition-all duration-300 group"
            onClick={() => toggle(idx)}
            aria-expanded={openIndex === idx}
          >
            <span className={`flex items-center gap-4 ${
              isDarkMode ? 'text-gray-200 group-hover:text-blue-300' : 'text-gray-800 group-hover:text-blue-700'
            }`}>
              <span className={`p-3 rounded-full ${
                openIndex === idx 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : isDarkMode 
                    ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300 group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 group-hover:from-blue-100 group-hover:to-purple-100 group-hover:text-blue-700'
              } transition-all duration-300`}>
                <FaBookOpen className="text-xl" />
              </span>
              <span className={`text-left font-medium ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>{faq.question}</span>
            </span>
            <motion.span
              animate={{ rotate: openIndex === idx ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className={`p-3 rounded-full ${
                openIndex === idx 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : isDarkMode 
                    ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300 group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 group-hover:from-blue-100 group-hover:to-purple-100 group-hover:text-blue-700'
              } transition-all duration-300`}
            >
              <FaChevronDown className="text-xl" />
            </motion.span>
          </button>
          <AnimatePresence>
            {openIndex === idx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6">
                  <div className="border-l-4 border-gradient-to-b from-blue-500 to-purple-600 pl-6">
                    <p className={`leading-relaxed text-lg ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default FAQAccordion; 