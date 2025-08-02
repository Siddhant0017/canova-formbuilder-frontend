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
                            const currentPageElements = form.pages[currentPageIndex]?.layout || questionElements;
                            const sections = [];
                            let currentSection = { color: '#ffffff', questions: [] };

                            currentPageElements.forEach(item => {
                                if (typeof item === 'string') {
                                    const question = form.questions.find(q => q.id === item);
                                    if (question) {
                                        currentSection.questions.push(question);
                                    }
                                } else if (item.type === 'section-break') {
                                    if (currentSection.questions.length > 0) {
                                        sections.push(currentSection);
                                    }
                                    currentSection = {
                                        color: item.color || form.design?.sectionColor || '#ffffff',
                                        questions: []
                                    };
                                }
                            });

                            if (currentSection.questions.length > 0) {
                                sections.push(currentSection);
                            }

                            if (sections.length === 0 && questionElements) {
                                const allQuestions = questionElements.map(id =>
                                    form.questions.find(q => q.id === id)
                                ).filter(Boolean);
                                sections.push({ color: '#ffffff', questions: allQuestions });
                            }

                            return sections.map((section, sectionIndex) => (
                                <div
                                    key={sectionIndex}
                                    className="preview-section-container" // Different class name
                                    style={{
                                        backgroundColor: section.color,
                                        padding: section.color !== '#ffffff' ? '24px' : '16px',
                                        borderRadius: section.color !== '#ffffff' ? '12px' : '0',
                                        marginBottom: '16px',
                                        border: section.color !== '#ffffff' ? '1px solid #e5e7eb' : 'none'
                                    }}
                                >
                                    {section.questions.map(question => (
                                        <div key={question.id} className="preview-question-item">
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