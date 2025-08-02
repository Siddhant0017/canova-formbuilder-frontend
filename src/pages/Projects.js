import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WorkMenu from "../components/WorkMenu"; // Add this import
import api from '../services/api';
import { toast } from 'react-toastify';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [activeNav, setActiveNav] = useState('projects');
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null); // Changed from showMenuId to openMenu
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to refresh projects after menu actions
  const reloadProjects = () => fetchProjects();

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
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}/forms`);
  };

  // Remove the custom menu handlers since WorkMenu will handle them
  // Keep only the ones you might want to customize differently

  if (loading) {
    return (
      <div className="projects-loading">
        <div className="loading-spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="projects-page">
      {/* Sidebar - Keep as is */}
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
          <div className="projects-header">
            <h1 className="page-title">Welcome to CANOVA</h1>
          </div>

          {/* Projects Grid */}
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project._id} className="project-card-container">
                <div className="project-card">
                  {/* Blue header with folder icon */}
                  <div 
                    className="project-card-header"
                    style={{ backgroundColor: project.color || '#69b5f8' }}
                    onClick={() => handleProjectClick(project._id)}
                  >
                    <svg className="folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>

                  {/* White footer with project name */}
                  <div className="project-card-footer">
                    <span 
                      className="project-name"
                      onClick={() => handleProjectClick(project._id)}
                    >
                      {project.name}
                    </span>
                    
                    {/* Replace custom menu with WorkMenu */}
                    <button 
                      className="work-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu({ id: project._id, type: "project", item: project });
                      }}
                    >
                      <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="1"/>
                        <circle cx="12" cy="5" r="1"/>
                        <circle cx="12" cy="19" r="1"/>
                      </svg>
                    </button>

                    {/* WorkMenu dropdown */}
                    {openMenu?.id === project._id && openMenu.type === "project" && (
                      <WorkMenu
                        type="project"
                        item={openMenu.item}
                        onClose={() => setOpenMenu(null)}
                        refresh={reloadProjects}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Empty state */}
            {projects.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <h3>No Projects Yet</h3>
                <p>Create your first project to get started</p>
                <button 
                  className="create-project-btn"
                  onClick={() => navigate('/dashboard')}
                >
                  Create Project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
