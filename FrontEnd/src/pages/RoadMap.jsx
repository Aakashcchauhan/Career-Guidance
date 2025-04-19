import React, { useState, useEffect,useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
export default function CourseRoadmap({course}) {


const { theme, toggleTheme } = useContext(ThemeContext);
  const darkMode = theme === "dark";

  const [selectedModule, setSelectedModule] = useState(null);
  const [courseType, setCourseType] = useState(course);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [aiEnhancedContent, setAiEnhancedContent] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState({});
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  const [courseInput, setCourseInput] = useState("");
  const [availableCourses, setAvailableCourses] = useState([courseType]);
  
  const GEMINI_API_KEY = "AIzaSyAFVcGHtQs1YfEVgXZbxkPYUa-oqX-lRVA"; 
  const MODEL_ID = "gemini-2.0-flash";
  const GENERATE_CONTENT_API = "generateContent";
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:${GENERATE_CONTENT_API}?key=${GEMINI_API_KEY}`;

  useEffect(() => {
    setCourseType(course);
  }, [course]);

  // Load initial course data
  useEffect(() => {
    if (!courses[courseType]) {
      generateCourseData(courseType);
    }
    // Only depend on courseType to avoid infinite loop
    // eslint-disable-next-line
  }, [courseType]);

  const handleCourseSubmit = async (e) => {
    e.preventDefault(); // Prevent form reload
    if (courseInput.trim()) {
      const courseKey = courseInput.toLowerCase().replace(/\s+/g, "");
      if (!availableCourses.includes(courseKey)) {
        await generateCourseData(courseKey);
        setAvailableCourses((prev) => [...prev, courseKey]);
      }
      setCourseType(courseKey);
      setCourseInput("");
    }
  };

  const wrapText = (text, maxCharsPerLine) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
  
    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  };
  
  const generateCourseData = async (courseName) => {
    setIsLoadingCourse(true);
    setError(null);

    try {
      const prompt = `Generate a comprehensive, structured roadmap for a course on ${courseName}. 
The output should be in JSON format matching this structure:
{
  "${courseName}": {
    "title": "[Full Course Title]",
    "description": "[Brief course description - one sentence]",
    "modules": [
      {
        "id": 1,
        "title": "[Module Title]",
        "description": "[Brief module description]",
        "topics": ["[Topic 1]", "[Topic 2]", "[Topic 3]", ...],
        "duration": "[X weeks]",
        "difficulty": "[Beginner/Intermediate/Advanced]",
        "prerequisites": [array of module IDs that must be completed first]
      }
    ]
  }
}
Please create an appropriate number of logical modules that form a comprehensive learning path from beginner to advanced. The modules should follow a natural progression with proper prerequisites. Each module should include relevant topics, appropriate duration, and difficulty level.
For prerequisites, use the IDs of modules that must be completed before taking this module. Modules without prerequisites should not include this field.
Make sure the structure exactly matches the provided format as it will be parsed programmatically.
Return only the JSON with no explanations before or after.`;

      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 1,
            maxOutputTokens: 2048,
          },
        }),
      });

      const data = await response.json();

      if (data.candidates && data.candidates.length > 0) {
        const aiMessage = data.candidates[0].content.parts[0].text;
        // Extract JSON from the response (in case there's any extra text)
        const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const courseJson = JSON.parse(jsonMatch[0]);
            setCourses((prevCourses) => ({
              ...prevCourses,
              ...courseJson,
            }));
          } catch (err) {
            setError(
              "Failed to parse course data from API response. Please try again or refine your prompt."
            );
          }
        } else {
          setError(
            "Failed to extract JSON from API response. Please try again or refine your prompt."
          );
        }
      } else if (data.error) {
        setError(data.error.message || "Unknown error occurred");
      } else {
        setError("No response from Gemini API");
      }
    } catch (error) {
      setError(error.message || "Failed to generate course data");
    } finally {
      setIsLoadingCourse(false);
    }
  };

  // Handle module selection
  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setSelectedTopic(null); // Reset topic selection when a new module is selected
  };

  // Handle topic selection
  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
  };

  // Fetch AI-enhanced content when module or topic changes
  useEffect(() => {
    if (selectedModule) {
      if (selectedTopic) {
        fetchAIContent(selectedModule, selectedTopic);
      } else {
        fetchAIContent(selectedModule);
      }
    } else {
      setAiEnhancedContent(null);
    }
  }, [selectedModule, selectedTopic]);

  const fetchAIContent = async (module, topic = null) => {
    setIsLoadingAI(true);
    setError(null);

    try {
      const prompt = generatePrompt(module, courseType, topic);

      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      });

      const data = await response.json();

      if (data.candidates && data.candidates.length > 0) {
        const aiMessage = data.candidates[0].content.parts[0].text;
        setAiEnhancedContent(aiMessage);
      } else if (data.error) {
        setError(data.error.message || "Unknown error occurred");
      } else {
        setError("No response from Gemini API");
      }
    } catch (error) {
      setError(error.message || "Failed to connect to Gemini API");
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Generate the prompt for AI content generation
  const generatePrompt = (module, courseType, topic = null) => {
    if (topic) {
      // Topic-specific prompt
      return `I need detailed information about the "${topic}" topic within the "${
        module.title
      }" module in our ${courses[courseType]?.title || courseType} course.
      
      This is part of a module that covers: ${module.topics.join(", ")}.
      The overall module is a ${module.difficulty} level module that takes ${
        module.duration
      } to complete.
      
      Please provide:
      1. A comprehensive explanation of ${topic}
      2. Key concepts and fundamentals of ${topic}
      3. Practical applications of ${topic} in real-world scenarios
      4. Common challenges when learning ${topic} and how to overcome them
      5. Resources specifically for learning ${topic} (books, courses, tutorials)
      6. Best practices when working with ${topic}
      7. Keep it Short and Concise.
      8. Use bullet points for clarity.
      
      Format the response in markdown with clear headings.`;
    } else {
      // Module-level prompt
      return `I need detailed information about the "${
        module.title
      }" module in our ${courses[courseType]?.title || courseType} course. 
      
      This module covers: ${module.topics.join(", ")}. 
      It is a ${module.difficulty} level module that takes ${
        module.duration
      } to complete.
      
     Please provide a detailed and structured explanation of [TOPIC]. Include the following:

