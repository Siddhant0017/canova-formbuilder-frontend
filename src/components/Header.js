import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user } = useAuth();

  return (
    <div className="header">
      <div className="header-content">
        <div className="header-left">
          <h1>Good {getTimeOfDay()}, {user?.name?.split(' ')[0]}! 👋</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

export default Header;
