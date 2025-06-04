import React from 'react';
import { Routes, Route } from 'react-router-dom';
import  {useLocation}  from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Bookshelf from './pages/Bookshelf';
import BookDetails from './pages/BookDetails';
import AddBook from './pages/AddBook';
import MyBooks from './pages/MyBooks';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import EditBook from './pages/EditBook';
// import About from './pages/About';
// import Contact from './pages/Contact';
// import Terms from './pages/Terms';
// import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';
import Toast from './components/Toast';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const location = useLocation();

  const pageVariants = {
    initial: {
      opacity: 0,
      x: '-100vw',
    },
    in: {
      opacity: 1,
      x: 0,
    },
    out: {
      opacity: 0,
      x: '100vw',
    },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Home />
                </motion.div>
              }
            />
            <Route
              path="/bookshelf"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Bookshelf />
                </motion.div>
              }
            />
            <Route
              path="/book/:id"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <BookDetails />
                </motion.div>
              }
            />
            <Route
              path="/add-book"
              element={
                <ProtectedRoute>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <AddBook />
                  </motion.div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-books"
              element={
                <ProtectedRoute>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <MyBooks />
                  </motion.div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-book/:id"
              element={
                <ProtectedRoute>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <EditBook />
                  </motion.div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Profile />
                  </motion.div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            {/* <Route
              path="/about"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <About />
                </motion.div>
              }
            />
            <Route
              path="/contact"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Contact />
                </motion.div>
              }
            />
            <Route
              path="/terms"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Terms />
                </motion.div>
              }
            />
            <Route
              path="/privacy"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Privacy />
                </motion.div>
              }
            /> */}
            <Route
              path="*"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <NotFound />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      </div>
  );
}

export default App;