1. **Comprehensive Overview** – Explain the topic clearly with examples if necessary.
2. **Key Concepts** – List and briefly explain 5–7 core ideas or principles.
3. **Practical Applications** – How this topic is used in real-world scenarios or industries.
4. **Skills Acquired** – What specific skills or knowledge one will gain by learning this topic.
5. **Learning Resources** – Recommend top books, courses, or tutorials to explore further.
6. **Challenges & Solutions** – Mention common difficulties learners face and how to tackle them.
7. **Career Relevance** – What roles or fields benefit from understanding this topic.

Format your response in markdown using clear headings and bullet points for readability.
`;
    }
  };

  const getNodeColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-emerald-500";
      case "Intermediate":
        return "bg-sky-500";
      case "Advanced":
        return "bg-indigo-600";
      default:
        return "bg-gray-500";
    }
  };

  const getDifficultyGradient = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "from-emerald-400 to-emerald-600";
      case "Intermediate":
        return "from-sky-400 to-sky-600";
      case "Advanced":
        return "from-indigo-400 to-indigo-700";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  const renderRoadmap = () => {
    const course = courses[courseType];

    if (!course) {
      return <div className="text-center py-10">Loading course data...</div>;
    }

    // Create a mapping of module positions
    const modulePositions = {};
    const levels = {};

    // First pass: determine the level of each module
    course.modules.forEach((module) => {
      if (!module.prerequisites || module.prerequisites.length === 0) {
        levels[module.id] = 0;
      }
    });

    // Iteratively determine levels for modules with prerequisites
    let changed = true;
    while (changed) {
      changed = false;
      course.modules.forEach((module) => {
        if (levels[module.id] !== undefined) return;

        if (!module.prerequisites || module.prerequisites.length === 0) {
          levels[module.id] = 0;
          changed = true;
          return;
        }

        const prereqLevels = (module.prerequisites || [])
          .map((id) => levels[id])
          .filter((level) => level !== undefined);

        if (prereqLevels.length === (module.prerequisites || []).length) {
          levels[module.id] = Math.max(...prereqLevels) + 1;
          changed = true;
        }
      });
    }

    // Second pass: position modules on the canvas
    course.modules.forEach((module) => {
      const level = levels[module.id] || 0; // Default to level 0 if undefined
      const levelModules = course.modules.filter((m) => (levels[m.id] || 0) === level);
      const indexInLevel = levelModules.findIndex((m) => m.id === module.id);

      modulePositions[module.id] = {
        x: 10 + level * 220,
        y: 100 + indexInLevel * 140,
      };
    });

    // Draw connections
    const connections = [];
    course.modules.forEach((module) => {
      if (module.prerequisites) {
        module.prerequisites.forEach((prereqId) => {
          const start = modulePositions[prereqId];
          const end = modulePositions[module.id];

          if (start && end) {
            connections.push({
              id: `${prereqId}-${module.id}`,
              x1: start.x + 85, // center of node
              y1: start.y + 50,
              x2: end.x,
              y2: end.y + 25,
            });
          }
        });
      }
    });

    return (
      <div className="relative w-full overflow-x-auto pb-10">
        <svg
          className="min-w-max"
          style={{
            height: `${
              Math.max(...Object.values(modulePositions).map((p) => p.y), 0) + 150
            }px`,
            width: `${
              Math.max(...Object.values(modulePositions).map((p) => p.x), 0) + 250
            }px`,
          }}
        >
          {/* Draw connections */}
          {connections.map((conn) => (
            <g key={conn.id}>
              <defs>
                <linearGradient id={`gradient-${conn.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
              </defs>
              <path
                d={`M${conn.x1},${conn.y1} C${conn.x1 + 60},${conn.y1} ${
                  conn.x2 - 60
                },${conn.y2} ${conn.x2},${conn.y2}`}
                fill="none"
                stroke={`url(#gradient-${conn.id})`}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="0"
                className="transition-all duration-500 ease-in-out"
              />
              <polygon
                points={`${conn.x2},${conn.y2} ${conn.x2 - 8},${conn.y2 - 4} ${
                  conn.x2 - 8
                },${conn.y2 + 4}`}
                fill="#64748b"
                className="transition-all duration-300"
              />
            </g>
          ))}

          {/* Draw modules */}
          {course.modules.map((module) => {
            const pos = modulePositions[module.id];
            if (!pos) return null;
            const nodeBgGradient = getDifficultyGradient(module.difficulty);

            return (
              <g
                key={module.id}
                className="cursor-pointer"
                onClick={() => handleModuleSelect(module)}
              >
                {(() => {
                  const lines = wrapText(module.title, 16);
                  const lineHeight = 18;
                  const verticalPadding = 12;
                  const rectHeight = Math.max(60, lines.length * lineHeight + verticalPadding * 2);

                  return (
                    <>
                      <defs>
                        <linearGradient id={`gradient-${module.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" className={`${nodeBgGradient.split(" ")[0]}`} />
                          <stop offset="100%" className={`${nodeBgGradient.split(" ")[1]}`} />
                        </linearGradient>
                        <filter id={`shadow-${module.id}`} x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00000033" />
                        </filter>
                      </defs>
                      <rect
                        x={pos.x}
                        y={pos.y}
                        width="170"
                        height={rectHeight}
                        rx="10"
                        fill={`url(#gradient-${module.id})`}
                        filter={`url(#shadow-${module.id})`}
                        className={`transition-all duration-300 ease-in-out ${
                          selectedModule?.id === module.id
                            ? "stroke-amber-400 stroke-3"
                            : "stroke-transparent"
                        }`}
                      />
                      <text
                        x={pos.x + 85}
                        y={pos.y + verticalPadding + lineHeight / 2}
                        textAnchor="middle"
                        className="fill-white text-sm font-medium"
                      >
                        {lines.map((line, i) => (
                          <tspan
                            key={i}
                            x={pos.x + 85}
                            dy={i === 0 ? 0 : lineHeight}
                            className="text-white font-medium"
                          >
                            {line}
                          </tspan>
                        ))}
                      </text>
                    </>
                  );
                })()}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // Enhanced markdown to HTML converter with better styling
  const convertMarkdownToHTML = (markdown) => {
    if (!markdown) return "";

    // Convert headers
    let html = markdown
      .replace(
        /^### (.*)$/gm,
        '<h3 class="text-lg font-semibold mt-4 mb-2 text-black dark:text-white">$1</h3>'
      )
      .replace(
        /^## (.*)$/gm, 
        '<h2 class="text-xl font-bold mt-5 mb-3 text-black dark:text-white pb-1 border-b border-indigo-200 dark:border-indigo-800">$1</h2>'
      );

    // Convert bold and italic
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-gray-700 dark:text-gray-300 italic">$1</em>');

    // Convert ordered lists
    html = html.replace(/(^|\n)(\d+\..*(\n\d+\..*)*)/g, function (match) {
      const items = match
        .trim()
        .split("\n")
        .map((line) => line.replace(/^\d+\.\s*/, "").trim())
        .map((item) => `<li class="mb-1">${ item }</li>`)
        .join("");
      return `<ol class="list-decimal mb-4 ml-5 space-y-1">${ items }</ol>`;
    });

    // Convert unordered lists
    html = html.replace(/(^|\n)(-\s.*(\n-\s.*)*)/g, function (match) {
      const items = match
        .trim()
        .split("\n")
        .map((line) => line.replace(/^- /, "").trim())
        .map((item) => `<li class="mb-1">${ item }</li>`)
        .join("");
      return `<ul class="list-disc mb-4 ml-5 space-y-1">${ items }</ul>`;
    });

    // Convert paragraphs (lines not already in a block element)
    html = html.replace(
      /^(?!<h|<ul|<ol|<li|<p|<strong|<em)(.+)$/gm,
      '<p class="mb-3 text-gray-700 dark:text-gray-300">$1</p>'
    );

    return html;
  };

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? "bg-slate-900 text-slate-200" : "bg-slate-50 text-slate-800 " }`}>
      {/* Header Section with Gradient */}
      <div className="bg- shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
          <form onSubmit={handleCourseSubmit} className="mb-5">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="relative flex-grow">
                <input
                  className="w-full border-0 rounded-lg h-12 pl-4 pr-10 shadow-md outline-none focus:ring-2 focus:ring-indigo-300 transition-all "
                  type="text"
                  placeholder="Enter a course name (e.g., Machine Learning, JavaScript)"
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value)}
                  aria-label="Course name"
                />
                {courseInput && (
                  <button
                    type="button" 
                    className="absolute right-3 top-4 "
                    onClick={() => setCourseInput("")}
                    aria-label="Clear input"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-700 dark:focus:ring-offset-slate-900"
                disabled={isLoadingCourse}
              >
                {isLoadingCourse ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  <>
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Generate Course
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg text-red-600 dark:text-red-600 text-sm mb-4 shadow-sm border border-red-200 dark:border-red-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {courses[courseType] && (
            <div className=" backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <h1 className="text-2xl font-bold ">
                {courses[courseType].title}
              </h1>
              <p className="mt-1 italic">
                {courses[courseType].description}
              </p>
            </div>
          )}

          <div className="mt-5 flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-transparent">
            {availableCourses.map((course) => (
              <button
                key={course}
                onClick={() => setCourseType(course)}
                className={`px-4 py-2 rounded-md transition-all duration-300 flex-shrink-0 font-medium ${
                  courseType === course
                    ? "shadow-md transform -translate-y-0.5"
                    : " hover:bg-white/80 dark:bg-slate-700 dark:hover:bg-slate-700/80 text-slate-700 dark:text-white"
                }`}
              >
                {courses[course]?.title || course}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row font-sans ">
  <div className="w-full md:w-3/4 p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 overflow-x-auto">
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 sm:mb-0">
          Learning Path Visualization
        </h2>
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <span className="w-3 h-3 rounded-full bg-green-400 inline-block mr-2"></span>
            Beginner
          </span>
          <span className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <span className="w-3 h-3 rounded-full bg-blue-400 inline-block mr-2"></span>
            Intermediate
          </span>
          <span className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block mr-2"></span>
            Advanced
          </span>
        </div>
      </div>

      {isLoadingCourse ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-400">Generating course roadmap...</p>
          </div>
        </div>
      ) : courses[courseType] ? (
        renderRoadmap()
      ) : (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          Enter a course name to generate a roadmap
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
        Click on any module to view details
      </p>
    </div>
  </div>

  <div className="w-full md:w-1/4 p-4">
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 h-full overflow-y-auto max-h-screen">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Module Details</h2>

      {selectedModule ? (
        <div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-2">{selectedModule.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{selectedModule.description}</p>

          <div className="mb-4 flex items-center text-sm">
            <span
              className={`inline-block px-2 py-1 rounded-full text-white text-xs font-medium ${getNodeColor(
                selectedModule.difficulty
              )}`}
            >
              {selectedModule.difficulty}
            </span>
            <span className="ml-3 text-gray-500 dark:text-gray-400">{selectedModule.duration}</span>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-gray-800 dark:text-white mb-2">Topics Covered:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedModule.topics.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTopicSelect(topic)}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                    selectedTopic === topic
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {selectedModule.prerequisites?.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">Prerequisites:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                {selectedModule.prerequisites.map((prereqId) => {
                  const prereq = courses[courseType]?.modules.find((m) => m.id === prereqId);
                  return prereq && <li key={prereqId}>{prereq.title}</li>;
                })}
              </ul>
            </div>
          )}

          {selectedTopic && (
            <div className="mt-4">
              <button
                onClick={() => setSelectedTopic(null)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                « Back to module overview
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select a module from the roadmap to view details
        </p>
      )}
    </div>
  </div>
</div>

<div className="mt-6 border-t pt-6 dark:border-gray-700 px-6">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-semibold">
      {selectedTopic ? `${selectedTopic} - AI Insights` : "AI-Enhanced Content"}
      <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
        powered by Gemini 2.0
      </span>
    </h3>
    {isLoadingAI && (
      <div className="flex items-center">
        <svg className="animate-spin h-5 w-5 mr-2 " viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span className="text-sm text-gray-500 dark:text-gray-400">Loading insights...</span>
      </div>
    )}
  </div>

  {error && (
    <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded text-red-700 dark:text-red-700 text-sm mb-4">
      {error}
    </div>
  )}

  {isLoadingAI ? (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
  ) : aiEnhancedContent ? (
    <div className="prose prose-sm dark:prose-invert text-black max-w-none">
      <div
        dangerouslySetInnerHTML={{
          __html: convertMarkdownToHTML(aiEnhancedContent),
        }}
      />
    </div>
  ) : (
    <p className="text-sm text-gray-500 dark:text-gray-400">
      {selectedTopic
        ? `Click on a topic to view AI insights about ${selectedTopic}`
        : "Select a module to view AI-enhanced content"}
    </p>
  )}
</div>
</div>
  ); } 