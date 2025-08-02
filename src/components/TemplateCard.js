import React from 'react';
import './TemplateCard.css';

const TemplateCard = ({ template, onUse }) => {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'survey': return '';
      case 'feedback': return '';
      case 'registration': return '';
      case 'quiz': return '';
      case 'contact': return '';
      default: return '';
    }
  };

  return (
    <div className="template-card">
      <div 
        className="template-preview"
        style={{ backgroundColor: template.design.backgroundColor }}
      >
        <div 
          className="preview-section"
          style={{ backgroundColor: template.design.sectionColor }}
        >
          <div className="preview-questions">
            {template.questions.slice(0, 2).map((question, index) => (
              <div key={question.id} className="preview-question">
                <span className="question-number">{index + 1}</span>
                <span className="question-title">{question.title}</span>
              </div>
            ))}
            {template.questions.length > 2 && (
              <div className="more-questions">
                +{template.questions.length - 2} more questions
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="template-info">
        <div className="template-header">
          <div className="category-badge">
            <span className="category-icon">{getCategoryIcon(template.category)}</span>
            <span className="category-name">{template.category}</span>
          </div>
        </div>

        <h3 className="template-title">{template.title}</h3>
        <p className="template-description">{template.description}</p>

        <div className="template-stats">
          <span className="stat">
            ❓ {template.questions.length} questions
          </span>
        </div>

        <button className="use-template-btn" onClick={onUse}>
          Use Template
        </button>
      </div>
    </div>
  );
};

export default TemplateCard;
