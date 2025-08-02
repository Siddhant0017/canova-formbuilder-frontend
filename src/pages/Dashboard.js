import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CreateModal from '../components/CreateModal';
import RecentActivity from '../components/RecentActivity';
import SharedForms from '../components/SharedForms';
import api from '../services/api';
import WorkMenu from "../components/WorkMenu";
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [forms, setForms] = useState([]);
  const [sharedForms, setSharedForms] = useState([]);
  const [sharedWorks, setSharedWorks] = useState({ sharedWithMe: [] });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null); // { id, type, item } or null
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, formsRes, sharedRes, sharedWorksRes] = await Promise.all([
        api.get('/projects'),
        api.get('/forms/my-forms?limit=6'),
        api.get('/forms/shared'),
        api.get('/forms/shared-works')
      ]);

      setProjects(projectsRes.data.projects || []);
      setForms(formsRes.data.forms || []);
      setSharedForms(sharedRes.data.forms || []);
      setSharedWorks({
        sharedWithMe: sharedWorksRes.data.sharedWithMe || []
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Helper to refresh lists after menu actions
  const reloadLists = () => fetchDashboardData();

  const handleCreateProject = async (projectData) => {
    try {
      const projectResponse = await api.post('/projects', {
        name: projectData.name,
        description: projectData.description
      });
      
      const formResponse = await api.post('/forms', {
        title: projectData.formName,
        description: projectData.description,
        projectId: projectResponse.data.project._id,
        status: 'draft'
      });
      
      toast.success('Project created successfully!');
      
      return {
        id: projectResponse.data.project._id,
        formId: formResponse.data.form._id
      };
    } catch (error) {
      toast.error('Failed to create project');
      throw error;
    }
  };

  const handleCreateFormDirect = () => {
    navigate('/form-builder/new');
  };

  const handleNavigation = (section) => {
    setActiveNav(section);
    switch (section) {
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

  const handleFormClick = (formId) => {
    navigate(`/form-builder/${formId}`);
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleAnalysisClick = (formId) => {
    navigate(`/analytics/form/${formId}`);
  };

  const handleSharedFormClick = (form, userPermission) => {
    if (userPermission === 'edit') {
      navigate(`/form-builder/${form._id}`);
    } else if (userPermission === 'view') {
      navigate(`/form/${form._id}`);
    } else if (userPermission === 'share') {
      handleCopyFormLink(form._id);
    }
  };

  const handleSharedFormAnalysisClick = (formId) => {
    navigate(`/analytics/form/${formId}`);
  };

  const handleCopyFormLink = (formId) => {
    const shareLink = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(shareLink);
    toast.success("Form link copied to clipboard!");
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
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
      <div className="main-content">
        <div className="content-container">
          <h1 className="dashboard-title">Welcome to CANOVA</h1>

          {/* Action Cards */}
          <div className="action-cards">
            <div className="action-card" onClick={() => setShowCreateModal(true)}>
              <div className="action-icon project-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3 className="action-title">Start From Scratch</h3>
              <p className="action-description">Create your first Project now</p>
            </div>

            <div className="action-card" onClick={handleCreateFormDirect}>
              <div className="action-icon form-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <h3 className="action-title">Create Form</h3>
              <p className="action-description">Create your first Form now</p>
            </div>
          </div>

          {/* Recent Works */}
          <div className="dashboard-section">
            <h2 className="section-title">Recent Works</h2>
            <div className="works-grid">
              {/* Forms */}
              {forms.slice(0, 2).map((form) => (
                <div key={form._id} className="work-card" onClick={() => handleFormClick(form._id)}>
                  <div className="work-header">
                    <h3 className="work-title">
                      {form.title} {form.status === 'draft' && '(Draft)'}
                    </h3>
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
                      handleAnalysisClick(form._id);
                    }}
                  >
                    View Analytics
                  </button>

                  {/* Form Menu */}
                  {openMenu?.id === form._id && openMenu.type === "form" && (
                    <WorkMenu
                      type="form"
                      item={openMenu.item}
                      onClose={() => setOpenMenu(null)}
                      refresh={reloadLists}
                    />
                  )}
                </div>
              ))}
              
              {/* Projects */}
              {projects.slice(0, Math.max(1, 3 - forms.slice(0, 2).length)).map((project) => (
                <div key={project._id} className="work-card project-card" onClick={() => handleProjectClick(project._id)}>
                  {/* Blue header section with folder icon */}
                  <div className="work-icon project-work-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  
                  {/* White content section */}
                  <div className="work-header">
                    <h3 className="work-title">{project.name}</h3>
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

                  {/* Project Menu */}
                  {openMenu?.id === project._id && openMenu.type === "project" && (
                    <WorkMenu
                      type="project"
                      item={openMenu.item}
                      onClose={() => setOpenMenu(null)}
                      refresh={reloadLists}
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
                  <p>Create your first project or form to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Shared Works - Only Forms Shared With Me */}
          {sharedWorks.sharedWithMe.length > 0 && (
            <div className="dashboard-section">
              <h2 className="section-title">Shared Works</h2>
              <div className="works-grid">
                {sharedWorks.sharedWithMe.slice(0, 6).map((form) => {
                  const userAccess = form.accessControl?.find(ac => ac.userId === user?.id);
                  const permission = userAccess?.level || 'view';
                  
                  return (
                    <div 
                      key={`shared-with-${form._id}`} 
                      className="work-card shared-work-card" 
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
                      <div className="shared-actions">
                        <button 
                          className="analysis-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (permission === 'edit') {
                              handleFormClick(form._id);
                            } else {
                              navigate(`/form/${form._id}`);
                            }
                          }}
                        >
                          {permission === 'edit' ? 'Edit Form' : permission === 'view' ? 'View Form' : 'Share Form'}
                        </button>
                        <button 
                          className="analysis-link secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSharedFormAnalysisClick(form._id);
                          }}
                        >
                          View Analytics
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateModal
          onClose={() => setShowCreateModal(false)}
          onCreateProject={handleCreateProject}
        />
      )}
    </div>
  );
};

export default Dashboard;
