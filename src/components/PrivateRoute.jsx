import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a Loading Spinner component
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" />;
}

export default PrivateRoute; 