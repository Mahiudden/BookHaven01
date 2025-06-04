import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaQuestionCircle, FaBookOpen } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const FAQAccordion = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {faqs.map((faq, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.1 }}
          className={`mb-6 transform transition-all duration-300 hover:scale-[1.02] ${
            openIndex === idx 
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 ring-2 ring-blue-200' 
              : 'bg-white hover:shadow-lg'
          } rounded-xl shadow-md border border-gray-200`}
        >
          <button
            className="w-full flex items-center justify-between p-6 font-semibold text-lg focus:outline-none transition-all duration-300 group"
            onClick={() => toggle(idx)}
            aria-expanded={openIndex === idx}
          >
            <span className="flex items-center gap-3 text-gray-700 group-hover:text-blue-600">
              <span className={`p-2 rounded-full ${
                openIndex === idx 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
              } transition-colors duration-300`}>
                <FaBookOpen className="text-xl" />
              </span>
              <span className="text-left">{faq.question}</span>
            </span>
            <motion.span
              animate={{ rotate: openIndex === idx ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className={`p-2 rounded-full ${
                openIndex === idx 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
              } transition-colors duration-300`}
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
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="text-gray-600 leading-relaxed">
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