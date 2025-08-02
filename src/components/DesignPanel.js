import React from 'react';
// import './DesignPanel.css';

const DesignPanel = ({ design, onUpdate, onClose }) => {
  const colorPresets = [
    '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6',
    '#007bff', '#6c757d', '#28a745', '#dc3545',
    '#ffc107', '#17a2b8', '#6f42c1', '#e83e8c'
  ];

  const handleBackgroundChange = (color) => {
    onUpdate({ backgroundColor: color });
  };

  const handleSectionColorChange = (color) => {
    onUpdate({ sectionColor: color });
  };

  const handleThemeChange = (theme) => {
    onUpdate({ theme });
  };

  return (
    <div className="design-panel">
      <div className="design-panel-header">
        <h3>Design Settings</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="design-panel-content">
        <div className="design-section">
          <h4>Background Color</h4>
          <div className="color-options">
            {colorPresets.map(color => (
              <button
                key={color}
                className={`color-option ${design.backgroundColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handleBackgroundChange(color)}
              />
            ))}
          </div>
          <input
            type="color"
            value={design.backgroundColor}
            onChange={(e) => handleBackgroundChange(e.target.value)}
            className="custom-color-picker"
          />
        </div>

        <div className="design-section">
          <h4>Section Color</h4>
          <div className="color-options">
            {colorPresets.map(color => (
              <button
                key={color}
                className={`color-option ${design.sectionColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handleSectionColorChange(color)}
              />
            ))}
          </div>
          <input
            type="color"
            value={design.sectionColor}
            onChange={(e) => handleSectionColorChange(e.target.value)}
            className="custom-color-picker"
          />
        </div>

        <div className="design-section">
          <h4>Theme</h4>
          <div className="theme-options">
            <button
              className={`theme-btn ${design.theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              Light
            </button>
            <button
              className={`theme-btn ${design.theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              Dark
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignPanel;
