import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
// import './FormCard.css';

const FormCard = ({ form, onUpdate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null); 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        await api.delete(`/forms/${form._id}`);
        toast.success('Form deleted successfully');
        onUpdate();
      } catch (error) {
        toast.error('Failed to delete form');
      }
    }
    setShowMenu(false);
  };

  const handleDuplicate = async () => {
    try {
      await api.post(`/forms/${form._id}/duplicate`);
      toast.success('Form duplicated successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to duplicate form');
    }
    setShowMenu(false);
  };

  const handleEdit = () => {
    navigate(`/form-builder/${form._id}`);
    setShowMenu(false);
  };

  return (
    <div className="form-card">
      <div className="form-header">
        <div className={`form-status ${form.status}`}>
          {form.status === 'draft' ? '📝' : '✅'}
        </div>
        <div className="form-actions">
          <button
            className="menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            ⋮
          </button>
          
          {showMenu && (
            <div ref={menuRef} className="form-menu">
              <button onClick={handleEdit}>Edit</button>
              <button onClick={handleDuplicate}>Duplicate</button>
              <button onClick={handleDelete} className="delete-btn">Delete</button>
            </div>
          )}
        </div>
      </div>

      <div className="form-content" onClick={handleEdit}>
        <h3 className="form-title">{form.title}</h3>
        {form.description && (
          <p className="form-description">{form.description}</p>
        )}
        
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
      </div>

      <div className="form-footer">
        <span className="form-date">
          Updated {new Date(form.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default FormCard;
