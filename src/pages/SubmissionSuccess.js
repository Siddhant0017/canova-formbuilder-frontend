// src/pages/SubmissionSuccess.js (Updated)
import React from 'react';
import './SubmissionSuccess.css'; 

const SubmissionSuccess = () => {
    return (
        <div className="submission-success-page">
            <div className="success-container">
                <h1 className="success-title">Thank You!</h1>
                <p className="success-message">Your form has been submitted successfully.</p>
                <p className="success-message">Have a great day.</p>
            </div>
        </div>
    );
};

export default SubmissionSuccess;