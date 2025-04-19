import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function Sidebar({ darkMode, isOpen, toggleSidebar }) {
  const menuItems = [
    { name: "Hot Topics", path: "/" },
    { name: "Courses Roadmap", path: "/CourseRoadmap" },
    { name: "Interview Question", path: "/Interview" },
  ];
  
  return (
    <>
      <div
        className={`fixed top-0 bottom-0 left-0 w-64 pt-16 shadow-lg transition-transform duration-300 z-0 ${
          darkMode ? "dark:bg-gray-800" : "bg-gray-100"
        } ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Sidebar content */}
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4">Menu</h2>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-4 py-2 rounded-md transition-colors ${
                  darkMode
                    ? "hover:bg-gray-700 text-white"
                    : "hover:bg-gray-200 text-gray-800"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Toggle button on sidebar */}
        <button
          onClick={toggleSidebar}
          className={`absolute top-1/2 -mt-12 ${
            isOpen ? "right-0 translate-x-1/2" : "right-0 translate-x-full"
          } bg-blue-600 text-white rounded-full p-1 shadow-lg`}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </>
  );
}