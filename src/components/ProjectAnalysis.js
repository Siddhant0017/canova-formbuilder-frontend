
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import './ProjectAnalysis.css';

export default function ProjectAnalysis() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('analysis');
  const [activeTab, setActiveTab] = useState("Total Views");
  const [activeTimePeriod, setActiveTimePeriod] = useState("This year");
  
  const [project, setProject] = useState(null);
  const [projectAnalytics, setProjectAnalytics] = useState({
    totalViews: 0,
    averageViews: 0,
    viewsGrowth: 0,
    chartData: []
  });
  const [projectForms, setProjectForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectAnalytics();
  }, [projectId, activeTimePeriod]);

  const fetchProjectAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch project analytics data
      const response = await api.get(`/analytics/project/${projectId}?period=${activeTimePeriod.toLowerCase().replace(' ', '_')}`);
      
      setProject(response.data.project);
      setProjectAnalytics(response.data.analytics);
      setProjectForms(response.data.forms);

    } catch (error) {
      console.error('Error fetching project analytics:', error);
      toast.error('Failed to load project analytics');
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
    navigate('/analytics');
  };

 
  const handleFormClick = (formId) => {
    navigate(`/analytics/form/${formId}`);
  };

  if (loading || !project) {
    return (
      <div className="project-analysis-loading">
        <div className="loading-spinner"></div>
        <p>Loading project analysis...</p>
      </div>
    );
  }

  return (
    <div className="project-analysis-page">
      {/* Sidebar - Same as Dashboard */}
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
        {/* Header - No Save Button */}
        <div className="project-header">
          <div className="header-left">
            <button className="back-button" onClick={handleBack}>
              <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 className="header-title">{project.name}</h1>
          </div>
          {/* NO SAVE BUTTON */}
        </div>

        <div className="content-container">
          {/* Metrics and Chart Row */}
          <div className="metrics-chart-row">
            {/* Metrics Cards */}
            <div className="metrics-cards">
              {/* Total Views Card */}
              <div className="metric-card">
                <div className="metric-content">
                  <p className="metric-label">Total Views</p>
                  <div className="metric-value-row">
                    <span className="metric-value">{projectAnalytics.totalViews.toLocaleString()}</span>
                    <div className={`metric-growth ${projectAnalytics.viewsGrowth >= 0 ? 'positive' : 'negative'}`}>
                      <svg className="growth-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        {projectAnalytics.viewsGrowth >= 0 ? (
                          <>
                            <polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/>
                            <polyline points="16,7 22,7 22,13"/>
                          </>
                        ) : (
                          <>
                            <polyline points="22,17 13.5,8.5 8.5,13.5 2,7"/>
                            <polyline points="16,17 22,17 22,11"/>
                          </>
                        )}
                      </svg>
                      {projectAnalytics.viewsGrowth >= 0 ? '+' : ''}{projectAnalytics.viewsGrowth}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Average Views Card */}
              <div className="metric-card">
                <div className="metric-content">
                  <p className="metric-label">Average Views</p>
                  <div className="metric-value-row">
                    <span className="metric-value">{projectAnalytics.averageViews.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="chart-container">
              <div className="chart-card">
                <div className="chart-content">
                  {/* Chart Header */}
                  <div className="chart-header">
                    <div className="chart-tabs">
                      <h3 className="chart-title">Project Analytics</h3>
                      <div className="tab-buttons">
                        {["Total Views", "Average Views"].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="time-period-selector">
                      {["This year", "Last year"].map((period) => (
                        <button
                          key={period}
                          onClick={() => setActiveTimePeriod(period)}
                          className={`period-button ${activeTimePeriod === period ? 'active' : ''}`}
                        >
                          <div className={`period-dot ${activeTimePeriod === period ? 'active' : ''}`}></div>
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chart Area */}
                  <div className="chart-area">
                    <svg className="chart-svg" viewBox="0 0 800 200">
                      {/* Grid lines */}
                      <defs>
                        <pattern id="grid" width="80" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 80 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />

                      {/* Y-axis labels */}
                      <text x="20" y="20" className="axis-label">
                        {activeTab === "Total Views" ? "30K" : Math.round(30000 / (projectForms.length || 1))}
                      </text>
                      <text x="20" y="60" className="axis-label">
                        {activeTab === "Total Views" ? "20K" : Math.round(20000 / (projectForms.length || 1))}
                      </text>
                      <text x="20" y="100" className="axis-label">
                        {activeTab === "Total Views" ? "10K" : Math.round(10000 / (projectForms.length || 1))}
                      </text>
                      <text x="20" y="180" className="axis-label">0</text>

                      {/* Chart line */}
                      <path
                        d="M 80 120 Q 160 140 240 100 T 400 80 Q 480 70 560 90 T 720 110"
                        fill="none"
                        stroke="#69b5f8"
                        strokeWidth="2"
                      />
                    </svg>

                    {/* X-axis labels */}
                    <div className="x-axis-labels">
                      <span>Jan</span>
                      <span>Mar</span>
                      <span>May</span>
                      <span>Jul</span>
                      <span>Sep</span>
                      <span>Nov</span>
                      <span>Dec</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Forms Section */}
          <div className="dashboard-section">
            <h2 className="section-title">Forms in this Project</h2>
            <div className="works-grid">
              {projectForms.map((form) => (
                <div 
                  key={form._id} 
                  className="work-card project-form-card"
                  onClick={() => handleFormClick(form._id)}
                >
                  <div className="work-header">
                    <h3 className="work-title">
                      {form.title} {form.status === 'draft' && '(Draft)'}
                    </h3>
                    <div className="analytics-badge">
                      <span className="view-count">{form.viewCount || 0} views</span>
                    </div>
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
                    View Form Analytics
                  </button>
                </div>
              ))}

              {/* Empty state if no forms */}
              {projectForms.length === 0 && (
                <div className="empty-works">
                  <div className="empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                  </div>
                  <h3>No forms in this project</h3>
                  <p>Add forms to this project to see their analytics</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
