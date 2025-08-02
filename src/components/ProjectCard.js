import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
// import './ProjectCard.css';

const ProjectCard = ({ project, onUpdate }) => {
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
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/projects/${project._id}`);
        toast.success('Project deleted successfully');
        onUpdate();
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
    setShowMenu(false);
  };

  const handleEdit = () => {
    navigate(`/project/${project._id}`);
    setShowMenu(false);
  };

  return (
    <div className="project-card">
      <div className="project-header">
        <div 
          className="project-color" 
          style={{ backgroundColor: project.color }}
        />
        <div className="project-actions">
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
            <div ref={menuRef} className="project-menu">
              <button onClick={handleEdit}>Edit</button>
              <button onClick={handleDelete} className="delete-btn">Delete</button>
            </div>
          )}
        </div>
      </div>

      <div className="project-content" onClick={() => navigate(`/project/${project._id}`)}>
        <h3 className="project-name">{project.name}</h3>
        {project.description && (
          <p className="project-description">{project.description}</p>
        )}
        
        <div className="project-stats">
          <span className="stat">
            📄 {project.forms?.length || 0} forms
          </span>
          <span className="stat">
            👥 {project.collaborators?.length || 0} collaborators
          </span>
        </div>
      </div>

      <div className="project-footer">
        <span className="project-date">
          Updated {new Date(project.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;
