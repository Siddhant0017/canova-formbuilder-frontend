import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FormBuilderHeader.css';

const FormBuilderHeader = ({ 
  form, 
  onSave, 
  onPublish, 
  saving, 
  onTitleChange, 
  onShowDesign,
  onShowConditionalLogic // Added new prop
}) => {
  const navigate = useNavigate();

  return (
    <div className="form-builder-header">
      <div className="header-left">
        <button 
          className="back-btn"
          onClick={() => navigate('/dashboard')}
        >
          ← Back
        </button>
        <div className="form-info">
          <input
            type="text"
            className="header-title-input"
            value={form.title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Form Title"
          />
          <span className="form-status">
            {form.status === 'draft' ? '📝 Draft' : '✅ Published'}
          </span>
        </div>
      </div>

      <div className="header-actions">
        <button 
          className="design-btn"
          onClick={onShowDesign}
        >
          🎨 Design
        </button>
        <button 
          className="conditional-btn"
          onClick={onShowConditionalLogic}
        >
          🔗 Logic
        </button>
        <button 
          className="save-btn"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : '💾 Save'}
        </button>
        <button 
          className="publish-btn"
          onClick={onPublish}
        >
          🚀 Publish
        </button>
      </div>
    </div>
  );
};

export default FormBuilderHeader;
