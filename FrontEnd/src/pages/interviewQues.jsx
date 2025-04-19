import React, { useState, useEffect, useContext } from 'react';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Star,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext'; // Import the ThemeContext

const GEMINI_API_KEY = import.meta.env.AI_API_KEY;
const MODEL_ID = "gemini-pro";
const GENERATE_CONTENT_API = "generateContent";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL_ID}:${GENERATE_CONTENT_API}?key=${GEMINI_API_KEY}`;

export default function CategoryDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const category = location.state?.category;
  const { theme, toggleTheme } = useContext(ThemeContext); // Use the ThemeContext

  const [activeTab, setActiveTab] = useState('questions');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [apiResponseLog, setApiResponseLog] = useState(null);

  // Sample questions for fallback
  const sampleQuestions = [
    {
      id: 'sample-1',
      title: 'Implement a Binary Search Tree',
      description: 'Create a complete implementation of a binary search tree with insert, delete and search operations.',
      difficulty: 'medium',
      timeEstimate: '45 mins',
      companies: ['Google', 'Microsoft'],
      solution: '// Complete binary search tree implementation\n\nclass Node {\n  constructor(value) {\n    this.value = value;\n    this.left = null;\n    this.right = null;\n  }\n}\n\nclass BinarySearchTree {\n  constructor() {\n    this.root = null;\n  }\n  \n  insert(value) {\n    const newNode = new Node(value);\n    \n    if (!this.root) {\n      this.root = newNode;\n      return this;\n    }\n    \n    let current = this.root;\n    \n    while (true) {\n      if (value === current.value) return undefined;\n      if (value < current.value) {\n        if (!current.left) {\n          current.left = newNode;\n          return this;\n        }\n        current = current.left;\n      } else {\n        if (!current.right) {\n          current.right = newNode;\n          return this;\n        }\n        current = current.right;\n      }\n    }\n  }\n  \n  find(value) {\n    if (!this.root) return false;\n    \n    let current = this.root;\n    let found = false;\n    \n    while (current && !found) {\n      if (value < current.value) {\n        current = current.left;\n      } else if (value > current.value) {\n        current = current.right;\n      } else {\n        found = true;\n      }\n    }\n    \n    if (!found) return false;\n    return current;\n  }\n}\n',
      topic: 'Data Structures'
    },
    {
      id: 'sample-2',
      title: 'Implement Merge Sort',
      description: 'Write a function that sorts an array using the merge sort algorithm.',
      difficulty: 'medium',
      timeEstimate: '30 mins',
      companies: ['Amazon', 'Facebook'],
      solution: '// Merge sort implementation\n\nfunction mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  \n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  \n  return merge(left, right);\n}\n\nfunction merge(left, right) {\n  let result = [];\n  let leftIndex = 0;\n  let rightIndex = 0;\n  \n  while (leftIndex < left.length && rightIndex < right.length) {\n    if (left[leftIndex] < right[rightIndex]) {\n      result.push(left[leftIndex]);\n      leftIndex++;\n    } else {\n      result.push(right[rightIndex]);\n      rightIndex++;\n    }\n  }\n  \n  return [...result, ...left.slice(leftIndex), ...right.slice(rightIndex)];\n}',
      topic: 'Algorithms'
    }
  ];

  // Function to generate a single question for a topic
  const generateQuestionForTopic = async (topicName) => {
    try {
      console.log(`Generating question for topic: ${topicName}`);
      
      const promptText = `Act as an expert programmer. Generate a programming interview question about the topic "${topicName}". 
