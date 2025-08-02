import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import "./FormAnalysis.css";

const DonutChart = ({ data, questionTitle }) => {
  const chartData = data.options || [];
  const total = chartData.reduce((sum, item) => sum + item.count, 0);
  
  if (total === 0) {
    return (
      <div className="chart-container">
        <div className="no-data-message">No responses yet</div>
      </div>
    );
  }

  let cumulativePercentage = 0;
  const colors = ['#69b5f8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="chart-container">
      <div className="chart-content">
        <div className="donut-chart">
          <svg width="200" height="200" viewBox="0 0 42 42" className="donut-svg">
            <circle
              cx="21"
              cy="21"
              r="15.91549430918954"
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth="3"
            />
            {chartData.map((item, index) => {
              const percentage = (item.count / total) * 100;
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const strokeDashoffset = -cumulativePercentage;
              cumulativePercentage += percentage;
              
              return (
                <circle
                  key={index}
                  cx="21"
                  cy="21"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke={colors[index % colors.length]}
                  strokeWidth="3"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="donut-segment"
                />
              );
            })}
          </svg>
          <div className="donut-center">
            <div className="total-count">{total}</div>
          </div>
        </div>
        
        <div className="chart-legend">
          {chartData.map((item, index) => (
            <div key={index} className="legend-item">
              <div 
                className="legend-dot" 
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="legend-text">{item.text}</span>
              <span className="legend-percentage">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BarChart = ({ data, questionTitle }) => {
  const chartData = data.options || [];
  const total = chartData.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...chartData.map(item => item.count));
  
  if (total === 0) {
    return (
      <div className="chart-container">
        <div className="no-data-message">No responses yet</div>
      </div>
    );
  }

  const colors = ['#69b5f8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="chart-container">
      <div className="chart-content">
        <div className="bar-chart">
          <div className="bars-container">
            {chartData.map((item, index) => {
              const barHeight = maxCount > 0 ? (item.count / maxCount) * 120 : 0;
              
              return (
                <div key={index} className="bar-item">
                  <div className="bar-wrapper">
                    <div 
                      className="bar"
                      style={{ 
                        height: `${barHeight}px`,
                        backgroundColor: colors[index % colors.length]
                      }}
                    >
                      <div className="bar-value">{item.count}</div>
                    </div>
                  </div>
                  <div className="bar-label">{item.text}</div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="chart-summary">
          <div className="summary-item">
            <span className="summary-label">Total Responses</span>
            <span className="summary-value">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FormAnalysis() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('analysis');
  
  const [formData, setFormData] = useState(null);
  const [questionAnalytics, setQuestionAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      if (!formId) {
        toast.error("Form ID is missing, cannot load analysis.");
        navigate('/analytics');
        return;
      }
      
      try {
        setLoading(true);
        const res = await api.get(`/analytics/form/${formId}`);
        
        setFormData(res.data.form);
        setQuestionAnalytics(res.data.questionAnalytics || []);

      } catch (error) {
        toast.error("Failed to fetch form analytics.");
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [formId, navigate]);

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

  if (loading || !formData) {
    return (
      <div className="form-analysis-loading">
        <div className="loading-spinner"></div>
        <p>Loading form analysis...</p>
      </div>
    );
  }

  return (
    <div className="form-analysis-page">
      {/* Sidebar */}
      <div className="form-analysis-sidebar">
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
              <path d="M20 21V19A4 4 0 0 0 16 15H8A4 4 0 0 1 4 19V21"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Clean Header - No responses/views counts */}
        <div className="analysis-header">
          <div className="header-left">
            <button className="back-button" onClick={handleBack}>
              <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 className="header-title">{formData.title}</h1>
          </div>
        </div>

        {/* Question Analytics Cards */}
        <div className="analysis-content">
          {questionAnalytics.map((questionData, index) => {
            const showDonutChart = ['multiple-choice', 'checkbox', 'dropdown'].includes(questionData.questionType);
            const showBarChart = ['linear-scale', 'rating'].includes(questionData.questionType);

            if (!showDonutChart && !showBarChart) return null;

            return (
              <div key={questionData.questionId} className="question-analysis-card">
                <div className="question-header">
                  <h3 className="question-title">
                    Q{index + 1}. {questionData.questionTitle}
                  </h3>
                </div>
                
                <div className="chart-section">
                  {showDonutChart ? (
                    <DonutChart data={questionData} questionTitle={questionData.questionTitle} />
                  ) : (
                    <BarChart data={questionData} questionTitle={questionData.questionTitle} />
                  )}
                </div>
              </div>
            );
          })}
          
          {questionAnalytics.length === 0 && (
            <div className="no-analytics-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </div>
              <h3>No Analytics Available</h3>
              <p>This form doesn't have any chartable questions or responses yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
