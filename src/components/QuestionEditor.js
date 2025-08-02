import React, { useState, useRef, useEffect } from 'react';
import { generateId } from '../utils/helpers'; 
import './QuestionEditor.css';

const QuestionEditor = ({ question, onUpdate, onDelete, onDuplicate, sectionColor }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [lastAddedOptionIndex, setLastAddedOptionIndex] = useState(null);
  const optionRefs = useRef([]);

  useEffect(() => {
    if (lastAddedOptionIndex !== null && optionRefs.current[lastAddedOptionIndex]) {
      optionRefs.current[lastAddedOptionIndex].focus();
      setLastAddedOptionIndex(null);
    }
  }, [question.options, lastAddedOptionIndex]);

  const handleOptionUpdate = (optionId, updates) => {
    const updatedOptions = question.options.map(option =>
      option.id === optionId ? { ...option, ...updates } : option
    );
    onUpdate({ options: updatedOptions });
  };

  const addOption = () => {
    const newOptions = [...(question.options || []), {
      id: generateId(),
      text: 'New Option',
      isCorrect: false
    }];
    onUpdate({ options: newOptions });
  };

  const removeOption = (optionId) => {
    const updatedOptions = question.options.filter(option => option.id !== optionId);
    onUpdate({ options: updatedOptions });
  };

  const toggleCorrectAnswer = (optionId) => {
    const updatedOptions = question.options.map(option =>
      option.id === optionId 
        ? { ...option, isCorrect: !option.isCorrect }
        : option
    );
    onUpdate({ options: updatedOptions });
  };

  const setCorrectTextAnswer = (correctAnswer) => {
    onUpdate({ correctAnswer });
  };

  const handleOptionKeyDown = (e, optionId, optionIndex) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const newOption = { id: generateId(), text: "", isCorrect: false };
      const updatedOptions = [...question.options];
      updatedOptions.splice(optionIndex + 1, 0, newOption);
      
      onUpdate({ options: updatedOptions });
      
      
      setLastAddedOptionIndex(optionIndex + 1);
    } else if (e.key === 'Backspace' && e.target.value === '') {
      e.preventDefault();
      
      if (question.options.length > 1) {
        const updatedOptions = question.options.filter((_, idx) => idx !== optionIndex);
        
        onUpdate({ options: updatedOptions });
        
       
        setLastAddedOptionIndex(optionIndex > 0 ? optionIndex - 1 : null);
      }
    }
  };

  const handleQuestionKeyDown = (e) => {
    if (e.key === 'Backspace' && e.target.value === '' && !question.title) {
      e.preventDefault();
   
      onDelete();
    }
  };

  return (
    <div className="question-editor" style={{ backgroundColor: sectionColor }}>
      <div className="question-header">
        <input
          type="text"
          className="question-title-input"
          value={question.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          onKeyDown={handleQuestionKeyDown}
          placeholder="Question Title"
        />
        
        <div className="question-actions">
          <button
            className="correct-answers-btn"
            onClick={() => setShowCorrectAnswers(!showCorrectAnswers)}
          >
            ✓ Set Correct Answer
          </button>
          <button className="duplicate-btn" onClick={onDuplicate}>
            
          </button>
          <button className="delete-btn" onClick={onDelete}>
            
          </button>
        </div>
      </div>

      <textarea
        className="question-content"
        value={question.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        placeholder="Question description..."
        rows={2}
      />

      {/* Correct Answer Section */}
      {showCorrectAnswers && (
        <div className="correct-answers-section">
          <h4>Set Correct Answer(s)</h4>
          
          {question.type === 'text' && (
            <div className="correct-text-answer">
              <input
                type="text"
                placeholder="Enter correct answer"
                value={question.correctAnswer || ''}
                onChange={(e) => setCorrectTextAnswer(e.target.value)}
                className="correct-answer-input"
              />
              <small>Users must type this exact answer to be considered correct</small>
            </div>
          )}

          {(question.type === 'multiple-choice' || question.type === 'checkbox') && (
            <div className="correct-options-list">
              <p>Mark the correct option(s):</p>
              {question.options?.map(option => (
                <div key={option.id} className="correct-option-item">
                  <label className="correct-option-label">
                    <input
                      type={question.type === 'multiple-choice' ? 'radio' : 'checkbox'}
                      name={`correct-${question.id}`}
                      checked={option.isCorrect}
                      onChange={() => toggleCorrectAnswer(option.id)}
                    />
                    <span className={option.isCorrect ? 'correct-option' : ''}>
                      {option.text}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Options for multiple choice/checkbox */}
      {(question.type === 'multiple-choice' || question.type === 'checkbox') && (
        <div className="options-container">
          {question.options?.map((option, index) => (
            <div key={option.id} className="option-item">
              <input
                type="text"
                ref={el => optionRefs.current[index] = el}
                value={option.text}
                onChange={(e) => handleOptionUpdate(option.id, { text: e.target.value })}
                onKeyDown={(e) => handleOptionKeyDown(e, option.id, index)}
                className="option-input"
                placeholder={`Option ${index + 1}`}
              />
              <button
                className="remove-option-btn"
                onClick={() => removeOption(option.id)}
              >
                ×
              </button>
            </div>
          ))}
          <button className="add-option-btn" onClick={addOption}>
            + Add Option
          </button>
        </div>
      )}

      <div className="question-settings">
        <label className="required-checkbox">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) => onUpdate({ required: e.target.checked })}
          />
          Required
        </label>
      </div>
    </div>
  );
};

export default QuestionEditor;