Return ONLY a VALID JSON object with this exact format, properly escaped:
{
  "title": "Write a clear, specific question title",
  "description": "Provide a detailed problem description with examples",
  "difficulty": "easy|medium|hard",
  "timeEstimate": "30 mins",
  "companies": ["Google", "Amazon"],
  "solution": "// Detailed solution with complete code and explanation\\n\\nfunction solution() {\\n  // Your code here\\n}"
}`;

      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: promptText
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      });

      // Store response for debugging
      const responseData = await response.json();
      console.log("API Response:", responseData);
      
      if (!response.ok) {
        console.error("API Error:", responseData);
        throw new Error(`API Error: ${response.status}`);
      }
      
      if (!responseData?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error("Invalid API response format:", responseData);
        throw new Error("Invalid API response format");
      }

      // Get the raw text response
      let responseText = responseData.candidates[0].content.parts[0].text;
      console.log("Raw response text:", responseText);
      
      // Remove any markdown formatting
      responseText = responseText.replace(/```json\s*|\s*```/g, '');
      
      try {
        // Try to parse the JSON
        let parsedQuestion;
        
        try {
          // First attempt - try to parse the full response
          parsedQuestion = JSON.parse(responseText.trim());
        } catch (initialError) {
          // Second attempt - try to find a JSON object
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error("No valid JSON found in response");
          }
          
          // Parse the matched JSON
          parsedQuestion = JSON.parse(jsonMatch[0].trim());
        }
        
        // Validate required fields
        if (!parsedQuestion.title || !parsedQuestion.description || !parsedQuestion.solution) {
          throw new Error("Missing required fields in question data");
        }
        
        // Add metadata
        const newQuestion = {
          ...parsedQuestion,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          topic: topicName
        };
        
        console.log("Successfully generated question:", newQuestion);
        return newQuestion;
        
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError);
        throw new Error(`Failed to parse JSON response: ${jsonError.message}`);
      }
      
    } catch (err) {
      console.error(`Error generating question for ${topicName}:`, err);
      // Return a sample question as fallback when API fails
      const fallbackQuestion = {
        ...sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)],
        id: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        topic: topicName
      };
      console.log("Using fallback question:", fallbackQuestion);
      return fallbackQuestion;
    }
  };

  // Function to generate questions for all topics or selected topic
  const generateQuestions = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setError('');
    setApiResponseLog(null);
    const generatedQuestions = [];
    
    try {
      // Determine which topics to use
      const topicsToUse = selectedTopic 
        ? [selectedTopic]
        : (category?.topics?.map(t => typeof t === "string" ? t : t.name) || []);
      
      if (topicsToUse.length === 0) {
        throw new Error("No topics available");
      }
      
      // Process each topic sequentially to avoid rate limiting
      for (const topicName of topicsToUse) {
        try {
          const newQuestion = await generateQuestionForTopic(topicName);
          generatedQuestions.push(newQuestion);
          
          // Update questions immediately as they're generated
          setQuestions(prev => [...prev, newQuestion]);
          
          // Add a small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 800));
          
        } catch (topicError) {
          console.error(`Failed for topic ${topicName}:`, topicError);
          // Add a warning to the UI
          setError(prev => `${prev ? prev + '. ' : ''}Failed to generate question for ${topicName}`);
        }
      }
      
      if (generatedQuestions.length === 0) {
        // If API failed, use sample questions as fallback
        const fallbackQuestions = topicsToUse.map(topic => ({
          ...sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)],
          id: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          topic
        }));
        
        setQuestions(prev => [...prev, ...fallbackQuestions]);
        setError("Could not connect to API. Using sample questions instead.");
      }
      
    } catch (err) {
      console.error("Generation failed:", err);
      setError(err.message || "Failed to generate questions. Please try again later.");
      
      // Use sample questions as fallback
      if (questions.length === 0) {
        setQuestions(sampleQuestions);
        setError("Error connecting to generation API. Using sample questions instead.");
      }
      
      // For debugging, show the last API response
      setApiResponseLog("Check console for detailed error logs.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate a single question when component mounts
  useEffect(() => {
    if (category?.topics?.length > 0 && questions.length === 0 && !isGenerating) {
      // Generate one sample question on page load
      const initialTopic = category.topics[0];
      const topicName = typeof initialTopic === "string" ? initialTopic : initialTopic.name;
      
      setIsGenerating(true);
      generateQuestionForTopic(topicName)
        .then(question => {
          setQuestions([question]);
        })
        .catch(err => {
          console.error("Initial question generation failed:", err);
          // Use a sample question as fallback
          setQuestions([{
            ...sampleQuestions[0],
            id: `initial-${Date.now()}`,
            topic: topicName
          }]);
        })
        .finally(() => {
          setIsGenerating(false);
        });
    }
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter questions
  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = searchQuery === '' ||
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDifficulty = difficultyFilter === 'all' || 
      question.difficulty === difficultyFilter;

    const matchesTopic = !selectedTopic || question.topic === selectedTopic;

    return matchesSearch && matchesDifficulty && matchesTopic;
  });

  // Utility function for difficulty colors
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!category) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`text-center p-8 ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'} rounded-lg shadow-md`}>
          <h2 className="text-2xl font-bold mb-4">Category Not Found</h2>
          <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} mb-6`}>Please select a category from the main page.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header with Theme Toggle */}
      <div className={`${category.colorClass} text-white py-12 px-4`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between mb-6">
            <button
              className="flex items-center border border-white bg-white text-black bg-opacity-20 rounded-full py-1 px-4 text-sm font-medium hover:bg-opacity-30 transition-colors"
              onClick={() => navigate('/Interview')}
            >
              <ArrowLeft size={16} className="mr-1" /> Back to Categories
            </button>
            
            {/* Theme Toggle Button */}
            {/* <button
              onClick={toggleTheme}
              className="flex items-center border border-white  text-black bg-white bg-opacity-20 rounded-full py-1 px-4 text-sm font-medium hover:bg-opacity-30 transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={16} className="mr-1" /> Light Mode
                </>
              ) : (
                <>
                  <Moon size={16} className="mr-1" /> Dark Mode
                </>
              )}
            </button> */}
          </div>

          <h1 className="text-4xl font-bold mb-4">{category.title}</h1>
          <p className="text-xl mb-6 max-w-3xl">{category.longDescription}</p>

          <div className="flex flex-wrap gap-2">
            {category.topics.map((topic, idx) => (
              <span
                key={idx}
                className="border border-white  text-black bg-white bg-opacity-20 rounded-full py-1 px-3 text-sm font-medium"
              >
                {typeof topic === "string" ? topic : topic.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className={`flex border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} mb-8`}>
          <button
            className={`py-3 px-6 font-medium ${
              activeTab === 'questions'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
            }`}
            onClick={() => setActiveTab('questions')}
          >
            Questions ({questions.length})
          </button>
          <button
            className={`py-3 px-6 font-medium ${
              activeTab === 'resources'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
            }`}
            onClick={() => setActiveTab('resources')}
          >
            Resources ({category.resources ? category.resources.length : 0})
          </button>
        </div>

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div>
            {/* Topic Selector and Generate Button */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
              <div className="flex items-center">
                <select
                  className={`px-4 py-2 border ${theme === 'dark' ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-300 bg-white'} rounded`}
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                >
                  <option value="">All Topics</option>
                  {category.topics.map((t, i) => (
                    <option key={i} value={typeof t === "string" ? t : t.name}>
                      {typeof t === "string" ? t : t.name}
                    </option>
                  ))}
                </select>
                <button
                  className="ml-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md flex items-center"
                  disabled={isGenerating}
                  onClick={generateQuestions}
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span> Generating...
                    </>
                  ) : (
                    `Generate Questions${selectedTopic ? ` for ${selectedTopic}` : ''}`
                  )}
                </button>
              </div>
              {error && (
                <div className="text-red-500 bg-red-50 p-2 rounded border border-red-200">
                  {error}
                </div>
              )}
            </div>

            {/* Debug Info - Only shown when there's an error */}
            {apiResponseLog && (
              <div className={`${theme === 'dark' ? 'bg-yellow-900 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border p-4 mb-6 rounded`}>
                <h4 className="font-bold mb-2">Debug Information:</h4>
                <p className="text-sm">{apiResponseLog}</p>
                <p className="text-sm mt-2">
                  Possible issues:
                  <ul className="list-disc pl-5 mt-1">
                    <li>API key might be invalid or expired</li>
                    <li>API rate limits may have been exceeded</li>
                    <li>Response format may have changed</li>
                    <li>Network connectivity issues</li>
                  </ul>
                </p>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search size={18} className={`absolute left-3 top-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search questions..."
                  className={`w-full pl-10 pr-4 py-2 border ${theme === 'dark' ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-200 bg-white'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="relative">
                <div className={`flex items-center border ${theme === 'dark' ? 'border-slate-600 text-slate-200' : 'border-slate-200 text-slate-700'} rounded-lg py-2 px-4 gap-2`}>
                  <Filter size={18} />
                  <select
                    className={`appearance-none bg-transparent focus:outline-none font-medium ${theme === 'dark' ? 'text-white' : ''}`}
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  <ChevronDown size={16} className="ml-2 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((question) => (
                  <div
                    key={question.id}
                    id={question.id}
                    className={`${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-100'} rounded-lg shadow-sm border overflow-hidden`}
                  >
                    <div
                      className={`p-5 cursor-pointer ${theme === 'dark' ? 'hover:bg-slate-600' : 'hover:bg-slate-50'} flex justify-between items-center`}
                      onClick={() =>
                        setExpandedQuestion(
                          expandedQuestion === question.id ? null : question.id
                        )
                      }
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(
                              question.difficulty
                            )}`}
                          >
                            {question.difficulty}
                          </span>
                          <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-500'} text-xs flex items-center gap-1`}>
                            <Clock size={14} /> {question.timeEstimate}
                          </span>
                          {question.companies && question.companies.length > 0 && (
                            <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-500'} text-xs flex items-center gap-1`}>
                              <Star size={14} /> {question.companies.join(', ')}
                            </span>
                          )}
                          <span className="text-blue-500 text-xs bg-blue-50 px-2 py-1 rounded">
                            {question.topic}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold mt-2">{question.title}</h3>
                        <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} mt-1 line-clamp-2`}>{question.description}</p>
                      </div>
                      <ChevronRight
                        size={20}
                        className={`text-slate-400 transition-transform duration-200 ${
                          expandedQuestion === question.id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                    {/* Only show solution if this question is expanded */}
                    {expandedQuestion === question.id && (
                      <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'} px-6 py-4 border-t`}>
                        <h4 className="font-semibold mb-2">Solution:</h4>
                        <pre className={`whitespace-pre-wrap ${theme === 'dark' ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-800'} rounded p-4 overflow-x-auto`}>
                          {question.solution}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className={`text-center py-12 ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-100'} rounded-lg shadow-sm border`}>
                  <div className="mb-4">
                    <BookOpen size={48} className={`mx-auto ${theme === 'dark' ? 'text-slate-500' : 'text-slate-300'}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No questions found</h3>
                  <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-500'} mb-6`}>
                    {questions.length === 0
                      ? "Generate questions using the button above to get started."
                      : "Try changing your search filters to see more questions."}
                  </p>
                  {questions.length === 0 && (
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md"
                      onClick={generateQuestions}
                      disabled={isGenerating}
                    >
                      {isGenerating ? "Generating..." : "Generate Questions"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div>
            <h3 className="text-xl font-bold mb-4">Resources</h3>
            <div className="space-y-4">
              {category.resources && category.resources.length > 0 ? (
                category.resources.map((resource, idx) => (
                  <div
                    key={idx}
                    className={`${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-100'} rounded-lg shadow-sm border p-4`}
                  >
                    <h4 className="font-semibold text-blue-500 mb-1">
                      <a href={resource.link} target="_blank" rel="noopener noreferrer">
                        {resource.title}
                      </a>
                    </h4>
                    <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{resource.description}</p>
                    <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {resource.type}
                    </span>
                  </div>
                ))
              ) : (
                <div className={`text-center ${theme === 'dark' ? 'text-slate-300' : 'text-slate-500'} py-8`}>
                  No resources found for this category.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}