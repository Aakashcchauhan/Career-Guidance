import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Menu, LogOut, Settings, User } from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";

export default function Header({ toggleSidebar }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { userEmail, logout } = useContext(AuthContext);
  const darkMode = theme === "dark";

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = () => navigate("/auth/login");
  const handleSignupClick = () => navigate("/auth/signup");

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-10 px-4 py-2 cursor-pointer flex items-center justify-between shadow-md ${
        darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="cursor-pointer mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-300">
          <Menu size={24} />
        </button>
        <div className="flex items-center  text-blue-600 dark:text-blue-400">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className=" cursor-pointer ml-2 text-xl font-bold">CareerGuide</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex  items-center space-x-4">
        <button onClick={toggleTheme} className="p-2 cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-gray-300">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {!userEmail ? (
          <div className="flex space-x-2">
            <button onClick={handleLoginClick} className="cursor-pointer px-4 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
              Login
            </button>
            <button onClick={handleSignupClick} className="cursor-pointer px-4 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Sign Up
            </button>
          </div>
        ) : (
          <div className="relative">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center space-x-1 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="cursor-pointer w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                <User size={16} />
              </div>
              <span className="hidden sm:inline-block">{userEmail}</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 dark:text-white  rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700 z-20">
                <button className="w-full text-left cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                  <User size={16} className="mr-2 " />
                  <span>Profile</span>
                </button>
                <button className="w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                  <Settings size={16} className="mr-2 " />
                  <span>Settings</span>
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={handleLogout}
                  className="cursor-pointer w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <LogOut size={16} className="mr-2" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
