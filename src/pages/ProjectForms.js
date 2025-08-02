
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import './ProjectForms.css';

const ProjectForms = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('projects');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchProjectForms();
  }, [projectId]);

useEffect(() => {
  fetchProjectForms();
  

  const handleFocus = () => {
    console.log('Page focused, refreshing forms...');
    fetchProjectForms();
  };

  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, [projectId]);

// Also refresh on navigation back
useEffect(() => {
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      fetchProjectForms();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);

  const fetchProjectForms = async () => {
    try {
      setLoading(true);
      
    
      const projectRes = await api.get(`/projects/${projectId}`);
      setProject(projectRes.data.project);
      
     
      try {
        const formsRes = await api.get(`/projects/${projectId}/forms`);
        setForms(formsRes.data.forms || []);
      } catch (error) {
        // Fallback: Get all user forms and filter by project
        console.log('Project forms endpoint not found, using fallback method');
        const allFormsRes = await api.get(`/forms/my-forms`);
        const allForms = allFormsRes.data.forms || [];
        
        // FIXED: Handle both string and ObjectId comparisons
        const projectForms = allForms.filter(form => {
          // Handle case where project is ObjectId or string
          return form.project && (
            form.project === projectId || 
            form.project._id === projectId ||
            form.project.toString() === projectId
          );
        });
        
        setForms(projectForms);
      }
      
    } catch (error) {
      console.error('Error fetching project forms:', error);
      toast.error('Failed to load project forms');
      setProject(null);
      setForms([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleNavigation = (section) => {
    setActiveNav(section);
    switch (section) {
      case 'home':
        navigate('/dashboard');
        break;
      case 'analysis':
        navigate('/analytics');
        break;
      case 'projects':
        navigate('/projects');
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    navigate('/projects');
  };

 
  const handleCreateForm = () => {
    navigate(`/form-builder/new?project=${projectId}`);
  };

  const handleFormAnalytics = (formId) => {
    navigate(`/analytics/form/${formId}`);
  };

  // Navigate to form builder for editing
  const handleFormClick = (formId) => {
    navigate(`/form-builder/${formId}`);
  };

  if (loading) {
    return (
      <div className="project-forms-loading">
        <div className="loading-spinner"></div>
        <p>Loading project forms...</p>
      </div>
    );
  }

 
  if (!project) {
    return (
      <div className="project-forms-error">
        <div className="error-content">
          <h3>Project Not Found</h3>
          <p>The project you're looking for doesn't exist or you don't have access to it.</p>
          <button className="back-to-projects-btn" onClick={handleBack}>
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-forms-page">
      {/* Sidebar - Same as Projects page */}
      <div className="projects-sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <div className="logo-shape"></div>
            </div>
            <span className="logo-text">CANOVA</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-button ${activeNav === 'home' ? 'active' : ''}`}
            onClick={() => handleNavigation('home')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 9L12 2L21 9V20A2 2 0 0 1 19 22H5A2 2 0 0 1 3 20V9Z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            <span>Home</span>
          </button>

          <button
            className={`nav-button ${activeNav === 'analysis' ? 'active' : ''}`}
            onClick={() => handleNavigation('analysis')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="20" x2="12" y2="10"/>
              <line x1="18" y1="20" x2="18" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="16"/>
            </svg>
            <span>Analysis</span>
          </button>

          <button
            className={`nav-button ${activeNav === 'projects' ? 'active' : ''}`}
            onClick={() => handleNavigation('projects')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 19A2 2 0 0 1 20 21H4A2 2 0 0 1 2 19V5A2 2 0 0 1 4 3H9L11 6H20A2 2 0 0 1 22 8V19Z"/>
            </svg>
            <span>Projects</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button
            className={`nav-button ${activeNav === 'profile' ? 'active' : ''}`}
            onClick={() => handleNavigation('profile')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21V19A4 4 0 0 0 16 15H8A4 4 0 0 0 4 19V21"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="projects-main">
        <div className="main-content">
          {/* Header */}
          <div className="project-forms-header">
            <div className="header-left">
              <button className="back-button" onClick={handleBack}>
                <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M19 12H5"/>
                  <path d="M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <h1 className="page-title">{project.name}</h1>
            </div>
          </div>

          {/* Forms Section */}
          <div className="forms-section">
            <div className="forms-grid">
              {forms.map((form) => (
                <div 
                  key={form._id} 
                  className="form-card"
                  onClick={() => handleFormClick(form._id)}
                >
                  <div className="form-header">
                    <h3 className="form-title">
                      {form.title} {form.status === 'draft' && '(Draft)'}
                    </h3>
                    <button 
                      className="form-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle menu actions here
                      }}
                    >
                      <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="1"/>
                        <circle cx="12" cy="5" r="1"/>
                        <circle cx="12" cy="19" r="1"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="form-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                  </div>
                  
                 
                  
                  <button 
                    className="analytics-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFormAnalytics(form._id);
                    }}
                  >
                    View Analytics
                  </button>
                </div>
              ))}

              {/* Empty state if no forms */}
              {forms.length === 0 && (
                <div className="empty-forms">
                  <div className="empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                  </div>
                  <h3>No forms in this project</h3>
                  <p>Create your first form to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Create Form Button - Bottom Middle */}
          <div className="create-form-section">
            <button className="create-form-button" onClick={handleCreateForm}>
              <svg className="plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectForms;
