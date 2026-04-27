import React, { Suspense, lazy } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomeLayout from "./components/Home/layout";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";
import { ProgressProvider } from "./context/ProgressContext";
import NotAuthorized from "./components/NotAuthorized";

const Home = lazy(() => import("./pages/Home"));
const CourseRoadmap = lazy(() => import("./pages/RoadMap"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Interview = lazy(() => import("./pages/interview"));
const InterviewQuestion = lazy(() => import("./pages/interviewQues"));
const Auth = lazy(() => import("./components/Auth/Auth"));
const Login = lazy(() => import("./pages/Auth/login"));
const Signup = lazy(() => import("./pages/Auth/signup"));
function App() {
  return (
    <>
      <ThemeProvider>
        <ProgressProvider>
          <Router>
            <Suspense fallback={<div className="p-4">Loading...</div>}>
              <Routes>
                <Route path="/" element={<HomeLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/CourseRoadmap/:courseName?" element={<CourseRoadmap />} />
                  <Route path="/Dashboard" element={<Dashboard />} />
                  <Route path="/Interview" element={<Interview />} />
                  <Route
                    path="/interview-questions"
                    element={
                      <ProtectedRoute>
                        <InterviewQuestion />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="/auth" element={<Auth />}>
                    <Route path="login" element={<Login />} />
                    <Route path="signup" element={<Signup />} />
                  </Route>
              </Route>

                <Route path="*" element={<Navigate to="/" />} />
                <Route path="/AuthError" element={<NotAuthorized />} />
              </Routes>
            </Suspense>
            <Footer />
          </Router>
        </ProgressProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
