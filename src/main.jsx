// src/main.jsx
import React, { useEffect } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import BrowserRouter, useLocation } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { FirebaseProvider } from './context/FirebaseContext.jsx';

const GA_ID = 'G-JSMS4Z6FP4';

function RouteTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', GA_ID, { page_path: pathname });
    }
  }, [pathname]);
  return null;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <FirebaseProvider>
        <AuthProvider>
          <RouteTracker />
          <App />
        </AuthProvider>
      </FirebaseProvider>
    </BrowserRouter>
  </StrictMode>
);
