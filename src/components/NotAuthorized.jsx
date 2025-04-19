import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotAuthorized = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/auth/login'); // Adjust this path if your login route is different
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <h1 className="text-3xl font-bold text-red-600 mb-4">🚫 You are not authorized</h1>
      <p className="text-gray-700 mb-6">Please log in to access this page.</p>
      <button
        onClick={handleRedirect}
        className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white px-6 py-2 rounded-md shadow hover:opacity-90 transition"
      >
        Go to Login
      </button>
    </div>
  );
};

export default NotAuthorized;
