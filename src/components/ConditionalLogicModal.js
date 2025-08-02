import React, { useState } from 'react';
import './ConditionalLogicModal.css';

const ConditionalLogicModal = ({ 
  pages, 
  currentPageId, 
  conditionalLogic, 
  onUpdate, 
  onClose 
}) => {
  const [trueRedirect, setTrueRedirect] = useState(
    conditionalLogic?.trueRedirect || ''
  );
  const [falseRedirect, setFalseRedirect] = useState(
    conditionalLogic?.falseRedirect || ''
  );

  // Filter out current page from dropdown options
  const availablePages = pages.filter(page => page.id !== currentPageId);

  const handleSave = () => {
    if (!trueRedirect && !falseRedirect) {
      // If no redirects selected, remove conditional logic
      onUpdate({
        conditionalLogic: null
      });
    } else {
      onUpdate({
        conditionalLogic: {
          enabled: true,
          trueRedirect,
          falseRedirect,
          logic: 'AND' // All correct answers must match
        }
      });
    }
    onClose();
  };

  const handleClear = () => {
    setTrueRedirect('');
    setFalseRedirect('');
    onUpdate({
      conditionalLogic: null
    });
    onClose();
  };

  // Check if we have minimum pages for conditional logic
  if (availablePages.length === 0) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="conditional-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Add Condition</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          
          <div className="modal-content">
            <div className="no-pages-message">
              <div className="warning-icon">⚠️</div>
              <h3>More Pages Needed</h3>
              <p>You need at least 2 pages to set up conditional logic.</p>
              <p>Add another page first, then set up conditions.</p>
            </div>
          </div>
          
          <div className="modal-actions">
            <button className="cancel-btn" onClick={onClose}>
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="conditional-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Condition</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="logic-explanation">
            <div className="info-box">
              <h4>🧠 How Conditional Logic Works</h4>
              <p>Based on the correct answers you've set for questions on this page:</p>
              <ul>
                <li><strong>All correct:</strong> User gets all answers right → True path</li>
                <li><strong>Any incorrect:</strong> User gets one or more wrong → False path</li>
              </ul>
            </div>
          </div>

          <div className="redirect-settings">
            <div className="redirect-option">
              <label className="redirect-label">
                <span className="condition-icon true">✅</span>
                <strong>If all correct answers are matched, go to Page:</strong>
              </label>
              <select
                value={trueRedirect}
                onChange={(e) => setTrueRedirect(e.target.value)}
                className="page-select"
              >
                <option value="">Select a page</option>
                {availablePages.map(page => (
                  <option key={page.id} value={page.id}>
                    {page.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="redirect-option">
              <label className="redirect-label">
                <span className="condition-icon false">❌</span>
                <strong>If answers do not match, go to Page:</strong>
              </label>
              <select
                value={falseRedirect}
                onChange={(e) => setFalseRedirect(e.target.value)}
                className="page-select"
              >
                <option value="">Select a page</option>
                {availablePages.map(page => (
                  <option key={page.id} value={page.id}>
                    {page.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="current-logic-status">
            {conditionalLogic?.enabled && (
              <div className="status-info">
                <h4>Current Logic:</h4>
                <p>✅ True → {pages.find(p => p.id === trueRedirect)?.name || 'Not set'}</p>
                <p>❌ False → {pages.find(p => p.id === falseRedirect)?.name || 'Not set'}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="clear-btn" onClick={handleClear}>
            Clear Logic
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave}>
            Save Condition
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConditionalLogicModal;
