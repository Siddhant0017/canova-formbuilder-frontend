import React from 'react';
import { evaluateConditions } from '../utils/conditionalLogic';

const FormSubmissionHandler = ({ form, formData, onSubmit }) => {
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await onSubmit(formData);
      
      const redirectUrl = evaluateConditions(
        formData, 
        form.conditionalLogic, 
        form.defaultRedirect
      );
      
      if (redirectUrl) {
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);
      }
      
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  };

  return { handleFormSubmit };
};

export default FormSubmissionHandler;
