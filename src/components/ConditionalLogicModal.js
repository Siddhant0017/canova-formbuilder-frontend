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

  const availablePages = pages.filter(page => page.id !== currentPageId);

  const handleContinue = () => {
    if (!trueRedirect && !falseRedirect) {
      onUpdate({
        conditionalLogic: null
      });
    } else {
      onUpdate({
        conditionalLogic: {
          enabled: true,
          trueRedirect,
          falseRedirect,
          logic: 'AND'
        }
      });
    }
    onClose();
  };

  // Check if we have minimum pages for conditional logic
  if (availablePages.length === 0) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="conditional-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          
          <div className="modal-content">
            <div className="no-pages-message">
              <div className="warning-icon">⚠️</div>
              <h3>More Pages Needed</h3>
              <p>You need at least 2 pages to set up conditional logic.</p>
              <p>Add another page first, then set up conditions.</p>
            </div>
          </div>
          
          <button className="continue-btn" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="conditional-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        
        <div className="modal-content">
          <p className="modal-description">
            If the conditions are all met, it lead the user to the page you've selected here
          </p>

          <div className="redirect-settings">
            <div className="redirect-field">
              <label className="field-label">
                Select, if it's true
              </label>
              <select
                value={trueRedirect}
                onChange={(e) => setTrueRedirect(e.target.value)}
                className="page-select-input"
              >
                <option value="">Page</option>
                {availablePages.map(page => (
                  <option key={page.id} value={page.id}>
                    {page.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="redirect-field">
              <label className="field-label">
                Select, if it's false
              </label>
              <select
                value={falseRedirect}
                onChange={(e) => setFalseRedirect(e.target.value)}
                className="page-select-input"
              >
                <option value="">Page</option>
                {availablePages.map(page => (
                  <option key={page.id} value={page.id}>
                    {page.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button className="continue-btn" onClick={handleContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConditionalLogicModal;
