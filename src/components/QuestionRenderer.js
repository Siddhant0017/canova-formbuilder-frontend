
import React, { useState } from 'react';
import './QuestionRenderer.css';

const QuestionRenderer = ({ question, value, onChange }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (newValue) => {
    onChange(newValue);
  };

  const handleMultipleChoice = (optionId) => {
    handleInputChange(optionId);
  };

  const handleCheckboxChange = (optionId) => {
    const currentValues = Array.isArray(value) ? value : [];
    const newValues = currentValues.includes(optionId)
      ? currentValues.filter(id => id !== optionId)
      : [...currentValues, optionId];
    handleInputChange(newValues);
  };

  const handleFileUpload = (files) => {
    const fileArray = Array.from(files);
    const maxFiles = question.fileSettings?.maxFiles || 5;
    
    if (fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

  
    const fileData = fileArray.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file: file 
    }));

    handleInputChange(fileData);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            className="question-input text-input"
            placeholder="Your answer..."
            required={question.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            className="question-input textarea-input"
            placeholder="Your answer..."
            rows={4}
            required={question.required}
          />
        );

      case 'multiple-choice':
        return (
          <div className="options-container">
            {question.options?.map((option) => (
              <label key={option.id} className="option-label radio-option">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={value === option.id}
                  onChange={() => handleMultipleChoice(option.id)}
                  required={question.required}
                />
                <span className="option-text">{option.text}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="options-container">
            {question.options?.map((option) => (
              <label key={option.id} className="option-label checkbox-option">
                <input
                  type="checkbox"
                  value={option.id}
                  checked={Array.isArray(value) && value.includes(option.id)}
                  onChange={() => handleCheckboxChange(option.id)}
                />
                <span className="option-text">{option.text}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            className="question-input dropdown-input"
            required={question.required}
          >
            <option value="">Select an option...</option>
            {question.options?.map((option) => (
              <option key={option.id} value={option.id}>
                {option.text}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            className="question-input date-input"
            required={question.required}
          />
        );

      case 'linear-scale':
        const settings = question.linearScaleSettings || {};
        const min = settings.min || 0;
        const max = settings.max || 10;
        const currentValue = value !== undefined ? value : settings.defaultValue || min;

        return (
          <div className="linear-scale-container">
            <div className="scale-labels">
              <span className="scale-label-left">{settings.minLabel || 'Scale Starting'}</span>
              <span className="scale-label-right">{settings.maxLabel || 'Scale Ending'}</span>
            </div>
            <div className="scale-input-container">
              <input
                type="range"
                min={min}
                max={max}
                value={currentValue}
                onChange={(e) => handleInputChange(parseInt(e.target.value))}
                className="scale-slider"
              />
              <div className="scale-value">{currentValue}</div>
            </div>
            <div className="scale-numbers">
              <span>{min}</span>
              <span>{max}</span>
            </div>
          </div>
        );

      case 'rating':
        const ratingSettings = question.ratingSettings || {};
        const maxStars = ratingSettings.maxStars || 5;
        const currentRating = value || 0;

        return (
          <div className="rating-container">
            <div className="stars-container">
              {[...Array(maxStars)].map((_, index) => {
                const starValue = index + 1;
                return (
                  <button
                    key={index}
                    type="button"
                    className={`star-button ${starValue <= currentRating ? 'filled' : ''}`}
                    onClick={() => handleInputChange(starValue)}
                  >
                    <svg className="star-icon" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  </button>
                );
              })}
            </div>
            <div className="rating-value">
              {currentRating > 0 ? `${currentRating} out of ${maxStars} stars` : 'Click to rate'}
            </div>
          </div>
        );

      case 'file-upload':
        const fileSettings = question.fileSettings || {};
        const maxFiles = fileSettings.maxFiles || 5;
        const maxFileSize = fileSettings.maxFileSize || '5mb';
        const allowedTypes = fileSettings.allowedTypes || [];

        return (
          <div className="file-upload-container">
            <div
              className={`file-drop-zone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple={maxFiles > 1}
                onChange={(e) => handleFileUpload(e.target.files)}
                className="file-input"
                accept={allowedTypes.map(type => {
                  switch(type) {
                    case 'image': return 'image/*';
                    case 'pdf': return '.pdf';
                    case 'document': return '.doc,.docx';
                    case 'video': return 'video/*';
                    case 'audio': return 'audio/*';
                    case 'spreadsheet': return '.xls,.xlsx,.csv';
                    default: return '';
                  }
                }).join(',')}
              />
              <div className="file-upload-content">
                <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <p>Drag & drop files here or click to browse</p>
                <p className="file-info">
                  Max {maxFiles} file{maxFiles > 1 ? 's' : ''}, up to {maxFileSize} each
                </p>
              </div>
            </div>
            
            {/* Display uploaded files */}
            {Array.isArray(value) && value.length > 0 && (
              <div className="uploaded-files">
                {value.map((file, index) => (
                  <div key={index} className="uploaded-file">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newFiles = value.filter((_, i) => i !== index);
                        handleInputChange(newFiles);
                      }}
                      className="remove-file-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="media-container">
            <img
              src={question.content || '/placeholder-image.jpg'}
              alt="Form image"
              className="form-image"
            />
          </div>
        );

      case 'video':
        return (
          <div className="media-container">
            <video
              src={question.content}
              controls
              className="form-video"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            className="question-input text-input"
            placeholder="Your answer..."
            required={question.required}
          />
        );
    }
  };

  return (
    <div className="question-renderer">
      <div className="question-header">
        <h3 className="question-title">
          {question.title}
          {question.required && <span className="required-indicator">*</span>}
        </h3>
        {question.content && (
          <p className="question-description">{question.content}</p>
        )}
      </div>
      <div className="question-input-container">
        {renderQuestionInput()}
      </div>
    </div>
  );
};

export default QuestionRenderer;
