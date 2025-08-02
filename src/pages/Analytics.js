import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WorkMenu from "../components/WorkMenu";
import api from '../services/api';
import { toast } from 'react-toastify';
import './Analytics.css';

const Analytics = () => {
  const [activeNav, setActiveNav] = useState('analysis');
  const [forms, setForms] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sharedWorks, setSharedWorks] = useState({ sharedWithMe: [] });
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [formsRes, projectsRes, sharedWorksRes] = await Promise.all([
        api.get('/forms/my-forms'),
        api.get('/projects'),
        api.get('/forms/shared-works')
      ]);

      const formsData = formsRes.data.forms || [];
      const projectsData = projectsRes.data.projects || [];
      const sharedWorksData = sharedWorksRes.data;

      setForms(formsData);
      setProjects(projectsData);
      setSharedWorks({ sharedWithMe: sharedWorksData.sharedWithMe || [] });

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
      
      setForms([]);
      setProjects([]);
      setSharedWorks({ sharedWithMe: [] });
    } finally {
      setLoading(false);
    }
  };

  // Helper to refresh data after menu actions
  const reloadData = () => fetchAnalyticsData();

  const handleNavigation = (section) => {
    setActiveNav(section);
    switch (section) {
      case 'home':
        navigate('/dashboard');
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

  const handleFormClick = (formId) => {
    navigate(`/analytics/form/${formId}`);
  };

  const handleProjectClick = (projectId) => {
    navigate(`/analytics/project/${projectId}`);
  };

  const handleSharedFormClick = (form, userPermission) => {
    if (userPermission === 'view' || userPermission === 'edit' || userPermission === 'share') {
      navigate(`/analytics/form/${form._id}`);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Sidebar - Keep as is */}
      <div className="analytics-sidebar">
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
            Home
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
            Analysis
          </button>
          
          <button
            className={`nav-button ${activeNav === 'projects' ? 'active' : ''}`}
            onClick={() => handleNavigation('projects')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 19A2 2 0 0 1 20 21H4A2 2 0 0 1 2 19V5A2 2 0 0 1 4 3H9L11 6H20A2 2 0 0 1 22 8V19Z"/>
            </svg>
            Projects
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
            Profile
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="analytics-main">
        <div className="analytics-header">
          <h1 className="page-title">Analytics Dashboard</h1>
        </div>

        <div className="analytics-content">
          {/* Recent Works Section */}
          <div className="analytics-section">
            <h2 className="section-title">Recent Works</h2>
            <div className="works-grid">
              {/* Forms with WorkMenu */}
              {forms.slice(0, 2).map((form) => (
                <div 
                  key={form._id} 
                  className="work-card analytics-form-card"
                  onClick={() => handleFormClick(form._id)}
                >
                  <div className="work-header">
                    <h3 className="work-title">
                      {form.title} {form.status === 'draft' && '(Draft)'}
                    </h3>
                    {/* WorkMenu button for forms */}
                    <button 
                      className="work-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu({ id: form._id, type: "form", item: form });
                      }}
                    >
                      <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="1"/>
                        <circle cx="12" cy="5" r="1"/>
                        <circle cx="12" cy="19" r="1"/>
                      </svg>
                    </button>
                  </div>
                  <div className="work-icon form-work-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                  </div>
                  <button 
                    className="analysis-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFormClick(form._id);
                    }}
                  >
                    Question Analytics
                  </button>

                  {/* Form WorkMenu */}
                  {openMenu?.id === form._id && openMenu.type === "form" && (
                    <WorkMenu
                      type="form"
                      item={openMenu.item}
                      onClose={() => setOpenMenu(null)}
                      refresh={reloadData}
                    />
                  )}
                </div>
              ))}
              
              {/* Projects with WorkMenu */}
              {projects.slice(0, Math.max(1, 3 - forms.slice(0, 2).length)).map((project) => (
                <div 
                  key={project._id} 
                  className="work-card analytics-project-card"
                  onClick={() => handleProjectClick(project._id)}
                >
                  {/* Blue header section with folder icon */}
                  <div className="work-icon project-work-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  
                  {/* White content section */}
                  <div className="work-header">
                    <h3 className="work-title">{project.name}</h3>
                    {/* WorkMenu button for projects */}
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
                  </div>

                  {/* Project WorkMenu */}
                  {openMenu?.id === project._id && openMenu.type === "project" && (
                    <WorkMenu
                      type="project"
                      item={openMenu.item}
                      onClose={() => setOpenMenu(null)}
                      refresh={reloadData}
                    />
                  )}
                </div>
              ))}

              {/* Empty state if no works */}
              {forms.length === 0 && projects.length === 0 && (
                <div className="empty-works">
                  <div className="empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                  </div>
                  <h3>No works yet</h3>
                  <p>Create your first project or form to see analytics</p>
                </div>
              )}
            </div>
          </div>

          {/* Shared Works Section */}
          {sharedWorks.sharedWithMe.length > 0 && (
            <div className="analytics-section">
              <h2 className="section-title">Shared Works Analytics</h2>
              <div className="works-grid">
                {sharedWorks.sharedWithMe.slice(0, 6).map((form) => {
                  const userAccess = form.accessControl?.find(ac => ac.userId === user?.id);
                  const permission = userAccess?.level || 'view';
                  
                  return (
                    <div 
                      key={`shared-analytics-${form._id}`} 
                      className="work-card shared-analytics-card" 
                      onClick={() => handleSharedFormClick(form, permission)}
                    >
                      <div className="work-header">
                        <h3 className="work-title">{form.title}</h3>
                        <div className="permission-badge">
                          <span className={`permission-label ${permission}`}>
                            {permission.charAt(0).toUpperCase() + permission.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="work-icon shared-work-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="18" cy="5" r="3"/>
                          <circle cx="6" cy="12" r="3"/>
                          <circle cx="18" cy="19" r="3"/>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                      </div>
                      <div className="shared-info">
                        <p className="shared-by">
                          Shared by {form.creator?.name || form.creator?.email}
                        </p>
                      </div>
                      <button 
                        className="analysis-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSharedFormClick(form, permission);
                        }}
                      >
                        Question Analytics
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
