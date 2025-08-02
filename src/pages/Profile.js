import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: 'USA'
  });
  const [originalData, setOriginalData] = useState({});
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || 'USA'
      };
      setProfileData(userData);
      setOriginalData(userData);
    }
  }, [user]);

  const handleNavigation = (section) => {
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
      case 'settings':
        setActiveSection('settings');
         navigate('/settings'); 
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        setActiveSection(section);
        break;
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const response = await api.put('/auth/profile', profileData);
      
      if (response.data.success) {
        toast.success('Profile updated successfully!');
        setOriginalData(profileData);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setProfileData(originalData);
    toast.info('Changes discarded');
  };

  const hasChanges = JSON.stringify(profileData) !== JSON.stringify(originalData);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="profile-page">
      {/* Sidebar */}
      <div className="profile-sidebar">
        <div className="sidebar-content">
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="logo-icon">
              <div className="logo-shape"></div>
            </div>
            <span className="logo-text">CANOVA</span>
          </div>

          {/* User Profile Section */}
          <div className="sidebar-user-section">
            <div className="user-info">
              <div className="user-avatar">
                <span className="avatar-initials">
                  {getInitials(profileData.name || 'User')}
                </span>
              </div>
              <div className="user-details">
                <div className="user-name">{profileData.name || 'Your name'}</div>
                <div className="user-email">{profileData.email || 'yourname@gmail.com'}</div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="sidebar-menu">
            <div 
              className={`menu-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSection('profile')}
            >
              <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>My Profile</span>
            </div>
            
            <div 
              className={`menu-item ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => handleNavigation('settings')}
            >
              <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              <span>Settings</span>
            </div>
            
            <div 
              className="menu-item logout"
              onClick={() => handleNavigation('logout')}
            >
              <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Log Out</span>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-main">
        <div className="main-content">
          <h1 className="page-title">My Profile</h1>

          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar-container">
              <div className="profile-avatar-large">
                <span className="avatar-initials-large">
                  {getInitials(profileData.name || 'User')}
                </span>
              </div>
              <div className="edit-avatar-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"/>
                </svg>
              </div>
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{profileData.name || 'Your name'}</h2>
              <p className="profile-email">{profileData.email || 'yourname@gmail.com'}</p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="profile-form-card">
            <div className="form-content">
              <div className="form-fields">
                <div className="form-field">
                  <label className="field-label">Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="field-input"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Email account</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="field-input"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Mobile number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="field-input"
                    placeholder="Add number"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Location</label>
                  <select
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="field-select"
                  >
                    <option value="USA">USA</option>
                    <option value="Canada">Canada</option>
                    <option value="UK">UK</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="form-actions">
                <button 
                  className="discard-btn"
                  onClick={handleDiscardChanges}
                  disabled={!hasChanges}
                >
                  Discard Change
                </button>
                <button 
                  className="save-btn"
                  onClick={handleSaveChanges}
                  disabled={saving || !hasChanges}
                >
                  {saving ? 'Saving...' : 'Save Change'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
