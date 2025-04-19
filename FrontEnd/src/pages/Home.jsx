import React, { useState, useContext } from "react";
import CourseRoadmap from "./RoadMap";
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
  const [selectedCourse, setSelectedCourse] = useState(null);
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
    setSelectedCourse(courseName);
    navigate(`/CourseRoadmap`);
  };

  return (
    <div className={`p-6 max-w-6xl mx-auto ${darkMode ? "text-white" : "text-black"}`}>
      <h1 className="text-4xl font-bold mb-10 text-center">Computer Science Courses</h1>
      <div>
        {Object.entries(courseData).map(([category, courses]) => (
          <div key={category} className="mb-16">
            <h2 className="text-2xl font-semibold">{category}</h2>
            <hr className="my-4 border-t border-gray-300" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {courses.map((course, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-gray-200 cursor-pointer flex items-center gap-3 bg-gradient-to-r ${course.gradient}`}
                  onClick={() => handleCourseClick(course.name)}
                >
                  <span className="text-white text-2xl">{course.icon}</span>
                  <p className="text-white font-medium text-lg">
                    {course.name.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* If you still want to render something in-page */}
      {selectedCourse && <CourseRoadmap course={selectedCourse} />}
    </div>
  );
}
