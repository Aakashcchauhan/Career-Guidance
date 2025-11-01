import React, { useContext, useState, useEffect } from "react";
import { ProgressContext } from "../context/ProgressContext";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaBookOpen,
  FaCheckCircle,
  FaFire,
  FaCalendarAlt,
  FaClock,
  FaTrophy,
  FaChartLine,
  FaAward,
  FaStar,
  FaMedal,
  FaGraduationCap,
  FaBrain,
  FaRocket,
} from "react-icons/fa";

export default function Dashboard() {
  const { getAllCoursesProgress, getDailyActivity, progressData, getProgressStats } =
    useContext(ProgressContext);
  const { theme } = useContext(ThemeContext);
  const { userEmail } = useContext(AuthContext);
  const navigate = useNavigate();
  const darkMode = theme === "dark";

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({
    totalModules: 0,
    totalTopics: 0,
    totalCompleted: 0,
    maxStreak: 0,
  });
  
  // Load roadmap courses data from localStorage
  const [roadmapCourses, setRoadmapCourses] = useState(() => {
    const saved = localStorage.getItem('roadmapCourses');
    return saved ? JSON.parse(saved) : {};
  });
  
  // Get courses progress with total modules from roadmap
  const allCoursesProgress = getAllCoursesProgress().map(courseProgress => {
    const courseName = courseProgress.courseName;
    const roadmapCourse = roadmapCourses[courseName];
    const totalModules = roadmapCourse?.modules?.length || 0;
    const courseTitle = roadmapCourse?.title || null;
    
    // Recalculate with actual total modules
    const stats = getProgressStats(courseName, totalModules);
    
    return {
      ...courseProgress,
      totalModules,
      courseTitle,
      progressPercentage: stats.progressPercentage,
    };
  });

  // Calculate overall statistics
  const overallStats = allCoursesProgress.reduce(
    (acc, course) => ({
      totalModules: acc.totalModules + course.modulesViewed,
      totalTopics: acc.totalTopics + course.topicsViewed,
      totalCompleted: acc.totalCompleted + course.completedModules,
      totalDays: Math.max(acc.totalDays, course.daysActive),
      maxStreak: Math.max(acc.maxStreak, course.currentStreak),
      totalCourses: allCoursesProgress.length,
    }),
    {
      totalModules: 0,
      totalTopics: 0,
      totalCompleted: 0,
      totalDays: 0,
      maxStreak: 0,
      totalCourses: 0,
    }
  );

  // Animate numbers on mount
  useEffect(() => {
    const duration = 1000;
    const steps = 50;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedStats({
        totalModules: Math.floor(overallStats.totalModules * progress),
        totalTopics: Math.floor(overallStats.totalTopics * progress),
        totalCompleted: Math.floor(overallStats.totalCompleted * progress),
        maxStreak: Math.floor(overallStats.maxStreak * progress),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats({
          totalModules: overallStats.totalModules,
          totalTopics: overallStats.totalTopics,
          totalCompleted: overallStats.totalCompleted,
          maxStreak: overallStats.maxStreak,
        });
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [overallStats.totalModules, overallStats.totalTopics, overallStats.totalCompleted, overallStats.maxStreak]);

  // Get daily activity for selected course or first course
  const courseForActivity =
    selectedCourse || allCoursesProgress[0]?.courseName || null;
  const dailyActivity = courseForActivity
    ? getDailyActivity(courseForActivity, 14)
    : [];

  // Calculate achievements
  const achievements = calculateAchievements(overallStats, allCoursesProgress);

  if (!userEmail) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900"
        }`}
      >
        <div className="text-center p-8 rounded-2xl backdrop-blur-lg bg-white/10 shadow-2xl border border-white/20">
          <div className="mb-6">
            <FaGraduationCap className="mx-auto text-6xl text-indigo-500 mb-4" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Welcome to Your Learning Dashboard</h2>
          <p className="mb-8 text-lg opacity-90">Sign in to track your progress and unlock achievements</p>
          <button
            onClick={() => navigate("/auth/login")}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg font-semibold"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pb-20 ${
        darkMode 
          ? "bg-slate-900 text-white" 
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Section with Welcome Message */}
        <div className={`rounded-2xl p-6 shadow-lg ${darkMode ? "bg-slate-800" : "bg-white"}`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome Back! 👋
                </span>
              </h1>
              <p className={`text-base ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Track your learning progress and achievements
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              <FaRocket className="inline mr-2" />
              Explore Courses
            </button>
          </div>
        </div>

        {/* Overall Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModernStatCard
            icon={<FaBookOpen />}
            title="Modules Viewed"
            value={animatedStats.totalModules}
            color="blue"
            darkMode={darkMode}
          />
          <ModernStatCard
            icon={<FaBrain />}
            title="Topics Mastered"
            value={animatedStats.totalTopics}
            color="green"
            darkMode={darkMode}
          />
          <ModernStatCard
            icon={<FaFire />}
            title="Current Streak"
            value={animatedStats.maxStreak}
            suffix=" days"
            color="orange"
            darkMode={darkMode}
          />
          <ModernStatCard
            icon={<FaTrophy />}
            title="Active Courses"
            value={overallStats.totalCourses}
            color="purple"
            darkMode={darkMode}
          />
        </div>

        {/* Achievements Section */}
        {achievements.length > 0 && (
          <div className={`rounded-2xl shadow-lg p-6 ${darkMode ? "bg-slate-800" : "bg-white"}`}>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FaAward className="mr-3 text-yellow-500 text-3xl" />
              Your Achievements
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {achievements.map((achievement, index) => (
                <AchievementBadge
                  key={index}
                  achievement={achievement}
                  darkMode={darkMode}
                />
              ))}
            </div>
          </div>
        )}

        {/* Courses Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Courses List */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl shadow-lg p-6 ${darkMode ? "bg-slate-800" : "bg-white"}`}>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FaGraduationCap className="mr-3 text-indigo-500" />
                Your Learning Path
              </h2>

              {allCoursesProgress.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mb-6">
                    <FaRocket className="mx-auto text-7xl text-gray-400 animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Start Your Journey!</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
                    Discover amazing courses and begin your learning adventure.
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg font-semibold"
                  >
                    <FaBookOpen className="inline mr-2" />
                    Browse Courses
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {allCoursesProgress.map((course, index) => (
                    <EnhancedCourseCard
                      key={course.courseName}
                      course={course}
                      darkMode={darkMode}
                      isSelected={selectedCourse === course.courseName}
                      onSelect={() => setSelectedCourse(course.courseName)}
                      onViewCourse={() =>
                        navigate(`/CourseRoadmap/${course.courseName}`)
                      }
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Activity Calendar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Activity Heatmap */}
            <div className={`rounded-2xl shadow-lg p-6 ${darkMode ? "bg-slate-800" : "bg-white"}`}>
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <FaChartLine className="mr-2 text-indigo-500" />
                Activity Heatmap
              </h2>

              {courseForActivity ? (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">
                    Last 14 days •{" "}
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {courseForActivity}
                    </span>
                  </p>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {dailyActivity.map((day, index) => {
                      const topicsCount = day.topicsCount;
                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center group"
                        >
                          <div
                            className={`w-10 h-10 rounded-lg transition-all duration-300 transform group-hover:scale-110 cursor-pointer ${
                              topicsCount === 0
                                ? darkMode
                                  ? "bg-slate-700"
                                  : "bg-gray-200"
                                : topicsCount < 3
                                ? "bg-emerald-300"
                                : topicsCount < 6
                                ? "bg-emerald-500"
                                : "bg-emerald-600 shadow-lg shadow-emerald-500/50"
                            }`}
                            title={`${day.date}\n${day.topicsCount} topics viewed`}
                          >
                            {topicsCount > 0 && (
                              <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                {topicsCount}
                              </div>
                            )}
                          </div>
                          <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                            {new Date(day.date).toLocaleDateString("en-US", {
                              weekday: "short",
                            })[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-xs pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">
                      Less Active
                    </span>
                    <div className="flex space-x-2">
                      <div className={`w-5 h-5 rounded ${darkMode ? "bg-slate-700" : "bg-gray-200"}`}></div>
                      <div className="w-5 h-5 rounded bg-emerald-300"></div>
                      <div className="w-5 h-5 rounded bg-emerald-500"></div>
                      <div className="w-5 h-5 rounded bg-emerald-600"></div>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">
                      More Active
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <FaCalendarAlt className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No activity data yet
                  </p>
                </div>
              )}
            </div>

            {/* Performance Insights */}
            <div className={`rounded-2xl shadow-lg p-6 ${darkMode ? "bg-slate-800" : "bg-white"}`}>
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <FaStar className="mr-2 text-yellow-500 text-2xl" />
                Performance Insights
              </h2>
              <div className="space-y-4">
                <InsightRow
                  label="Total Courses"
                  value={allCoursesProgress.length}
                  icon={<FaBookOpen />}
                  color="blue"
                  darkMode={darkMode}
                />
                <InsightRow
                  label="Avg. Modules/Course"
                  value={
                    allCoursesProgress.length > 0
                      ? Math.round(
                          overallStats.totalModules / allCoursesProgress.length
                        )
                      : 0
                  }
                  icon={<FaChartLine />}
                  color="green"
                  darkMode={darkMode}
                />
                <InsightRow
                  label="Learning Streak"
                  value={
                    overallStats.maxStreak > 7
                      ? "🔥 On Fire!"
                      : overallStats.maxStreak > 3
                      ? "👍 Great!"
                      : overallStats.maxStreak > 0
                      ? "💪 Good Start"
                      : "🌱 Begin Today"
                  }
                  icon={<FaFire />}
                  color="orange"
                  darkMode={darkMode}
                  isText={true}
                />
                <InsightRow
                  label="Total Days Active"
                  value={overallStats.totalDays}
                  icon={<FaCalendarAlt />}
                  color="purple"
                  darkMode={darkMode}
                />
              </div>
            </div>

            {/* Motivational Quote */}
            <div className={`rounded-2xl shadow-lg p-6 ${darkMode ? "bg-slate-800" : "bg-white"}`}>
              <div className="text-center">
                <FaTrophy className="mx-auto text-4xl text-yellow-500 mb-3" />
                <p className="text-sm italic mb-2 opacity-90">
                  "The expert in anything was once a beginner."
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Keep learning, keep growing! 🚀
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate achievements
function calculateAchievements(stats, courses) {
  const achievements = [];

  if (stats.totalModules >= 1) {
    achievements.push({
      id: "first_module",
      name: "First Steps",
      description: "Viewed your first module",
      icon: <FaBookOpen />,
      iconColor: "text-blue-500",
      unlocked: true,
    });
  }

  if (stats.totalTopics >= 5) {
    achievements.push({
      id: "curious_learner",
      name: "Curious Mind",
      description: "Explored 5+ topics",
      icon: <FaBrain />,
      iconColor: "text-purple-500",
      unlocked: true,
    });
  }

  if (stats.maxStreak >= 3) {
    achievements.push({
      id: "streak_3",
      name: "Consistent",
      description: "3-day learning streak",
      icon: <FaFire />,
      iconColor: "text-orange-500",
      unlocked: true,
    });
  }

  if (stats.maxStreak >= 7) {
    achievements.push({
      id: "streak_7",
      name: "Week Warrior",
      description: "7-day learning streak",
      icon: <FaMedal />,
      iconColor: "text-yellow-500",
      unlocked: true,
    });
  }

  if (stats.totalCourses >= 3) {
    achievements.push({
      id: "multi_course",
      name: "Multitasker",
      description: "Learning 3+ courses",
      icon: <FaGraduationCap />,
      iconColor: "text-green-500",
      unlocked: true,
    });
  }

  if (stats.totalModules >= 10) {
    achievements.push({
      id: "dedicated",
      name: "Dedicated",
      description: "Viewed 10+ modules",
      icon: <FaStar />,
      iconColor: "text-indigo-500",
      unlocked: true,
    });
  }

  if (stats.totalTopics >= 20) {
    achievements.push({
      id: "knowledge_seeker",
      name: "Knowledge Seeker",
      description: "Explored 20+ topics",
      icon: <FaTrophy />,
      iconColor: "text-pink-500",
      unlocked: true,
    });
  }

  return achievements;
}

// Modern Stat Card Component
function ModernStatCard({ icon, title, value, suffix = "", color, darkMode }) {
  const colorSchemes = {
    blue: {
      icon: "text-blue-500",
      bg: darkMode ? "bg-blue-500/10" : "bg-blue-50",
      text: "text-blue-600",
      gradient: "from-blue-500 to-cyan-500"
    },
    green: {
      icon: "text-green-500",
      bg: darkMode ? "bg-green-500/10" : "bg-green-50",
      text: "text-green-600",
      gradient: "from-green-500 to-emerald-500"
    },
    orange: {
      icon: "text-orange-500",
      bg: darkMode ? "bg-orange-500/10" : "bg-orange-50",
      text: "text-orange-600",
      gradient: "from-orange-500 to-red-500"
    },
    purple: {
      icon: "text-purple-500",
      bg: darkMode ? "bg-purple-500/10" : "bg-purple-50",
      text: "text-purple-600",
      gradient: "from-purple-500 to-pink-500"
    },
  };

  const scheme = colorSchemes[color];

  return (
    <div className={`rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl transform hover:scale-105 ${darkMode ? "bg-slate-800" : "bg-white"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${scheme.bg}`}>
          <div className={`text-3xl ${scheme.icon}`}>{icon}</div>
        </div>
      </div>
      <div>
        <p className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          {title}
        </p>
        <p className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
          {value}{suffix}
        </p>
      </div>
      <div className={`mt-4 h-1.5 rounded-full bg-gradient-to-r ${scheme.gradient} opacity-30`}></div>
    </div>
  );
}

// Achievement Badge Component
function AchievementBadge({ achievement, darkMode }) {
  return (
    <div
      className={`rounded-xl p-4 text-center transition-all duration-300 hover:scale-110 cursor-pointer ${
        achievement.unlocked
          ? darkMode
            ? "bg-slate-700 shadow-lg hover:shadow-xl"
            : "bg-gray-50 shadow-lg hover:shadow-xl border border-gray-200"
          : "opacity-40 grayscale"
      }`}
      title={achievement.description}
    >
      <div className={`text-3xl mb-2 ${achievement.unlocked ? achievement.iconColor : "text-gray-400"}`}>
        {achievement.icon}
      </div>
      <p className={`text-xs font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
        {achievement.name}
      </p>
    </div>
  );
}

// Enhanced Course Card Component
function EnhancedCourseCard({ course, darkMode, isSelected, onSelect, onViewCourse, index }) {
  // Use the actual progress percentage calculated from total modules
  const progressPercentage = course.progressPercentage || 0;
  const totalModules = course.totalModules || 0;

  return (
    <div
      className={`rounded-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-xl ${
        darkMode
          ? isSelected
            ? "bg-slate-700 border-2 border-indigo-500 shadow-lg"
            : "bg-slate-700/80 hover:bg-slate-700 border border-slate-600"
          : isSelected
          ? "bg-white border-2 border-indigo-500 shadow-lg"
          : "bg-white hover:shadow-md border border-gray-200"
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-xl mb-1 flex items-center">
            <FaBookOpen className="mr-2 text-indigo-500" />
            {course.courseTitle || course.courseName
              .split(/(?=[A-Z])|[\s-]+/)
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalModules > 0 
              ? `${course.modulesViewed} of ${totalModules} modules viewed` 
              : "Loading course data..."}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewCourse();
          }}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 text-sm font-medium shadow-lg"
        >
          Continue →
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {progressPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 shadow-lg"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className={`text-center p-3 rounded-lg ${darkMode ? "bg-slate-800" : "bg-gray-100"}`}>
          <p className="text-2xl font-bold text-blue-500">{course.modulesViewed}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Modules</p>
        </div>
        <div className={`text-center p-3 rounded-lg ${darkMode ? "bg-slate-800" : "bg-gray-100"}`}>
          <p className="text-2xl font-bold text-green-500">{course.topicsViewed}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Topics</p>
        </div>
        <div className={`text-center p-3 rounded-lg ${darkMode ? "bg-slate-800" : "bg-gray-100"}`}>
          <p className="text-2xl font-bold text-orange-500">{course.currentStreak}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Streak</p>
        </div>
      </div>

      {/* Streak Indicator */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-orange-500">
          <FaFire className="mr-2" />
          <span className="font-semibold">
            {course.currentStreak > 0 ? `${course.currentStreak} day streak!` : "Start your streak today!"}
          </span>
        </div>
        {course.daysActive > 0 && (
          <span className="text-gray-500 dark:text-gray-400">
            {course.daysActive} {course.daysActive === 1 ? "day" : "days"} active
          </span>
        )}
      </div>
    </div>
  );
}

// Insight Row Component
function InsightRow({ label, value, icon, color, darkMode, isText = false }) {
  const colorClasses = {
    blue: { icon: "text-blue-500", bg: darkMode ? "bg-blue-500/10" : "bg-blue-50" },
    green: { icon: "text-green-500", bg: darkMode ? "bg-green-500/10" : "bg-green-50" },
    orange: { icon: "text-orange-500", bg: darkMode ? "bg-orange-500/10" : "bg-orange-50" },
    purple: { icon: "text-purple-500", bg: darkMode ? "bg-purple-500/10" : "bg-purple-50" },
  };

  const scheme = colorClasses[color];

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl ${darkMode ? "bg-slate-700/50" : "bg-gray-50"}`}>
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${scheme.bg} mr-3`}>
          <div className={`text-xl ${scheme.icon}`}>{icon}</div>
        </div>
        <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
          {label}
        </span>
      </div>
      <span className={`font-bold ${isText ? "text-sm" : "text-xl"} ${darkMode ? "text-white" : "text-gray-900"}`}>
        {value}
      </span>
    </div>
  );
}


