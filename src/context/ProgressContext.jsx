import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const { userEmail } = useContext(AuthContext);
  const [progressData, setProgressData] = useState({});

  // Load progress data from localStorage when component mounts
  useEffect(() => {
    if (userEmail) {
      const savedProgress = localStorage.getItem(`progress_${userEmail}`);
      if (savedProgress) {
        setProgressData(JSON.parse(savedProgress));
      }
    }
  }, [userEmail]);

  // Save progress data to localStorage whenever it changes
  useEffect(() => {
    if (userEmail && Object.keys(progressData).length > 0) {
      localStorage.setItem(`progress_${userEmail}`, JSON.stringify(progressData));
    }
  }, [progressData, userEmail]);

  // Track module view
  const trackModuleView = (courseName, moduleId, moduleTitle) => {
    if (!userEmail) return;

    const today = new Date().toISOString().split("T")[0];
    const timestamp = new Date().toISOString();

    setProgressData((prev) => {
      const courseProgress = prev[courseName] || {
        modulesViewed: {},
        topicsViewed: {},
        dailyActivity: {},
        startedDate: today,
        lastActiveDate: today,
      };

      const moduleKey = `module_${moduleId}`;
      const moduleData = courseProgress.modulesViewed[moduleKey] || {
        id: moduleId,
        title: moduleTitle,
        firstViewed: timestamp,
        viewCount: 0,
        lastViewed: timestamp,
        topics: [],
      };

      return {
        ...prev,
        [courseName]: {
          ...courseProgress,
          modulesViewed: {
            ...courseProgress.modulesViewed,
            [moduleKey]: {
              ...moduleData,
              viewCount: moduleData.viewCount + 1,
              lastViewed: timestamp,
            },
          },
          dailyActivity: {
            ...courseProgress.dailyActivity,
            [today]: {
              modulesViewed: [
                ...(courseProgress.dailyActivity[today]?.modulesViewed || []),
                moduleId,
              ].filter((id, index, self) => self.indexOf(id) === index),
              topicsViewed:
                courseProgress.dailyActivity[today]?.topicsViewed || [],
              timestamp: timestamp,
            },
          },
          lastActiveDate: today,
        },
      };
    });
  };

  // Track topic view
  const trackTopicView = (courseName, moduleId, moduleTitle, topicName) => {
    if (!userEmail) return;

    const today = new Date().toISOString().split("T")[0];
    const timestamp = new Date().toISOString();

    setProgressData((prev) => {
      const courseProgress = prev[courseName] || {
        modulesViewed: {},
        topicsViewed: {},
        dailyActivity: {},
        startedDate: today,
        lastActiveDate: today,
      };

      const topicKey = `${moduleId}_${topicName.replace(/\s+/g, "_")}`;
      const topicData = courseProgress.topicsViewed[topicKey] || {
        moduleId,
        moduleTitle,
        topicName,
        firstViewed: timestamp,
        viewCount: 0,
        lastViewed: timestamp,
      };

      // Update module's topics list
      const moduleKey = `module_${moduleId}`;
      const moduleData = courseProgress.modulesViewed[moduleKey] || {
        id: moduleId,
        title: moduleTitle,
        firstViewed: timestamp,
        viewCount: 0,
        lastViewed: timestamp,
        topics: [],
      };

      return {
        ...prev,
        [courseName]: {
          ...courseProgress,
          topicsViewed: {
            ...courseProgress.topicsViewed,
            [topicKey]: {
              ...topicData,
              viewCount: topicData.viewCount + 1,
              lastViewed: timestamp,
            },
          },
          modulesViewed: {
            ...courseProgress.modulesViewed,
            [moduleKey]: {
              ...moduleData,
              topics: [...new Set([...moduleData.topics, topicName])],
            },
          },
          dailyActivity: {
            ...courseProgress.dailyActivity,
            [today]: {
              modulesViewed:
                courseProgress.dailyActivity[today]?.modulesViewed || [],
              topicsViewed: [
                ...(courseProgress.dailyActivity[today]?.topicsViewed || []),
                topicName,
              ].filter((name, index, self) => self.indexOf(name) === index),
              timestamp: timestamp,
            },
          },
          lastActiveDate: today,
        },
      };
    });
  };

  // Mark module as completed
  const markModuleCompleted = (courseName, moduleId, moduleTitle) => {
    if (!userEmail) return;

    const timestamp = new Date().toISOString();

    setProgressData((prev) => {
      const courseProgress = prev[courseName] || {
        modulesViewed: {},
        topicsViewed: {},
        dailyActivity: {},
        completedModules: {},
      };

      const moduleKey = `module_${moduleId}`;

      return {
        ...prev,
        [courseName]: {
          ...courseProgress,
          completedModules: {
            ...courseProgress.completedModules,
            [moduleKey]: {
              id: moduleId,
              title: moduleTitle,
              completedDate: timestamp,
            },
          },
        },
      };
    });
  };

  // Get progress statistics with actual total modules
  const getProgressStats = (courseName, totalModules = null) => {
    if (!courseName || !progressData[courseName]) {
      return {
        modulesViewed: 0,
        topicsViewed: 0,
        completedModules: 0,
        daysActive: 0,
        currentStreak: 0,
        lastActive: null,
        totalModules: totalModules || 0,
        progressPercentage: 0,
      };
    }

    const courseProgress = progressData[courseName];
    const modulesViewed = Object.keys(courseProgress.modulesViewed || {}).length;
    const topicsViewed = Object.keys(courseProgress.topicsViewed || {}).length;
    const completedModules = Object.keys(
      courseProgress.completedModules || {}
    ).length;
    const daysActive = Object.keys(courseProgress.dailyActivity || {}).length;

    // Calculate progress percentage based on actual total modules
    let progressPercentage = 0;
    if (totalModules && totalModules > 0) {
      progressPercentage = Math.round((modulesViewed / totalModules) * 100);
      // Cap at 100%
      progressPercentage = Math.min(progressPercentage, 100);
    }

    // Calculate current streak
    const today = new Date().toISOString().split("T")[0];
    let currentStreak = 0;
    let checkDate = new Date(today);

    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (courseProgress.dailyActivity?.[dateStr]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      modulesViewed,
      topicsViewed,
      completedModules,
      daysActive,
      currentStreak,
      lastActive: courseProgress.lastActiveDate,
      totalModules: totalModules || 0,
      progressPercentage,
    };
  };

  // Get all courses progress
  const getAllCoursesProgress = () => {
    return Object.keys(progressData).map((courseName) => ({
      courseName,
      ...getProgressStats(courseName),
    }));
  };

  // Get daily activity for a specific course
  const getDailyActivity = (courseName, days = 7) => {
    if (!courseName || !progressData[courseName]) {
      return [];
    }

    const courseProgress = progressData[courseName];
    const dailyActivity = courseProgress.dailyActivity || {};

    const result = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const activity = dailyActivity[dateStr] || {
        modulesViewed: [],
        topicsViewed: [],
      };

      result.push({
        date: dateStr,
        modulesCount: activity.modulesViewed?.length || 0,
        topicsCount: activity.topicsViewed?.length || 0,
        active: activity.modulesViewed?.length > 0 || activity.topicsViewed?.length > 0,
      });
    }

    return result;
  };

  const value = {
    progressData,
    trackModuleView,
    trackTopicView,
    markModuleCompleted,
    getProgressStats,
    getAllCoursesProgress,
    getDailyActivity,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
