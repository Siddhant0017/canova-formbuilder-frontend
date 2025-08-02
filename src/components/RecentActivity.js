import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatDate } from '../utils/helpers';
import './RecentActivity.css';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      const response = await api.get('/activity/recent');
      setActivities(response.data.activities || []);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityClick = (activity) => {
    if (activity.type === 'form') {
      navigate(`/form-builder/${activity.itemId}`);
    } else if (activity.type === 'project') {
      navigate(`/project/${activity.itemId}`);
    }
  };

  const getActivityIcon = (type, action) => {
    switch (action) {
      case 'created':
        return (
          <svg className="activity-icon create" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        );
      case 'updated':
        return (
          <svg className="activity-icon update" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
          </svg>
        );
      case 'viewed':
        return (
          <svg className="activity-icon view" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        );
      default:
        return (
          <svg className="activity-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        );
    }
  };

  if (loading) {
    return <div className="activity-loading">Loading recent activity...</div>;
  }

  return (
    <div className="recent-activity">
      <h3 className="activity-title">Recent Activity</h3>
      
      {activities.length === 0 ? (
        <div className="no-activity">
          <p>No recent activity found</p>
        </div>
      ) : (
        <ul className="activity-list">
          {activities.map((activity) => (
            <li 
              key={activity._id} 
              className="activity-item"
              onClick={() => handleActivityClick(activity)}
            >
              <div className="activity-icon-container">
                {getActivityIcon(activity.type, activity.action)}
              </div>
              <div className="activity-details">
                <p className="activity-text">
                  <span className="activity-action">{activity.action}</span> a {activity.type}
                  <span className="activity-name"> {activity.itemName}</span>
                </p>
                <p className="activity-time">{formatDate(activity.timestamp)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivity;
