import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import QuestionRenderer from '../components/QuestionRenderer';
import './FormViewer.css';

const FormViewer = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState(null);
    const [responses, setResponses] = useState({});
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchForm = async () => {
            if (!id) {
                toast.error("Invalid form link.");
                navigate('/');
                return;
            }
            try {
                setIsLoading(true);
                const response = await api.get(`/forms/${id}`);
                setForm(response.data.form);
            } catch (error) {
                toast.error("Form not found or is restricted.");
                console.error('Error fetching form:', error);
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };

        fetchForm();
    }, [id, navigate]);

    const handleInputChange = (questionId, value) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const evaluateConditionalLogic = () => {
        const currentPage = form.pages[currentPageIndex];
        const logicArray = currentPage.conditionalLogic;
    
        console.log("Evaluating logic for page:", currentPage.id);
        console.log("Saved conditionalLogic array:", logicArray);
        console.log(" Collected responses so far:", responses);
    
        if (!Array.isArray(logicArray) || logicArray.length === 0) {
            console.log("⚠️ No conditional logic found. Proceeding to next page.");
            return { result: 'none' };
        }
    
        for (const logic of logicArray) {
            if (!logic.conditions || logic.conditions.length === 0) continue;
    
            const allConditionsMet = logic.conditions.every(condition => {
                const userAnswer = responses[condition.fieldId];
                const expectedAnswer = condition.value;
    
                console.log(" Checking condition:");
                console.log("   - Field ID:", condition.fieldId);
                console.log("   - Expected:", expectedAnswer);
                console.log("   - Actual:", userAnswer);
    
                if (Array.isArray(userAnswer)) {
                    return userAnswer.includes(expectedAnswer);
                }
                return userAnswer === expectedAnswer;
            });
    
            if (allConditionsMet) {
                console.log(" Conditions matched. Redirect to:", logic.passRedirect);
                return { result: 'pass', redirectPageId: logic.passRedirect };
            } else if (logic.failRedirect) {
                console.log(" Conditions not met. Redirect to:", logic.failRedirect);
                return { result: 'fail', redirectPageId: logic.failRedirect };
            }
        }
    
        console.log("⚠️ No logic block matched. Proceeding to next page.");
        return { result: 'none' };
    };
    
    
    const handleNextPage = () => {
        console.log("Triggered Next button — evaluating conditional logic...");
        const logicResult = evaluateConditionalLogic();
        console.log(" Logic evaluation result:", logicResult);
        

        if (logicResult.result === 'pass' && logicResult.redirectPageId) {
            const nextPageIndex = form.pages.findIndex(p => p.id === logicResult.redirectPageId);
            if (nextPageIndex !== -1) {
                setCurrentPageIndex(nextPageIndex);
            }
        } else if (logicResult.result === 'fail' && logicResult.redirectPageId) {
            const nextPageIndex = form.pages.findIndex(p => p.id === logicResult.redirectPageId);
            if (nextPageIndex !== -1) {
                setCurrentPageIndex(nextPageIndex);
            }
        } else {
            if (currentPageIndex < form.pages.length - 1) {
                setCurrentPageIndex(prev => prev + 1);
            }
        }
        console.log("Jumping to next page based on logic:", logicResult);

    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!id) {
            toast.error("Form ID is missing from the URL, cannot submit.");
            return;
        }

        try {
            setIsLoading(true);
            const answers = Object.keys(responses).map(questionId => ({
                questionId,
                answer: responses[questionId]
            }));

            await api.post(`/forms/${id}/submit`, { answers });
            toast.success("Form submitted successfully! Thank you.");
            navigate('/submission-success');

        } catch (error) {
            toast.error("Failed to submit form.");
            console.error('Error submitting form:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrevPage = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(prev => prev - 1);
        }
    };

    if (isLoading || !form) {
        return (
            <div className="form-viewer-loading">
                <div className="loading-spinner"></div>
                <p>Loading form...</p>
            </div>
        );
    }

    const currentPage = form.pages[currentPageIndex];
    const currentPageElements = currentPage.layout || [];

    const isLastPage = currentPageIndex === form.pages.length - 1;

    return (
        <div className="form-viewer-page">
            <div className="form-viewer-container">
                <h1 className="form-title">{form.title}</h1>
                <p className="form-description">{form.description}</p>
                <form onSubmit={handleSubmit}>
                <div className="questions-list">
    {(() => {
        // Process sections from layout
        const sections = [];
        let currentSection = { id: 'default', color: '#ffffff', questions: [] };
        
        currentPageElements.forEach(item => {
            if (typeof item === 'string') {
                // It's a question ID
                const question = form.questions.find(q => q.id === item);
                if (question) {
                    currentSection.questions.push(question);
                }
            } else if (item.type === 'section-break') {
                // Save current section if it has questions
                if (currentSection.questions.length > 0) {
                    sections.push(currentSection);
                }
                // Start new section
                currentSection = { 
                    id: item.id, 
                    color: item.color || '#ffffff', 
                    questions: [] 
                };
            }
        });
        
        // Add the last section
        if (currentSection.questions.length > 0) {
            sections.push(currentSection);
        }
        
        // Render sections
        return sections.map((section, sectionIndex) => (
            <div 
                key={section.id} 
                className="form-section"
                style={{ 
                    backgroundColor: section.color,
                    padding: '24px',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    border: '1px solid #e5e7eb'
                }}
            >
                {section.questions.map(question => (
                    <div key={question.id} className="question-in-section">
                        <QuestionRenderer
                            question={question}
                            value={responses[question.id]}
                            onChange={(value) => handleInputChange(question.id, value)}
                        />
                    </div>
                ))}
            </div>
        ));
    })()}
</div>

                    <div className="form-navigation">
                        {form.pages.length > 1 && currentPageIndex > 0 && (
                            <button type="button" className="prev-btn" onClick={handlePrevPage} disabled={isLoading}>
                                Previous
                            </button>
                        )}
                        {!isLastPage ? (
                            <button type="button" className="next-btn" onClick={handleNextPage} disabled={isLoading}>
                                Next
                            </button>
                        ) : (
                            <button type="submit" className="submit-btn" disabled={isLoading}>
                                Submit
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormViewer;