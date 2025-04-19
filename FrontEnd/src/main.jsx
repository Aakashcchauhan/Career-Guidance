import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from "./context/AuthContext";
import {FirebaseProvider} from './context/FirebaseContext.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
     <FirebaseProvider>
       <AuthProvider>
    <App />
    </AuthProvider>
    </FirebaseProvider>
  </StrictMode>,
);
