import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { ProgressContext } from "../context/ProgressContext";

export default function CourseRoadmap() {
  const { courseName } = useParams();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { trackModuleView, trackTopicView } = useContext(ProgressContext);
  const darkMode = theme === "dark";

  const [selectedModule, setSelectedModule] = useState(null);
  const [courseType, setCourseType] = useState(courseName || "");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [aiEnhancedContent, setAiEnhancedContent] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [error, setError] = useState(null);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [courses, setCourses] = useState(() => {
    // Load courses from localStorage on mount
    const savedCourses = localStorage.getItem('roadmapCourses');
    return savedCourses ? JSON.parse(savedCourses) : {};
  });
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  const [courseInput, setCourseInput] = useState("");
  const [availableCourses, setAvailableCourses] = useState(() => {
    // Load available courses from localStorage on mount
    const savedAvailableCourses = localStorage.getItem('availableCourses');
    return savedAvailableCourses ? JSON.parse(savedAvailableCourses) : [];
  });
  
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
  const MODEL_ID = "gemini-2.0-flash";
  const GENERATE_CONTENT_API = "generateContent";
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:${GENERATE_CONTENT_API}?key=${GEMINI_API_KEY}`;
  
  // YouTube API configuration
  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";

  // Clean up duplicate courses on mount (case-insensitive)
  useEffect(() => {
    const uniqueCourses = [];
    const seenLowercase = new Set();
    
    availableCourses.forEach(course => {
      const lowercase = course.toLowerCase();
      if (!seenLowercase.has(lowercase)) {
        seenLowercase.add(lowercase);
        uniqueCourses.push(course);
      }
    });
    
    if (uniqueCourses.length !== availableCourses.length) {
      setAvailableCourses(uniqueCourses);
    }
  }, []); // Run only once on mount

  // Save courses to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(courses).length > 0) {
      localStorage.setItem('roadmapCourses', JSON.stringify(courses));
    }
  }, [courses]);

  // Save available courses to localStorage whenever they change
  useEffect(() => {
    if (availableCourses.length > 0) {
      localStorage.setItem('availableCourses', JSON.stringify(availableCourses));
    }
  }, [availableCourses]);

  // Update courseType when URL parameter changes
  useEffect(() => {
    if (courseName && courseName.trim()) {
      const courseKey = courseName.toLowerCase().replace(/\s+/g, "");
      setCourseType(courseKey);
      // Only add to availableCourses if not already present
      setAvailableCourses((prev) => {
        if (!prev.includes(courseKey)) {
          return [...prev, courseKey];
        }
        return prev;
      });
    }
  }, [courseName]);

  // Load initial course data only if courseName is provided from URL
  useEffect(() => {
    if (courseType && !courses[courseType]) {
      generateCourseData(courseType);
    }
    // Only depend on courseType to avoid infinite loop
    // eslint-disable-next-line
  }, [courseType]);

  const handleCourseSubmit = async (e) => {
    e.preventDefault(); // Prevent form reload
    if (courseInput.trim()) {
      // Normalize: lowercase and remove extra spaces, keep single spaces
      const normalizedInput = courseInput.trim().toLowerCase();
      const courseKey = normalizedInput.replace(/\s+/g, "");
      
      // Check if course already exists (case-insensitive)
      const alreadyExists = availableCourses.some(
        course => course.toLowerCase() === courseKey.toLowerCase()
      );
      
      if (!alreadyExists) {
        await generateCourseData(courseKey);
        setAvailableCourses((prev) => {
          // Double-check before adding to prevent race conditions
          const exists = prev.some(
            course => course.toLowerCase() === courseKey.toLowerCase()
          );
          if (!exists) {
            return [...prev, courseKey];
          }
          return prev;
        });
      } else if (!courses[courseKey]) {
        // Course tab exists but data doesn't - regenerate
        await generateCourseData(courseKey);
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

    // Create a properly formatted display name (capitalize first letter of each word)
    const displayName = courseName
      .split(/(?=[A-Z])|[\s-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    try {
      const prompt = `Generate a comprehensive, structured roadmap for a course on ${displayName}. 
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

  // Fetch YouTube videos for a given search query
  const fetchYouTubeVideos = async (searchQuery) => {
    setIsLoadingVideos(true);
    console.log("Fetching YouTube videos for:", searchQuery);
    console.log("YouTube API Key:", YOUTUBE_API_KEY ? "Present" : "Missing");
    
    try {
      const url = `${YOUTUBE_API_URL}?part=snippet&maxResults=6&q=${encodeURIComponent(
        searchQuery + " tutorial"
      )}&type=video&key=${YOUTUBE_API_KEY}`;
      
      console.log("API URL:", url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log("YouTube API Response:", data);
      
      if (data.error) {
        console.error("YouTube API Error:", data.error);
        setYoutubeVideos([]);
      } else if (data.items) {
        console.log("Found videos:", data.items.length);
        setYoutubeVideos(data.items);
      } else {
        console.log("No items in response");
        setYoutubeVideos([]);
      }
    } catch (error) {
      console.error("Error fetching YouTube videos:", error);
      setYoutubeVideos([]);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Handle module selection
  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setSelectedTopic(null); // Reset topic selection when a new module is selected
    
    // Fetch YouTube videos for this module
    const searchQuery = `${courses[courseType]?.title || courseType} ${module.title}`;
    fetchYouTubeVideos(searchQuery);
    
    // Track module view in progress
    if (courseType) {
      trackModuleView(courseType, module.id, module.title);
    }
  };

  // Handle topic selection
  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    
    // Fetch YouTube videos for this specific topic
    if (selectedModule) {
      const searchQuery = `${courses[courseType]?.title || courseType} ${selectedModule.title} ${topic}`;
      fetchYouTubeVideos(searchQuery);
    }
    
    // Track topic view in progress
    if (courseType && selectedModule) {
      trackTopicView(courseType, selectedModule.id, selectedModule.title, topic);
    }
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
        return { from: "#34d399", to: "#059669" }; // emerald-400 to emerald-600
      case "Intermediate":
        return { from: "#38bdf8", to: "#0284c7" }; // sky-400 to sky-600
      case "Advanced":
        return { from: "#818cf8", to: "#4338ca" }; // indigo-400 to indigo-700
      default:
        return { from: "#9ca3af", to: "#4b5563" }; // gray-400 to gray-600
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
                          <stop offset="0%" stopColor={nodeBgGradient.from} />
                          <stop offset="100%" stopColor={nodeBgGradient.to} />
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
                        stroke={selectedModule?.id === module.id ? "#fbbf24" : "transparent"}
                        strokeWidth={selectedModule?.id === module.id ? "3" : "0"}
                        className="transition-all duration-300 ease-in-out"
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

    let html = markdown;

    // Convert headers with modern styling
    html = html
      .replace(
        /^#### (.*)$/gm,
        '<h4 class="text-base font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-100">$1</h4>'
      )
      .replace(
        /^### (.*)$/gm,
        '<h3 class="text-lg font-bold mt-5 mb-3 text-gray-900 dark:text-white">$1</h3>'
      )
      .replace(
        /^## (.*)$/gm, 
        '<h2 class="text-xl font-bold mt-6 mb-4 pb-2 text-gray-900 dark:text-white border-b-2 border-indigo-500/30">$1</h2>'
      )
      .replace(
        /^# (.*)$/gm,
        '<h1 class="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">$1</h1>'
      );

    // Convert bold and italic with better contrast
    html = html
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="font-bold text-indigo-600 dark:text-indigo-400 italic">$1</strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>')
      .replace(/__(.+?)__/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
      .replace(/_(.+?)_/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>');

    // Convert code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, lang, code) {
      return `<pre class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4 overflow-x-auto"><code class="text-sm text-gray-800 dark:text-gray-200">${code.trim()}</code></pre>`;
    });

    // Convert inline code
    html = html.replace(/`([^`]+)`/g, '<code class="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-sm font-mono">$1</code>');

    // Convert ordered lists with better spacing
    html = html.replace(/(?:^|\n)(\d+\..+(?:\n(?!\n)\d+\..+)*)/gm, function (match) {
      const items = match
        .trim()
        .split(/\n(?=\d+\.)/)
        .map((line) => {
          const content = line.replace(/^\d+\.\s*/, "").trim();
          return `<li class="mb-3 pl-2 text-gray-700 dark:text-gray-300">${content}</li>`;
        })
        .join("");
      return `<ol class="list-decimal list-outside mb-6 ml-6 space-y-2 text-gray-700 dark:text-gray-300">${items}</ol>`;
    });

    // Convert unordered lists with better spacing
    html = html.replace(/(?:^|\n)([-*]\s.+(?:\n(?!\n)[-*]\s.+)*)/gm, function (match) {
      const items = match
        .trim()
        .split(/\n(?=[-*]\s)/)
        .map((line) => {
          const content = line.replace(/^[-*]\s/, "").trim();
          return `<li class="mb-3 pl-2 text-gray-700 dark:text-gray-300">${content}</li>`;
        })
        .join("");
      return `<ul class="list-disc list-outside mb-6 ml-6 space-y-2 text-gray-700 dark:text-gray-300">${items}</ul>`;
    });

    // Convert blockquotes
    html = html.replace(/^>\s*(.+)$/gm, '<blockquote class="border-l-4 border-indigo-500 pl-4 py-2 mb-4 italic text-gray-700 dark:text-gray-300 bg-indigo-50/50 dark:bg-indigo-900/20">$1</blockquote>');

    // Convert horizontal rules
    html = html.replace(/^---$/gm, '<hr class="my-6 border-gray-300 dark:border-gray-700" />');

    // Convert links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>');

    // Convert paragraphs (lines not already in a block element)
    html = html.replace(
      /^(?!<[h|ul|ol|li|p|blockquote|pre|hr])(.+)$/gm,
      '<p class="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">$1</p>'
    );

    return html;
  };

  return (
    <div className={`min-h-screen pb-20 ${darkMode ? "bg-slate-900" : "bg-gray-50"}`}>
      {/* Modern Header Section */}
      <div className={`${darkMode ? "bg-slate-800" : "bg-white"} shadow-lg mb-6`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Course Roadmap
              </span>
            </h1>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Generate or explore comprehensive learning paths
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleCourseSubmit} className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  className={`w-full h-12 pl-4 pr-10 rounded-xl border-2 transition-all ${
                    darkMode
                      ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-indigo-500"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500"
                  } focus:ring-2 focus:ring-indigo-500/20 outline-none`}
                  type="text"
                  placeholder="Enter course name (e.g., Machine Learning, JavaScript)"
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value)}
                />
                {courseInput && (
                  <button
                    type="button"
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
                      darkMode ? "hover:bg-slate-600" : "hover:bg-gray-100"
                    }`}
                    onClick={() => setCourseInput("")}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoadingCourse}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {isLoadingCourse ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Generate Course
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className={`p-4 rounded-xl mb-4 flex items-start gap-3 ${
              darkMode ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"
            }`}>
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-600 dark:text-red-400 text-sm">{error}</span>
            </div>
          )}

          {/* Course Info Card */}
          {courses[courseType] && (
            <div className={`p-6 rounded-xl shadow-lg ${darkMode ? "bg-slate-700" : "bg-gradient-to-r from-indigo-50 to-purple-50"}`}>
              <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                {courses[courseType].title}
              </h2>
              <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {courses[courseType].description}
              </p>
            </div>
          )}

          {/* Available Courses Tabs */}
          {availableCourses.length > 0 && (
            <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
              {availableCourses.map((course) => {
                // Format course name for display (capitalize first letter of each word)
                const displayName = courses[course]?.title || 
                  course.split(/(?=[A-Z])|[\s-]+/)
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
                
                return (
                  <button
                    key={course}
                    onClick={() => setCourseType(course)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                      courseType === course
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : darkMode
                        ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {displayName}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Roadmap Visualization - Left Side (wider) */}
          <div className="xl:col-span-3">
            <div className={`rounded-2xl shadow-lg p-6 ${darkMode ? "bg-slate-800" : "bg-white"}`}>
              {/* Header */}
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Learning Path
                  </h2>
                  <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Click on modules to explore topics
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                    <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Beginner</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-sky-400"></span>
                    <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Intermediate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                    <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Advanced</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              {isLoadingCourse ? (
                <div className="flex justify-center items-center h-96">
                  <div className="flex flex-col items-center">
                    <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      Generating course roadmap...
                    </p>
                  </div>
                </div>
              ) : courses[courseType] ? (
                <div className="overflow-x-auto">
                  {renderRoadmap()}
                </div>
              ) : (
                <div className="text-center py-20">
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Enter a course name above to generate a learning roadmap
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Module Details Sidebar - Right Side */}
          <div className="xl:col-span-1">
            <div className={`rounded-2xl shadow-lg p-6 sticky top-6 ${darkMode ? "bg-slate-800" : "bg-white"}`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                Module Details
              </h2>

              {selectedModule ? (
                <div className="space-y-4">
                  {/* Module Title & Description */}
                  <div>
                    <h3 className={`text-lg font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {selectedModule.title}
                    </h3>
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {selectedModule.description}
                    </p>
                  </div>

                  {/* Difficulty & Duration */}
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold text-white ${getNodeColor(selectedModule.difficulty)}`}>
                      {selectedModule.difficulty}
                    </span>
                    <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {selectedModule.duration}
                    </span>
                  </div>

                  {/* Topics */}
                  <div>
                    <h4 className={`font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Topics Covered:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedModule.topics.map((topic, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleTopicSelect(topic)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedTopic === topic
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                              : darkMode
                              ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prerequisites */}
                  {selectedModule.prerequisites?.length > 0 && (
                    <div>
                      <h4 className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                        Prerequisites:
                      </h4>
                      <ul className={`space-y-1 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {selectedModule.prerequisites.map((prereqId) => {
                          const prereq = courses[courseType]?.modules.find((m) => m.id === prereqId);
                          return prereq && <li key={prereqId}>{prereq.title}</li>;
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Back Button */}
                  {selectedTopic && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setSelectedTopic(null)}
                        className={`text-sm font-medium transition-colors ${
                          darkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"
                        }`}
                      >
                        ← Back to module overview
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className={`text-sm text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Select a module from the roadmap to view details
                </p>
              )}
            </div>
          </div>
        </div>

        {/* YouTube Videos Section */}
        {selectedModule && (
          <div className={`rounded-2xl shadow-lg p-6 mt-6 ${darkMode ? "bg-slate-800" : "bg-white"}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold flex items-center ${darkMode ? "text-white" : "text-gray-900"}`}>
                <svg className="w-6 h-6 mr-2 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Related Video Tutorials
              </h2>
              {selectedTopic && (
                <span className={`text-sm px-3 py-1 rounded-lg ${darkMode ? "bg-slate-700 text-gray-300" : "bg-gray-100 text-gray-700"}`}>
                  {selectedTopic}
                </span>
              )}
            </div>

            {isLoadingVideos ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className={`w-full h-48 rounded-lg mb-2 ${darkMode ? "bg-slate-700" : "bg-gray-200"}`}></div>
                    <div className={`h-4 rounded w-3/4 mb-2 ${darkMode ? "bg-slate-700" : "bg-gray-200"}`}></div>
                    <div className={`h-3 rounded w-1/2 ${darkMode ? "bg-slate-700" : "bg-gray-200"}`}></div>
                  </div>
                ))}
              </div>
            ) : youtubeVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {youtubeVideos.map((video) => (
                  <a
                    key={video.id.videoId}
                    href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 ${
                      darkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-white hover:shadow-xl border border-gray-200"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative overflow-hidden">
                      <img
                        src={video.snippet.thumbnails.medium.url}
                        alt={video.snippet.title}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-red-600 rounded-full p-4">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Video Info */}
                    <div className="p-4">
                      <h3 className={`font-semibold text-sm mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}>
                        {video.snippet.title}
                      </h3>
                      <p className={`text-xs mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {video.snippet.channelTitle}
                      </p>
                      <p className={`text-xs line-clamp-2 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                        {video.snippet.description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  No videos found. Try selecting a different module or topic.
                </p>
              </div>
            )}
          </div>
        )}

        {/* AI-Enhanced Content Section */}
        <div className={`rounded-2xl shadow-lg p-6 mt-6 ${darkMode ? "bg-slate-800" : "bg-white"}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              {selectedTopic ? `${selectedTopic} - AI Insights` : "AI-Enhanced Content"}
              <span className={`ml-2 text-xs font-normal ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                powered by Gemini 2.0
              </span>
            </h3>
            {isLoadingAI && (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-indigo-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Loading insights...
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className={`p-4 rounded-lg mb-4 ${darkMode ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-700"}`}>
              {error}
            </div>
          )}

          {isLoadingAI ? (
            <div className="space-y-4 animate-pulse">
              <div className={`h-6 rounded-lg ${darkMode ? "bg-slate-700" : "bg-gray-200"} w-3/4`}></div>
              <div className={`h-4 rounded ${darkMode ? "bg-slate-700" : "bg-gray-200"} w-full`}></div>
              <div className={`h-4 rounded ${darkMode ? "bg-slate-700" : "bg-gray-200"} w-5/6`}></div>
              <div className={`h-4 rounded ${darkMode ? "bg-slate-700" : "bg-gray-200"} w-4/5`}></div>
              <div className={`h-6 rounded-lg ${darkMode ? "bg-slate-700" : "bg-gray-200"} w-2/3 mt-6`}></div>
              <div className={`h-4 rounded ${darkMode ? "bg-slate-700" : "bg-gray-200"} w-full`}></div>
              <div className={`h-4 rounded ${darkMode ? "bg-slate-700" : "bg-gray-200"} w-11/12`}></div>
            </div>
          ) : aiEnhancedContent ? (
            <div className={`prose prose-sm md:prose-base max-w-none ${darkMode ? "prose-invert" : ""}`}>
              <div
                className="markdown-content"
                dangerouslySetInnerHTML={{
                  __html: convertMarkdownToHTML(aiEnhancedContent),
                }}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                {selectedTopic ? "AI Insights Ready" : "No Content Selected"}
              </p>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {selectedTopic
                  ? `Click on a topic to view AI insights about ${selectedTopic}`
                  : "Select a module and topic to view AI-enhanced content"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 