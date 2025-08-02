import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <h2>CANOVA</h2>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-item">
          <span className="nav-icon">🏠</span>
          <span className="nav-text">Home</span>
        </NavLink>
        
        <NavLink to="/templates" className="nav-item">
          <span className="nav-icon">📄</span>
          <span className="nav-text">Templates</span>
        </NavLink>
        
        <NavLink to="/analytics" className="nav-item">
          <span className="nav-icon">📊</span>
          <span className="nav-text">Analytics</span>
        </NavLink>
        
        <NavLink to="/projects" className="nav-item">
          <span className="nav-icon">📁</span>
          <span className="nav-text">Projects</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <p className="user-name">{user?.name}</p>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>
        
        <div className="sidebar-actions">
          <NavLink to="/profile" className="profile-btn">
            Settings
          </NavLink>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
