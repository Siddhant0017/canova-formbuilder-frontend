import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import FormBuilder from "./pages/FormBuilder";
import Analytics from "./pages/Analytics";
import FormAnalysis from './components/FormAnalysis'; // FIXED: Single import, correct path
import Projects from "./pages/Projects";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import ProjectForms from './pages/ProjectForms';
import FormPreview from "./pages/FormPreview";
import FormLogicFlowchart from "./pages/FormLogicFlowchart";
import FormViewer from './pages/FormViewer';
import SubmissionSuccess from "./pages/SubmissionSuccess";
import ProjectAnalysis from "./components/ProjectAnalysis";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/form-builder/:id?"
              element={
                <ProtectedRoute>
                  <FormBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            {/* Public routes - no authentication required */}
            <Route path="/form/:id" element={<FormViewer />} />
            <Route path="/submission-success" element={<SubmissionSuccess />} />

            {/* Protected routes */}
            <Route
              path="/form-preview/:id"
              element={
                <ProtectedRoute>
                  <FormPreview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/project/:projectId/forms"
              element={
                <ProtectedRoute>
                  <ProjectForms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/form-logic/:id"
              element={
                <ProtectedRoute>
                  <FormLogicFlowchart />
                </ProtectedRoute>
              }
            />
            {/* FIXED: Single route for form analytics */}
            <Route
              path="/analytics/form/:formId"
              element={
                <ProtectedRoute>
                  <FormAnalysis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics/project/:projectId"
              element={
                <ProtectedRoute>
                  <ProjectAnalysis />
                </ProtectedRoute>
              }
            />

          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
