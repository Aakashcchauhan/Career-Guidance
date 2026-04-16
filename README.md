# Career Guidance Platform

A feature-rich AI-powered learning platform that helps learners discover courses, generate structured roadmaps, track progress, and prepare for interviews.

## Overview

Career Guidance is a React-based web application focused on practical learning workflows:
- Choose or search a course/topic.
- Generate an AI roadmap with module structure.
- Explore topic-level AI explanations and video resources.
- Monitor progress in an analytics dashboard.
- Practice interview questions by category.

The app is designed with modern UI patterns, route protection, and persistent local user progress.

## Key Features

### 1) AI Course Roadmap Generation
- Generates course roadmaps using Gemini API.
- Produces structured JSON-based module plans.
- Each module includes:
  - title
  - description
  - topics
  - duration
  - difficulty
  - prerequisites
- Supports both predefined hot topics and custom user-entered course names.
- Stores generated course roadmaps in localStorage.

### 2) AI Topic and Module Learning Assistant
- When a user selects a module/topic, the app requests AI-enhanced explanations.
- Responses are rendered in a readable markdown style.
- Prompts include practical usage, key concepts, resources, and learning recommendations.

### 3) YouTube Learning Integration
- Fetches relevant tutorial videos using YouTube Data API.
- Builds search queries dynamically from selected course/module/topic.
- Filters out low-value short-form content patterns.
- Supports quick in-app learning flow.

### 4) Progress Analytics Dashboard
- Tracks learning interactions per signed-in user:
  - modules viewed
  - topics explored
  - daily activity
  - current streak
- Displays dashboard widgets and visual activity patterns.
- Computes progress percentage relative to actual roadmap module counts.
- Includes motivational and achievement-oriented UI elements.

### 5) Interview Preparation Hub
- Category-based interview prep page with search.
- Categories include frontend, backend, DSA, system design, behavioral, and language-specific tracks.
- Detail page supports AI-generated question creation.
- Includes fallback sample questions when generation fails.
- Provides question filtering by difficulty and topic.

### 6) Authentication and Access Control
- Firebase-based authentication using:
  - email/password signup
  - email/password login
  - Google sign-in
- Uses protected routes for restricted pages.
- Unauthorized users are redirected to an access-denied page.
- Stores auth session details in localStorage.

### 7) Theme and UX
- Light/Dark theme support via global Theme Context.
- Theme preference persisted via cookies.
- Responsive layouts for desktop and mobile.
- Uses Tailwind CSS with modern card-based UI and gradients.

### 8) Persistent Local Data Strategy
- Stores course data, tabs, and progress in browser localStorage.
- Stores progress per authenticated user key.
- Provides continuity between sessions without backend persistence for progress.

## Tech Stack

### Frontend
- React 19
- Vite 6
- React Router DOM 7
- Tailwind CSS 4

### Integrations
- Firebase Authentication
- Gemini API (roadmap and content generation)
- YouTube Data API (video recommendations)

### Supporting Libraries
- react-icons
- lucide-react
- js-cookie
- axios
- react-speech-recognition
- react-text-to-speech

## Project Structure

FrontEnd/
- public/
- src/
  - assets/
  - components/
    - Auth/
    - Home/
    - Footer.jsx
    - NotAuthorized.jsx
    - ProtectedRoute.jsx
  - context/
    - AuthContext.jsx
    - FirebaseContext.jsx
    - ProgressContext.jsx
    - ThemeContext.jsx
  - pages/
    - Auth/
      - login.jsx
      - signup.jsx
    - Dashboard.jsx
    - Home.jsx
    - interview.jsx
    - interviewQues.jsx
    - RoadMap.jsx
  - App.jsx
  - index.css
  - main.jsx
- package.json
- vite.config.js
- tailwind.config.js
- eslint.config.js

## Routing Summary

Main routes:
- / -> Home
- /CourseRoadmap/:courseName? -> AI roadmap page
- /Dashboard -> User progress dashboard
- /Interview -> Interview category hub
- /interview-questions -> Protected interview questions page
- /auth/login -> Login
- /auth/signup -> Signup
- /AuthError -> Access denied

## Environment Variables

Create a .env file in FrontEnd and add:

VITE_GEMINI_API_KEY=your_gemini_key
VITE_YOUTUBE_API_KEY=your_youtube_key
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
AI_API_KEY=your_gemini_key_for_interview_questions

Important note:
- The roadmap page uses VITE_GEMINI_API_KEY.
- The interview question page currently uses AI_API_KEY.
- Keeping both avoids runtime issues.

## Installation and Run

1. Install dependencies

npm install

2. Start development server

npm run dev

3. Build production bundle

npm run build

4. Preview production build

npm run preview

## Available Scripts

- npm run dev: Start Vite development server.
- npm run build: Build optimized production assets.
- npm run preview: Run local preview of production build.
- npm run lint: Run ESLint checks.

## How It Works (User Flow)

1. User opens home page and selects a topic or enters a custom course.
2. App generates a structured roadmap via Gemini.
3. User explores modules and topics.
4. App fetches AI explanations and related YouTube videos.
5. Progress is tracked and visualized in Dashboard.
6. User can switch to Interview section for category-wise practice questions.

## Security and Data Notes

- API keys are read from environment variables.
- Do not commit .env to source control.
- Authentication is handled by Firebase Auth.
- Progress/course data is browser-local by design in current implementation.

## Current Limitations

- Progress persistence is localStorage-based, not cloud-synced.
- Gemini environment variable naming is inconsistent across pages.
- Interview generation reliability depends on model JSON formatting.

## Recommended Improvements

1. Unify Gemini env key usage across all pages.
2. Move progress persistence from localStorage to Firestore.
3. Add loading skeletons and robust error boundary handling.
4. Add unit/integration tests for contexts and protected routes.
5. Add role-based profile settings and server-side analytics.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make changes with clear commit messages.
4. Run lint and local tests.
5. Open a pull request with a concise summary.

## License

No explicit license file is currently present. Add a license before public distribution.

## Author

Career Guidance project for students and professionals to plan learning paths and improve interview readiness with AI assistance.
