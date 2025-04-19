// Layout.js
import React, { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header';
import Sidebar from './Sidebar';
import { ThemeContext } from '../../context/ThemeContext'; // adjust path if needed

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext); // 👈 use context

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const isDarkMode = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header toggleSidebar={toggleSidebar} darkMode={isDarkMode} toggleTheme={toggleTheme} />
      <Sidebar isOpen={sidebarOpen} darkMode={isDarkMode} toggleSidebar={toggleSidebar} />
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
