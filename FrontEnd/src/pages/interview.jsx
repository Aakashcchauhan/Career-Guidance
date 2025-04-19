// InterviewCategoriesPage.js
import React, { useState,useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

import { useNavigate } from "react-router-dom";
import {
  Search,
  Layout,
  Server,
  FileText,
  Grid,
  Users,
  BookOpen,
} from "lucide-react";

export default function InterviewCategoriesPage() {

   const { theme, toggleTheme } = useContext(ThemeContext);
    const darkMode = theme === "dark";

  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const categories = [
    {
      id: 1,
      title: "Frontend Development",
      count: "180+",
      icon: <Layout size={48} className="text-white" />,
      description:
        "Master frontend concepts, frameworks, and problem-solving techniques",
      longDescription:
        "This section focuses on building interactive user interfaces, mastering frontend libraries like React.js, and implementing design principles to create responsive and accessible web applications.",
      topics: [
        { name: "React.js & Hooks", count: 45 },
        { name: "JavaScript ES6+", count: 38 },
        { name: "CSS & Responsive Design", count: 32 },
        { name: "State Management", count: 35 },
        { name: "Performance Optimization", count: 30 },
      ],
      stats: {
        questions: "AI Generated Questions",
        frameworks: "15+ Frameworks",
      },
      colorClass: "bg-gradient-to-r from-blue-500 to-blue-400",
    },
    {
      id: 2,
      title: "Backend Development",
      count: "220+",
      icon: <Server size={48} className="text-white" />,
      description:
        "Prepare for server-side programming, APIs, and database questions",
      longDescription:
        "Explore server-side programming, building APIs, database integration, and implementing secure and scalable backend systems using technologies like Node.js and Express.",
      topics: [
        { name: "API Design & Development", count: 48 },
        { name: "Database Systems", count: 52 },
        { name: "Authentication & Security", count: 45 },
        { name: "Node.js & Express", count: 40 },
        { name: "Server Architecture", count: 35 },
      ],
      stats: {
        questions: "AI Generated Questions",
        frameworks: "12+ Technologies",
      },
      colorClass: "bg-gradient-to-r from-purple-500 to-purple-400",
    },
    {
      id: 3,
      title: "DSA in C++",
      count: "300+",
      icon: <FileText size={48} className="text-white" />,
      description:
        "Master data structures and algorithms with C++ implementation",
      longDescription:
        "Data Structures and Algorithms are fundamental to computer science and software engineering. This section is designed to help you master DSA concepts with C++ implementations, covering everything from basic array manipulations to advanced graph algorithms and dynamic programming techniques.",
      topics: [
        { name: "Arrays & Strings", count: 65 },
        { name: "Linked Lists", count: 40 },
        { name: "Trees & Graphs", count: 55 },
        { name: "Sorting & Searching", count: 45 },
        { name: "Dynamic Programming", count: 50 },
        { name: "Recursion & Backtracking", count: 25 },
        { name: "Greedy Algorithms", count: 20 },
        { name: "STL Library", count: 15 },
      ],
      stats: {
        questions: "AI Generated Questions",
        difficulty: "All Difficulty Levels",
      },
      colorClass: "bg-gradient-to-r from-green-500 to-green-400",
    },
    {
      id: 4,
      title: "System Design",
      count: "80+",
      icon: <Grid size={48} className="text-white" />,
      description:
        "Learn how to design scalable systems and tackle architecture questions",
      longDescription:
        "Dive into the design of large-scale systems, understanding distributed architecture, load balancing, caching, and high availability to tackle real-world design interview questions.",
      topics: [
        { name: "Distributed Systems", count: 20 },
        { name: "Microservices Architecture", count: 15 },
        { name: "Database Sharding", count: 12 },
        { name: "Load Balancing", count: 18 },
        { name: "Caching Strategies", count: 15 },
      ],
      stats: {
        questions: "AI Generated Questions",
        patterns: "25+ Design Patterns",
      },
      colorClass: "bg-gradient-to-r from-yellow-500 to-yellow-400",
    },
    {
      id: 5,
      title: "Behavioral Interviews",
      count: "150+",
      icon: <Users size={48} className="text-white" />,
      description: "Prepare for soft skill questions and behavioral scenarios",
      longDescription:
        "This section helps you prepare for behavioral interviews by focusing on leadership, communication, teamwork, and real-life problem-solving scenarios using the STAR method.",
      topics: [
        { name: "Leadership Questions", count: 30 },
        { name: "Conflict Resolution", count: 35 },
        { name: "Project Management", count: 25 },
        { name: "Team Collaboration", count: 30 },
        { name: "STAR Method Responses", count: 30 },
      ],
      stats: {
        questions: "AI Generated Questions",
        categories: "12+ Categories",
      },
      colorClass: "bg-gradient-to-r from-pink-500 to-pink-400",
    },
    {
      id: 6,
      title: "Language-Specific",
      count: "250+",
      icon: <BookOpen size={48} className="text-white" />,
      description:
        "Deep dive into programming language specifics and best practices",
      longDescription:
        "Explore individual programming languages in depth, mastering syntax, idiomatic usage, and performance tuning across multiple languages including Python, Java, and Golang.",
      topics: [
        { name: "Python Development", count: 60 },
        { name: "Java Programming", count: 55 },
        { name: "JavaScript Mastery", count: 50 },
        { name: "Golang Essentials", count: 45 },
        { name: "C# & .NET Framework", count: 40 },
      ],
      stats: {
        questions: "AI Generated Questions",
        languages: "8+ Languages",
      },
      colorClass: "bg-gradient-to-r from-cyan-500 to-cyan-400",
    },
  ];

  const filteredCategories = categories.filter(
    (category) =>
      category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.topics.some((topic) =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleCategoryClick = (category) => {
    const serializableCategory = { ...category };
    delete serializableCategory.icon;

    navigate("/interview-questions", {
      state: { category: serializableCategory },
    });
  };

  return (
    <div className={`min-h-screen ${darkMode ? "text-white" : "text-black"} `}>
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">Interview Preparation Hub</h1>
        <p className="text-xl">
          Master the art of technical interviews with our comprehensive
          resources
        </p>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold  mb-3">
            Explore Interview Categories
          </h2>
          <p className=" text-lg">
            Choose from our wide range of interview preparation resources
            tailored for different roles and technologies
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-12 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for topics, questions, or technologies..."
              className="w-full px-6 py-4 rounded-full border-2 border-slate-200 focus:border-blue-500 focus:outline-none "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-4 top-4 bg-blue-500 text-white p-2 rounded-full">
              <Search size={20} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg cursor-pointer"
            >
              <div
                className={`${category.colorClass} p-8 flex justify-center items-center`}
              >
                {category.icon}
              </div>
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <h3 className="text-xl font-bold text-slate-800">
                    {category.title}
                  </h3>
                  <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </div>
                <p className="text-slate-600 mb-4">{category.description}</p>

                <ul className="space-y-2 mb-6">
                  {category.topics.slice(0, 5).map((topic, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-500 mr-2 font-bold">•</span>
                      <span className="text-slate-700">{topic.name}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex justify-between text-sm text-slate-500 mb-4">
                  <span>{category.stats.questions}</span>
                  <span>
                    {category.stats.frameworks ||
                      category.stats.difficulty ||
                      category.stats.patterns ||
                      category.stats.categories ||
                      category.stats.languages}
                  </span>
                </div>

                <button
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200"
                  onClick={() => handleCategoryClick(category)}
                >
                  Explore {category.title}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}