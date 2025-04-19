import React from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomeLayout from "./components/Home/layout";
import Home from "./pages/Home";
import CourseRoadmap from "./pages/RoadMap";
import Interview from "./pages/interview";
import InterviewQuestion from "./pages/interviewQues";
import Auth from "./components/Auth/Auth";
import Login from "./pages/Auth/login";
import Signup from "./pages/Auth/signup";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";
import NotAuthorized from "./components/NotAuthorized";
function App() {
  return (
    <>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomeLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/CourseRoadmap" element={<CourseRoadmap />} />
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
            <Route path="/AuthError" element={<NotAuthorized/>}/>
          </Routes>
          <Footer />
        </Router>
      </ThemeProvider>
    </>
  );
}

export default App;
