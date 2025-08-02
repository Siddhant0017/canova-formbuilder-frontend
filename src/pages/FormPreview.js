import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import QuestionRenderer from '../components/QuestionRenderer';
import './FormPreview.css';

const FormPreview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState(location.state?.form || null);
    const [responses, setResponses] = useState({});
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(!form);

    useEffect(() => {
        if (!form && id) {
            const fetchForm = async () => {
                try {
                    setIsLoading(true);
                    const response = await api.get(`/forms/${id}`);
                    setForm(response.data.form);
                } catch (error) {
                    toast.error("Failed to load form.");
                    console.error('Error fetching form:', error);
                    navigate('/dashboard');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchForm();
        } else if (!id) {
            toast.error("Form ID is missing.");
            navigate('/dashboard');
        }
    }, [id, navigate, form]);

    const handleInputChange = (questionId, value) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: value
        }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        toast.info("This is a preview. Form submissions are disabled.");
    };

    const handleNextPage = () => {
        if (currentPageIndex < form.pages.length - 1) {
            setCurrentPageIndex(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(prev => prev - 1);
        }
    };

    if (isLoading || !form) {
        return (
            <div className="form-preview-loading">
                <div className="loading-spinner"></div>
                <p>Loading form preview...</p>
            </div>
        );
    }
    
    const currentPage = form.pages[currentPageIndex];
    const currentPageElements = currentPage.layout || [];
    const questionElements = currentPageElements.filter(item => typeof item === 'string');

    return (
        <div className="form-preview-page">
            <div className="form-preview-container">
                <h1 className="form-title">{form.title}</h1>
                <p className="form-description">{form.description}</p>
                <form onSubmit={handleSubmit}>
                <div className="questions-list">
    {(() => {
        // Get current page elements (including section breaks)
        const currentPageElements = form.pages[currentPageIndex]?.layout || questionElements;
        
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
        
        // If no sections were created, create one default section with all questions
        if (sections.length === 0) {
            const allQuestions = questionElements.map(id => form.questions.find(q => q.id === id)).filter(Boolean);
            sections.push({ id: 'default', color: '#ffffff', questions: allQuestions });
        }
        
        // Render sections
        return sections.map((section, sectionIndex) => (
            <div 
                key={section.id} 
                className="preview-section"
                style={{ 
                    backgroundColor: section.color,
                    padding: '24px',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    border: '1px solid #e5e7eb'
                }}
            >
                {/* Optional: Section label for preview clarity */}
                {sections.length > 1 && (
                    <div className="preview-section-label">
                        Section {sectionIndex + 1}
                    </div>
                )}
                
                {section.questions.map(question => (
                    <div key={question.id} className="preview-question-in-section">
                        <QuestionRenderer
                            question={question}
                            value={responses[question.id]}
                            onChange={(value) => handleInputChange(question.id, value)}
                            readOnly={true}
                        />
                    </div>
                ))}
            </div>
        ));
    })()}
</div>

                    <div className="form-navigation">
                        {form.pages.length > 1 && currentPageIndex > 0 && (
                            <button type="button" className="prev-btn" onClick={handlePrevPage}>Previous</button>
                        )}
                        {currentPageIndex < form.pages.length - 1 ? (
                            <button type="button" className="next-btn" onClick={handleNextPage}>Next</button>
                        ) : (
                            <button type="submit" className="submit-btn">Submit</button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormPreview;