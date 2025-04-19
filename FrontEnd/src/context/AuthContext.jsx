import React, { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");

    if (email) {
      setUserEmail(email);
    }

    setLoading(false); // Ensure this gets called
  }, []);

  const login = (email, token) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userEmail", email);
    setUserEmail(email);
  };

  const signup = (email, token) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userEmail", email);
    setUserEmail(email);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{ userEmail, loading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
