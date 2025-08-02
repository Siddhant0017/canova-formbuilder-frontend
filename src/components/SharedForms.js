import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { formatDate } from '../utils/helpers';
import './SharedForms.css';

const SharedForms = ({ forms, onUpdate }) => {
  const [expandedForm, setExpandedForm] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAccessLevel = (form) => {
    // Find current user's access level for this form
    const userAccess = form.accessControl?.find(
      access => access.userId === getCurrentUserId()
    );
    return userAccess?.level || 'view';
  };

  const getCurrentUserId = () => {
    // Get current user ID from auth context or local storage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id;
  };

  const handleFormClick = (form) => {
    const accessLevel = getAccessLevel(form);
    
    if (accessLevel === 'edit') {
      // Navigate to form builder for editing
      navigate(`/form-builder/${form._id}`);
    } else {
      // Navigate to form viewer for viewing only
      navigate(`/form/${form._id}`);
    }
  };

  const handleViewResponses = async (formId) => {
    try {
      navigate(`/form/${formId}/responses`);
    } catch (error) {
      toast.error('Access denied to view responses');
    }
    setShowMenu(null);
  };

  const handleDuplicateForm = async (form) => {
    try {
      const duplicateData = {
        title: `${form.title} (Copy)`,
        description: form.description,
        questions: form.questions,
        design: form.design,
        status: 'draft'
      };

      const response = await api.post('/forms', duplicateData);
      toast.success('Form duplicated successfully!');
      navigate(`/form-builder/${response.data.form._id}`);
    } catch (error) {
      toast.error('Failed to duplicate form');
    }
    setShowMenu(null);
  };

  const getAccessLevelBadge = (level) => {
    switch (level) {
      case 'edit':
        return <span className="access-badge edit">✏️ Can Edit</span>;
      case 'share':
        return <span className="access-badge share">👥 Can Share</span>;
      case 'view':
      default:
        return <span className="access-badge view">👁️ View Only</span>;
    }
  };

  const getFormStatusIcon = (status) => {
    return status === 'published' ? '✅' : '📝';
  };

  if (!forms || forms.length === 0) {
    return null; // Don't render section if no shared forms
  }

  return (
    <section className="shared-forms">
      <div className="section-header">
        <h2>📤 Shared with You</h2>
        <span className="shared-count">{forms.length} forms</span>
      </div>

      <div className="shared-forms-grid">
        {forms.map((form) => {
          const accessLevel = getAccessLevel(form);
          const isExpanded = expandedForm === form._id;

          return (
            <div key={form._id} className="shared-form-card">
              <div className="form-card-header">
                <div className="form-status-info">
                  <span className="form-status-icon">
                    {getFormStatusIcon(form.status)}
                  </span>
                  <span className="form-title">{form.title}</span>
                </div>

                <div className="form-actions">
                  {getAccessLevelBadge(accessLevel)}
                  
                  <button
                    className="menu-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(showMenu === form._id ? null : form._id);
                    }}
                  >
                    ⋮
                  </button>

                  {showMenu === form._id && (
                    <div ref={menuRef} className="form-menu">
                      <button onClick={() => handleFormClick(form)}>
                        {accessLevel === 'edit' ? 'Edit Form' : 'View Form'}
                      </button>
                      
                      {(accessLevel === 'edit' || accessLevel === 'share') && (
                        <button onClick={() => handleViewResponses(form._id)}>
                          View Responses
                        </button>
                      )}
                      
                      <button onClick={() => handleDuplicateForm(form)}>
                        Duplicate
                      </button>
                      
                      <button 
                        onClick={() => {
                          setExpandedForm(isExpanded ? null : form._id);
                          setShowMenu(null);
                        }}
                      >
                        {isExpanded ? 'Less Info' : 'More Info'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-card-content" onClick={() => handleFormClick(form)}>
                {form.description && (
                  <p className="form-description">{form.description}</p>
                )}

                <div className="form-meta">
                  <div className="form-stats">
                    <span className="stat">
                      ❓ {form.questions?.length || 0} questions
                    </span>
                    
                    {form.project && (
                      <span className="stat">
                        📁 {form.project.name}
                      </span>
                    )}
                  </div>

                  <div className="form-owner">
                    <span className="owner-label">Owner:</span>
                    <span className="owner-name">{form.creator?.name}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="expanded-info">
                    <div className="form-details">
                      <div className="detail-row">
                        <span className="detail-label">Created:</span>
                        <span className="detail-value">
                          {formatDate(form.createdAt)}
                        </span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">Last Updated:</span>
                        <span className="detail-value">
                          {formatDate(form.updatedAt)}
                        </span>
                      </div>
                      
                      {form.publishedAt && (
                        <div className="detail-row">
                          <span className="detail-label">Published:</span>
                          <span className="detail-value">
                            {formatDate(form.publishedAt)}
                          </span>
                        </div>
                      )}

                      <div className="detail-row">
                        <span className="detail-label">Visibility:</span>
                        <span className="detail-value">
                          {form.visibility === 'public' ? '🌐 Public' : '🔒 Restricted'}
                        </span>
                      </div>
                    </div>

                    {form.conditionalLogic && form.conditionalLogic.length > 0 && (
                      <div className="conditional-logic-info">
                        <span className="logic-label">
                          🔗 Has conditional logic ({form.conditionalLogic.length} rules)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="form-card-footer">
                <span className="shared-date">
                  Shared {formatDate(form.updatedAt)}
                </span>
                <span className="form-id">#{form._id.slice(-6)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="shared-forms-footer">
        <button 
          className="view-all-shared-btn"
          onClick={() => navigate('/shared-forms')}
        >
          View All Shared Forms
        </button>
      </div>
    </section>
  );
};

export default SharedForms;
