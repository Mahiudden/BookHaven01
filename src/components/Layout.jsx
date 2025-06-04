import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto mt-4">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}

export default Layout; 