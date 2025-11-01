import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaJs, FaPython, FaJava, FaCuttlefish, FaRust, FaSwift, FaReact, FaNodeJs, FaMobileAlt,
  FaBrain, FaNetworkWired, FaLock, FaDev, FaDatabase, FaRobot
} from "react-icons/fa";
import {
  SiCplusplus, SiGo, SiRuby, SiTypescript, SiFlutter,
  SiTensorflow, SiAmazonwebservices, SiPrivateinternetaccess
} from "react-icons/si";
import { GiProcessor } from "react-icons/gi";
import { ThemeContext } from "../context/ThemeContext";

export default function CourseList() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const darkMode = theme === "dark";

  const courseData = {
    "Core Language": [
      { name: "JavaScript", gradient: "from-yellow-400 to-yellow-200", icon: <FaJs /> },
      { name: "Python", gradient: "from-blue-700 to-blue-400", icon: <FaPython /> },
      { name: "Java", gradient: "from-orange-700 to-orange-400", icon: <FaJava /> },
      { name: "C++", gradient: "from-blue-900 to-blue-400", icon: <SiCplusplus /> },
      { name: "C", gradient: "from-gray-700 to-gray-400", icon: <FaCuttlefish /> },
      { name: "Go", gradient: "from-cyan-600 to-cyan-300", icon: <SiGo /> },
      { name: "Ruby", gradient: "from-red-700 to-red-400", icon: <SiRuby /> },
      { name: "Rust", gradient: "from-yellow-800 to-yellow-500", icon: <FaRust /> },
      { name: "Swift", gradient: "from-orange-500 to-orange-200", icon: <FaSwift /> },
      { name: "TypeScript", gradient: "from-blue-600 to-blue-300", icon: <SiTypescript /> },
    ],
    "Web & Mobile Development": [
      { name: "FullStackWebDevelopment", gradient: "from-gray-700 to-gray-400", icon: <FaReact /> },
      { name: "FrontendDevelopmentwithReact", gradient: "from-blue-400 to-blue-200", icon: <FaReact /> },
      { name: "BackendDevelopmentwithNodejs", gradient: "from-green-700 to-green-400", icon: <FaNodeJs /> },
      { name: "MobileAppDevelopmentwithFlutter", gradient: "from-blue-800 to-blue-400", icon: <SiFlutter /> },
      { name: "ProgressiveWebApps", gradient: "from-teal-500 to-teal-200", icon: <FaMobileAlt /> },
    ],
    "Artificial Intelligence & Machine Learning": [
      { name: "ArtificialIntelligence", gradient: "from-purple-700 to-purple-400", icon: <FaRobot /> },
      { name: "MachineLearning", gradient: "from-indigo-700 to-indigo-400", icon: <SiTensorflow /> },
      { name: "DeepLearning", gradient: "from-purple-800 to-purple-400", icon: <FaBrain /> },
      { name: "NaturalLanguageProcessing", gradient: "from-cyan-800 to-cyan-400", icon: <GiProcessor /> },
      { name: "ComputerVision", gradient: "from-green-800 to-green-400", icon: <FaBrain /> },
    ],
    "Cybersecurity & Networks": [
      { name: "ComputerNetworks", gradient: "from-gray-800 to-gray-500", icon: <FaNetworkWired /> },
      { name: "CybersecurityFundamentals", gradient: "from-red-600 to-red-400", icon: <FaLock /> },
      { name: "EthicalHackingandPenetrationTesting", gradient: "from-red-900 to-red-600", icon: <FaLock /> },
      { name: "Cryptography", gradient: "from-orange-700 to-orange-400", icon: <FaLock /> },
      { name: "NetworkSecurity", gradient: "from-yellow-600 to-yellow-300", icon: <FaLock /> },
    ],
    "Data & Cloud": [
      { name: "DataScience", gradient: "from-teal-700 to-teal-400", icon: <FaDatabase /> },
      { name: "BigDataAnalytics", gradient: "from-yellow-900 to-yellow-600", icon: <FaDatabase /> },
      { name: "CloudComputingwithAWS", gradient: "from-yellow-500 to-yellow-300", icon: <SiAmazonwebservices /> },
      { name: "DevOpsandContinuousIntegration", gradient: "from-purple-900 to-purple-500", icon: <FaDev /> },
      { name: "InternetofThings", gradient: "from-blue-900 to-blue-400", icon: <SiPrivateinternetaccess /> },
    ],
  };

  const handleCourseClick = (courseName) => {
    navigate(`/CourseRoadmap/${courseName}`);
  };

  return (
    <div className={`min-h-screen pb-20 ${darkMode ? "bg-slate-900" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className={`text-center mb-12 p-8 rounded-2xl ${darkMode ? "bg-slate-800" : "bg-white"} shadow-lg`}>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Explore Hot Topics
            </span>
          </h1>
          <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Choose a course and start your learning journey today
          </p>
        </div>

        {/* Course Categories */}
        <div className="space-y-12">
          {Object.entries(courseData).map(([category, courses]) => (
            <div key={category}>
              <div className="mb-6">
                <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {category}
                </h2>
                <div className={`h-1 w-20 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600`}></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => (
                  <div
                    key={index}
                    className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                      darkMode ? "bg-slate-800" : "bg-white"
                    }`}
                    onClick={() => handleCourseClick(course.name)}
                  >
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${course.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                    
                    {/* Content */}
                    <div className="relative p-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-xl bg-gradient-to-r ${course.gradient} text-white shadow-lg`}>
                          <span className="text-3xl">{course.icon}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-bold text-lg leading-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {course.name.replace(/([A-Z])/g, " $1").trim()}
                          </h3>
                          <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            Start Learning →
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
