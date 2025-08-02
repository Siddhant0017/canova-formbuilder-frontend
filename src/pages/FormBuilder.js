import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from '../contexts/AuthContext';
import DesignPanel from "../components/DesignPanel";
import ConditionalLogicModal from "../components/ConditionalLogicModal";
import QuestionRenderer from "../components/QuestionRenderer";
import api from "../services/api";
import { generateId } from "../utils/helpers";
import "./FormBuilder.css";

const FormBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // NEW: Add project context state
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    const [form, setForm] = useState({
        title: "Untitled Form",
        description: "",
        questions: [],
        design: {
            backgroundColor: "#b6b6b6",
            sectionColor: "#b6b6b6",
            theme: "light",
        },
        pages: [
            { id: 'page-1', name: "Page 01", layout: [{ id: generateId(), type: 'section-break', color: '#DDDDDD' }], active: true, conditionalLogic: { conditions: [], passRedirect: null, failRedirect: null } }
        ],
        defaultRedirect: "",
        status: "draft",
    });

    const [currentPage, setCurrentPage] = useState('page-1');
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [showDesignPanel, setShowDesignPanel] = useState(false);
    const [showConditionalModal, setShowConditionalModal] = useState(false);
    const [currentPageForCondition, setCurrentPageForCondition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [formId, setFormId] = useState(id);

    const [isConditionSelectionMode, setIsConditionSelectionMode] = useState(false);
    const [selectedConditions, setSelectedConditions] = useState([]);

   
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('project');
        
        if (projectId) {
            console.log('Form will be associated with project:', projectId);
            setSelectedProjectId(projectId);
        }
    }, []);

    useEffect(() => {
        if (id && id !== "new") {
            fetchForm();
        } else {
            setLoading(false); 
        }
    }, [id]);

    useEffect(() => {
        if (formId && formId !== "new" && formId !== id) {
            window.history.replaceState(null, null, `/form-builder/${formId}`);
        }
    }, [formId, id]);

    const fetchForm = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/forms/${id}`);
            const fetchedForm = {
                ...response.data.form,
                pages: response.data.form.pages.map(page => ({
                    ...page,
                    layout: page.layout && page.layout.length > 0 ? page.layout : [{ id: generateId(), type: 'section-break', color: '#DDDDDD' }],
                    conditionalLogic: page.conditionalLogic || { conditions: [], passRedirect: null, failRedirect: null }
                }))
            };
            setForm(fetchedForm);
            setFormId(response.data.form._id);
        } catch (error) {
            toast.error("Failed to load form");
            navigate("/dashboard");
        } finally {
            setLoading(false);
        }
    };

    
    const saveFormBeforeNavigation = async () => {
        try {
            setSaving(true);
            
           
            const formDataWithProject = {
                ...form,
                project: selectedProjectId 
            };

            if (formId && formId !== "new") {
                await api.put(`/forms/${formId}/draft`, formDataWithProject);
                return formId;
            } else {
                const response = await api.post("/forms", formDataWithProject);
                const newFormId = response.data.form._id;
                setFormId(newFormId);
                return newFormId;
            }
        } catch (error) {
            toast.error("Failed to save form");
            throw error;
        } finally {
            setSaving(false);
        }
    };

   
    const handleSave = async () => {
        try {
            await saveFormBeforeNavigation();
            toast.success("Form saved successfully!");
            
          
            if (selectedProjectId) {
                navigate(`/project/${selectedProjectId}/forms`);
            } else {
                navigate("/dashboard");
            }
        } catch (error) {
            
        }
    };

    const addQuestion = (type) => {
        const newQuestion = {
            id: generateId(),
            type,
            title: type === 'rating' ? "Rate us on scale 1 to 5 ?" : "What is ?",
            content: "",
            options: (type === "text" || type === "textarea" || type === "date" || type === "linear-scale" || type === "rating")
                ? []
                : [
                    { id: generateId(), text: "Option 01", isCorrect: false },
                    { id: generateId(), text: "Option 02", isCorrect: false },
                    { id: generateId(), text: "Option 03", isCorrect: false }
                ],
            required: false,
            order: form.questions.length, 
            pageId: currentPage,
            dateSettings: type === 'date' ? { format: 'DD/MM/YYYY' } : null,
            linearScaleSettings: type === 'linear-scale' ? {
                min: 0, max: 10, minLabel: 'Scale Starting', maxLabel: 'Scale Ending', defaultValue: 5
            } : null,
            ratingSettings: type === 'rating' ? {
                maxStars: 5, starCount: 5
            } : null,
            fileSettings: type === 'file-upload' ? {
                maxFiles: 5, maxFileSize: '5mb', allowedTypes: ['image', 'pdf', 'ppt', 'document', 'video', 'zip', 'audio', 'spreadsheet']
            } : null
        };

        setForm((prev) => ({
            ...prev,
            questions: [...prev.questions, newQuestion],
            pages: prev.pages.map(page =>
                page.id === currentPage
                    ? { ...page, layout: [...(page.layout || []), newQuestion.id] }
                    : page
            )
        }));

        setActiveQuestion(newQuestion.id);
    };

    const addSection = () => {
        const newSectionBreak = {
            id: generateId(),
            type: 'section-break',
            color: '#ffffff'
        };

        setForm((prev) => ({
            ...prev,
            pages: prev.pages.map(page =>
                page.id === currentPage
                    ? { ...page, layout: [...(page.layout || []), newSectionBreak] }
                    : page
            )
        }));
    };

    const updateSection = (sectionId, updates) => {
        setForm((prev) => ({
            ...prev,
            pages: prev.pages.map(page => ({
                ...page,
                layout: page.layout.map(item =>
                    item.type === 'section-break' && item.id === sectionId
                        ? { ...item, ...updates }
                        : item
                )
            }))
        }));
    };

    const updateQuestion = (questionId, updates) => {
        setForm((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
                q.id === questionId ? { ...q, ...updates } : q
            ),
        }));
    };

    const updateQuestionType = (questionId, newType) => {
        const question = form.questions.find(q => q.id === questionId);
        if (!question) return;

        let updatedQuestion = { ...question, type: newType };
        updatedQuestion.dateSettings = null;
        updatedQuestion.linearScaleSettings = null;
        updatedQuestion.ratingSettings = null;
        updatedQuestion.fileSettings = null;

        if (newType === 'text' || newType === 'textarea') {
            updatedQuestion.options = [];
        } else if (newType === 'date') {
            updatedQuestion.options = [];
            updatedQuestion.dateSettings = { format: 'DD/MM/YYYY' };
        } else if (newType === 'linear-scale') {
            updatedQuestion.options = [];
            updatedQuestion.linearScaleSettings = {
                min: 0, max: 10, minLabel: 'Scale Starting', maxLabel: 'Scale Ending', defaultValue: 5
            };
        } else if (newType === 'rating') {
            updatedQuestion.options = [];
            updatedQuestion.title = "Rate us on scale 1 to 5 ?";
            updatedQuestion.ratingSettings = {
                maxStars: 5, starCount: 5
            };
        } else if (newType === 'file-upload') {
            updatedQuestion.options = [];
            updatedQuestion.fileSettings = {
                maxFiles: 5, maxFileSize: '5mb', allowedTypes: ['image', 'pdf', 'ppt', 'document', 'video', 'zip', 'audio', 'spreadsheet']
            };
        } else if (!question.options || question.options.length === 0) {
            updatedQuestion.options = [
                { id: generateId(), text: "Option 01", isCorrect: false },
                { id: generateId(), text: "Option 02", isCorrect: false },
                { id: generateId(), text: "Option 03", isCorrect: false }
            ];
        }
        updateQuestion(questionId, updatedQuestion);
    };

    const addOption = (questionId) => {
        const question = form.questions.find(q => q.id === questionId);
        if (!question) return;
        const newOption = { id: generateId(), text: `Option ${(question.options?.length || 0) + 1}`, isCorrect: false };
        const updatedOptions = [...(question.options || []), newOption];
        updateQuestion(questionId, { options: updatedOptions });
    };

    const updateOption = (questionId, optionId, updates) => {
        const question = form.questions.find(q => q.id === questionId);
        if (!question) return;
        const updatedOptions = question.options.map(option =>
            option.id === optionId ? { ...option, ...updates } : option
        );
        updateQuestion(questionId, { options: updatedOptions });
    };

    const removeOption = (questionId, optionId) => {
        const question = form.questions.find(q => q.id === questionId);
        if (!question || question.options.length <= 2) return;
        const updatedOptions = question.options.filter(option => option.id !== optionId);
        updateQuestion(questionId, { options: updatedOptions });
    };

    const handleOptionKeyDown = (e, questionId, optionId, optionIndex) => {
        if (e.key === 'Enter' && !isConditionSelectionMode) {
            e.preventDefault();
            addOption(questionId);
            setTimeout(() => {
                const newIndex = optionIndex + 1;
                const newInput = document.querySelector(`[data-option-index="${newIndex}"]`);
                if (newInput) newInput.focus();
            }, 0);
        } else if (e.key === 'Backspace' && e.target.value === '' && !isConditionSelectionMode) {
            e.preventDefault();
            const question = form.questions.find(q => q.id === questionId);
            if (question && question.options.length > 2) {
                removeOption(questionId, optionId);
                const prevIndex = optionIndex - 1;
                if (prevIndex >= 0) {
                    setTimeout(() => {
                        const prevInput = document.querySelector(`[data-option-index="${prevIndex}"]`);
                        if (prevInput) prevInput.focus();
                    }, 0);
                }
            }
        }
    };

    const toggleConditionSelection = (questionId, optionId) => {
        if (!isConditionSelectionMode) return;
        const conditionKey = `${questionId}::${optionId}`;
        setSelectedConditions(prev => {
            if (prev.includes(conditionKey)) {
                return prev.filter(item => item !== conditionKey);
            } else {
                return [...prev, conditionKey];
            }
        });
    };

    const updateDesign = (designUpdates) => {
        setForm((prev) => ({
            ...prev,
            design: { ...prev.design, ...designUpdates },
        }));
    };

    const updatePageConditionalLogic = (pageId, updates) => {
        setForm(prev => ({
            ...prev,
            pages: prev.pages.map(page =>
                page.id === pageId
                    ? { ...page, conditionalLogic: updates }
                    : page
            )
        }));
    };

    const addPage = () => {
        const pageNumber = form.pages.length + 1;
        const newPage = {
            id: `page-${pageNumber}`,
            name: `Page ${pageNumber.toString().padStart(2, '0')}`,
            layout: [{ id: generateId(), type: 'section-break', color: '#DDDDDD' }],
            active: false,
            conditionalLogic: { conditions: [], passRedirect: null, failRedirect: null }
        };
        setForm(prev => ({
            ...prev,
            pages: [...prev.pages, newPage]
        }));
    };

    const switchPage = (pageId) => {
        setCurrentPage(pageId);
        setForm(prev => ({
            ...prev,
            pages: prev.pages.map(page => ({
                ...page,
                active: page.id === pageId
            }))
        }));
    };

    const handleAddCondition = () => {
        if (form.pages.length <= 1) {
            toast.info("Add more pages before setting up conditions!");
            return;
        }
        setIsConditionSelectionMode(true);
        setSelectedConditions([]);
        toast.info("Condition selection mode activated. Click on answers to select conditions.");
    };

    const handleBottomAddCondition = async () => {
        try {
            await saveFormBeforeNavigation();
            setCurrentPageForCondition(currentPage);
            setShowConditionalModal(true);
        } catch (error) {
           
        }
    };


    const handlePublish = async () => {
        if (form.questions.length === 0) {
            toast.error("Add at least one question before publishing");
            return;
        }
        try {
            const savedFormId = await saveFormBeforeNavigation();
            const hasConditionalLogicConfigured = form.pages.some(page =>
                page.conditionalLogic && Array.isArray(page.conditionalLogic.conditions) && page.conditionalLogic.conditions.length > 0
            );

            if (hasConditionalLogicConfigured || form.pages.length > 1) {
                navigate(`/form-logic/${savedFormId}`, { state: { form: form }, replace: false });
            } else {
                navigate(`/form-preview/${savedFormId}`, { state: { form: form }, replace: false });
            }
        } catch (error) {
            console.error("Error during handlePublish navigation:", error);
        }
    };

    const handlePreview = async () => {
        try {
            const savedFormId = await saveFormBeforeNavigation();
            const formToPass = {
                ...form,
                questions: form.questions.filter(q => q.title && q.title.trim())
            };
            navigate(`/form-preview/${savedFormId}`, { state: { form: formToPass }, replace: false });
        } catch (error) {
            
        }
    };

    const currentPageElements = form.pages
        .find(page => page.id === currentPage)?.layout || [];
    

    // UPDATED SECTION RENDERING LOGIC:
const sectionsToRender = [];
let currentSection = { id: 'default-section', color: '#DDDDDD', elements: [] };

// First, collect all section breaks
const sectionBreaks = currentPageElements.filter(item => item.type === 'section-break');

// If no section breaks, create one default section with all questions
if (sectionBreaks.length === 0) {
    currentSection.elements = currentPageElements.filter(item => typeof item === 'string');
    sectionsToRender.push(currentSection);
} else {
    // Group elements by sections
    let sectionIndex = 0;
    let currentSectionBreak = sectionBreaks[sectionIndex];
    
    currentPageElements.forEach(item => {
        if (typeof item === 'string') {
            // It's a question ID
            currentSection.elements.push(item);
        } else if (item.type === 'section-break') {
            // It's a section break
            if (currentSection.elements.length > 0 || sectionsToRender.length === 0) {
                sectionsToRender.push(currentSection);
            }
            // Start new section
            currentSection = { 
                id: item.id, 
                color: item.color || '#6bd4c6', 
                elements: [] 
            };
            sectionIndex++;
        }
    });
    
    // Add the last section
    sectionsToRender.push(currentSection);
}


    const getQuestionTypeLabel = (type) => {
        const typeMap = {
            'text': 'Short Answer', 'textarea': 'Long Answer', 'multiple-choice': 'Multiple Choice', 'checkbox': 'Checkbox', 'dropdown': 'Dropdown',
            'date': 'Date', 'linear-scale': 'Linear Scale', 'rating': 'Rating', 'file-upload': 'File Upload', 'image': 'Image', 'video': 'Video'
        };
        return typeMap[type] || 'Short Answer';
    };

    const renderQuestionAnswerBox = (question) => {
        switch (question.type) {
            case 'text': return <div className="answer-box short-answer"></div>;
            case 'textarea': return <div className="answer-box long-answer"></div>;
            case 'date': return (<div className="date-input-container"><div className="date-input-wrapper"><input type="text" placeholder="DD/MM/YYYY" className="date-input" disabled /><svg className="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg></div></div>);
            case 'linear-scale': return (<div className="linear-scale-container"><div className="scale-inputs"><input type="text" value={question.linearScaleSettings?.minLabel || 'Scale Starting'} onChange={(e) => updateQuestion(question.id, { linearScaleSettings: { ...question.linearScaleSettings, minLabel: e.target.value } })} className="scale-input" placeholder="Scale Starting" /><input type="text" value={question.linearScaleSettings?.maxLabel || 'Scale Ending'} onChange={(e) => updateQuestion(question.id, { linearScaleSettings: { ...question.linearScaleSettings, maxLabel: e.target.value } })} className="scale-input" placeholder="Scale Ending" /></div><div className="scale-slider-container"><span className="scale-label left">0</span><div className="scale-slider"><div className="slider-track"><div className="slider-thumb" style={{ left: '50%' }}><svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22,4 12,14.01 9,11.01" /></svg></div></div></div><span className="scale-label right">10</span></div></div>);
            case 'rating': return (<div className="rating-container"><div className="rating-display"><div className="stars-container">{[...Array(5)].map((_, index) => (<svg key={index} className="star-icon" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>))}</div><div className="star-count-display"><span className="star-count-label">Star Count:</span><input type="number" value={question.ratingSettings?.starCount || 5} onChange={(e) => updateQuestion(question.id, { ratingSettings: { ...question.ratingSettings, starCount: parseInt(e.target.value) || 5 } })} className="star-count-input" min="1" max="10" /></div></div></div>);
            case 'multiple-choice': return (<div className="answer-options">{question.options?.map((option, index) => { const conditionKey = `${question.id}::${option.id}`; const isSelected = selectedConditions.includes(conditionKey); return (<div key={option.id} className={`option-item ${isConditionSelectionMode ? 'selectable' : ''} ${isSelected ? 'selected' : ''}`} onClick={() => toggleConditionSelection(question.id, option.id)} style={{ cursor: isConditionSelectionMode ? 'pointer' : 'default' }}><input type="radio" name={`question-${question.id}`} className="option-input radio-input" disabled /><input type="text" value={option.text} onChange={(e) => updateOption(question.id, option.id, { text: e.target.value })} onKeyDown={(e) => handleOptionKeyDown(e, question.id, option.id, index)} className="option-text-input" data-option-index={index} disabled={isConditionSelectionMode} />{question.options.length > 2 && !isConditionSelectionMode && (<button className="remove-option-btn" onClick={(e) => { e.stopPropagation(); removeOption(question.id, option.id); }}>×</button>)}</div>); })} {!isConditionSelectionMode && (<button className="add-option-btn" onClick={() => addOption(question.id)}>+ Add Option</button>)}</div>);
            case 'checkbox': return (<div className="answer-options checkbox-options">{question.options?.map((option, index) => { const conditionKey = `${question.id}::${option.id}`; const isSelected = selectedConditions.includes(conditionKey); return (<div key={option.id} className={`option-item checkbox-item ${isConditionSelectionMode ? 'selectable' : ''} ${isSelected ? 'selected' : ''}`} onClick={() => toggleConditionSelection(question.id, option.id)} style={{ cursor: isConditionSelectionMode ? 'pointer' : 'default' }}><input type="checkbox" className="option-input checkbox-input" disabled /><input type="text" value={option.text} onChange={(e) => updateOption(question.id, option.id, { text: e.target.value })} onKeyDown={(e) => handleOptionKeyDown(e, question.id, option.id, index)} className="option-text-input" data-option-index={index} disabled={isConditionSelectionMode} />{question.options.length > 2 && !isConditionSelectionMode && (<button className="remove-option-btn" onClick={(e) => { e.stopPropagation(); removeOption(question.id, option.id); }}>×</button>)}</div>); })} {!isConditionSelectionMode && (<button className="add-option-btn" onClick={() => addOption(question.id)}>+ Add Option</button>)}</div>);
            case 'dropdown': return (<div className="dropdown-options">{question.options?.map((option, index) => { const conditionKey = `${question.id}::${option.id}`; const isSelected = selectedConditions.includes(conditionKey); return (<div key={option.id} className={`dropdown-option-item ${isConditionSelectionMode ? 'selectable' : ''} ${isSelected ? 'selected' : ''}`} onClick={() => toggleConditionSelection(question.id, option.id)} style={{ cursor: isConditionSelectionMode ? 'pointer' : 'default' }}><input type="text" value={option.text} onChange={(e) => updateOption(question.id, option.id, { text: e.target.value })} onKeyDown={(e) => handleOptionKeyDown(e, question.id, option.id, index)} className="dropdown-option-input" placeholder={`Drop Down Option ${index + 1}`} data-option-index={index} disabled={isConditionSelectionMode} />{question.options.length > 2 && !isConditionSelectionMode && (<button className="remove-option-btn" onClick={(e) => { e.stopPropagation(); removeOption(question.id, option.id); }}>×</button>)}</div>); })} {!isConditionSelectionMode && (<button className="add-option-btn" onClick={() => addOption(question.id)}>+ Add Option</button>)}</div>);
            case 'file-upload': return (<div className="file-upload-settings"><div className="file-setting-row"><span className="file-setting-label">Number of Files:</span><input type="number" value={question.fileSettings?.maxFiles || 5} onChange={(e) => updateQuestion(question.id, { fileSettings: { ...question.fileSettings, maxFiles: parseInt(e.target.value) || 5 } })} className="file-setting-input" min="1" max="10" /><div className="file-type-selectors">{['image', 'pdf', 'ppt', 'document'].map((type) => (<div key={type} className="file-type-chip">{type}</div>))}</div></div><div className="file-setting-row"><span className="file-setting-label">Max File Size:</span><select value={question.fileSettings?.maxFileSize || '5mb'} onChange={(e) => updateQuestion(question.id, { fileSettings: { ...question.fileSettings, maxFileSize: e.target.value } })} className="file-setting-select"><option value="1mb">1MB</option><option value="5mb">5MB</option><option value="10mb">10MB</option><option value="25mb">25MB</option><option value="50mb">50MB</option></select><div className="file-type-selectors">{['video', 'zip', 'audio', 'spreadsheet'].map((type) => (<div key={type} className="file-type-chip">{type}</div>))}</div></div></div>);
            default: return <div className="answer-box short-answer"></div>;
        }
    };

    if (loading) {
        return (<div className="form-builder-loading"><div className="loading-spinner"></div><p>Loading form builder...</p></div>);
    }

    return (
        <div className="form-builder-page">
            {isConditionSelectionMode && (<div className="condition-mode-overlay"><div className="condition-mode-banner"><span>Condition Selection Mode Active - Click on answers to select conditions</span><button className="exit-condition-mode" onClick={() => { setIsConditionSelectionMode(false); setSelectedConditions([]); }}>Exit</button></div></div>)}
            <div className="form-builder-sidebar">
                <div className="sidebar-content">
                    <div className="sidebar-logo"><div className="logo-icon"><div className="logo-shape"></div></div><span className="logo-text">CANOVA</span></div>
                    <div className="pages-section">{form.pages.map((page) => (<div key={page.id} className={`page-item ${currentPage === page.id ? 'active' : ''}`} onClick={() => switchPage(page.id)}><span>{page.name}</span>{page.conditionalLogic && (<span className="condition-indicator">⚡</span>)}</div>))}</div>
                    <button className="add-page-btn" onClick={addPage}><svg className="plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg><span>Add new Page</span></button>
                </div>
                <div className="sidebar-profile"><div className="profile-info"><svg className="profile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg><span>{user?.name || 'Profile'}</span></div></div>
            </div>
            <div className="form-builder-main">
                <div className="form-builder-header">
                    <input type="text" className="form-title-input" value={form.title} onChange={(e) => { const newTitle = e.target.value; setForm((prev) => ({ ...prev, title: newTitle })); }} placeholder="Form Title" />
                    <div className="header-actions">
                        <button className="preview-btn" onClick={handlePreview}>Preview</button>
                        <button className="save-btn" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                    </div>
                </div>
                <div className="form-content">
                    <div className="questions-section">
                        {/* Render Layout */}
                        {sectionsToRender.length === 0 ? (
                            <div className="empty-content">
                                <span className="empty-text">No questions or sections on this page</span>
                                <p className="empty-subtitle">Start adding questions or sections to build your form</p>
                            </div>
                        ) : (
                            <div className="questions-list" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            {currentPageElements.length === 0 ? (
                                <div className="empty-content">
                                    <span className="empty-text">No questions on this page</span>
                                    <p className="empty-subtitle">Start adding questions to build your form</p>
                                </div>
                            ) : (
                                <div className="questions-container">
                                    {currentPageElements.map((item, index) => {
                                        if (typeof item === 'string') { 
                                            // It's a question ID
                                            const question = form.questions.find(q => q.id === item);
                                            if (!question) return null;
                                            
                                            // Determine section color based on preceding section breaks
                                            const precedingSectionBreaks = currentPageElements
                                                .slice(0, index)
                                                .filter(el => el.type === 'section-break');
                                            
                                            const currentSectionColor = precedingSectionBreaks.length > 0 
                                                ? precedingSectionBreaks[precedingSectionBreaks.length - 1].color || form.design.sectionColor
                                                : '#ffffff'; // Default to white for first section
                                            
                                            return (
                                                <div 
                                                    key={item} 
                                                    className="question-container" // Using your existing class
                                                    style={{ 
                                                        backgroundColor: currentSectionColor,
                                                        padding: currentSectionColor !== '#ffffff' ? '20px' : '20px', // Keep consistent padding
                                                        borderRadius: '8px',
                                                        marginBottom: '20px',
                                                        border: currentSectionColor !== '#ffffff' ? '1px solid rgba(179, 179, 179, 0.2)' : '1px solid rgba(179, 179, 179, 0.2)'
                                                    }}
                                                >
                                                    {/* Question Header - Using your existing structure */}
                                                    <div className="question-header">
                                                        <div className="question-info">
                                                            <span className="question-number">Q{index + 1}</span>
                                                            <input
                                                                type="text"
                                                                value={question.title}
                                                                onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                                                                className="question-title-input"
                                                                placeholder="Question title"
                                                                disabled={isConditionSelectionMode}
                                                            />
                                                        </div>
                                                        <div className="question-type-selector">
                                                            <div className="question-type-display">
                                                                <svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                                    <polyline points="6,9 12,15 18,9" />
                                                                </svg>
                                                                <span className="type-label">{getQuestionTypeLabel(question.type)}</span>
                                                            </div>
                                                            <select
                                                                value={question.type}
                                                                onChange={(e) => updateQuestionType(question.id, e.target.value)}
                                                                className="type-select"
                                                                disabled={isConditionSelectionMode}
                                                            >
                                                                <option value="text">Short Answer</option>
                                                                <option value="textarea">Long Answer</option>
                                                                <option value="multiple-choice">Multiple Choice</option>
                                                                <option value="checkbox">Checkbox</option>
                                                                <option value="dropdown">Dropdown</option>
                                                                <option value="date">Date</option>
                                                                <option value="linear-scale">Linear Scale</option>
                                                                <option value="rating">Rating</option>
                                                                <option value="file-upload">File Upload</option>
                                                                <option value="image">Image</option>
                                                                <option value="video">Video</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Question Answer Area - Using your existing structure */}
                                                    <div className="question-answer">
                                                        {renderQuestionAnswerBox(question)}
                                                    </div>
                                                </div>
                                            );
                                        } else if (item.type === 'section-break') { 
                                            // It's a section break - show as horizontal divider
                                            return (
                                                <div key={item.id} className="section-break-divider">
                                                    <hr 
                                                        className="section-separator" 
                                                        style={{ 
                                                            borderColor: item.color || form.design.sectionColor,
                                                            borderWidth: '2px',
                                                            margin: '24px 0',
                                                            border: 'none',
                                                            borderTop: `2px solid ${item.color || form.design.sectionColor}`
                                                        }}
                                                    />
                                                    <div className="section-color-control">
                                                        <label style={{ fontSize: '12px', color: '#666', marginRight: '12px' }}>
                                                            Next Section Color:
                                                        </label>
                                                        <input
                                                            type="color"
                                                            value={item.color || form.design.sectionColor}
                                                            onChange={(e) => updateSection(item.id, { color: e.target.value })}
                                                            className="section-color-picker-inline"
                                                            style={{
                                                                width: '24px',
                                                                height: '24px',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                            disabled={isConditionSelectionMode}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            )}
                        </div>
                        
                        
                        
                        
                        )}
                        {isConditionSelectionMode && (<div className="bottom-add-condition"><button className="bottom-condition-btn" disabled={selectedConditions.length === 0} onClick={handleBottomAddCondition}>Add Condition ({selectedConditions.length} selected)</button></div>)}
                    </div>
                </div>
            </div>
            <div className="form-builder-tools">
                <div className="tools-section">
                    <button className="tool-btn" onClick={() => addQuestion('text')} disabled={isConditionSelectionMode}><svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg><span>Add Question</span></button>
                    <button className="tool-btn" onClick={() => addQuestion('text')} disabled={isConditionSelectionMode}><svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="4" y1="7" x2="20" y2="7" /><line x1="10" y1="11" x2="16" y2="11" /><line x1="4" y1="15" x2="20" y2="15" /></svg><span>Add Text</span></button>
                    {/* CORRECT: Add Section Button */}
                    <button className="tool-btn" onClick={addSection} disabled={isConditionSelectionMode}>
                        <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M4 12h16M12 4v16" />
                        </svg>
                        <span>Add Section</span>
                    </button>
                    <button
                        className={`tool-btn ${isConditionSelectionMode ? 'active' : ''}`}
                        onClick={handleAddCondition}
                    >
                        <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14,2 14,8 20,8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10,9 9,9 8,9" />
                        </svg>
                        <span>{isConditionSelectionMode ? 'Exit Conditions' : 'Add Condition'}</span>
                    </button>
                    <button className="tool-btn" onClick={() => addQuestion('image')} disabled={isConditionSelectionMode}>
                        <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21,15 16,10 5,21" />
                        </svg>
                        <span>Add Image</span>
                    </button>
                    <button className="tool-btn" onClick={() => addQuestion('video')} disabled={isConditionSelectionMode}>
                        <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polygon points="23 7 16 12 23 17 23 7" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </svg>
                        <span>Add Video</span>
                    </button>
                </div>
                <div className="color-controls"><div className="color-control"><h3>Background Color</h3><div className="color-picker-container"><div className="color-preview" style={{ backgroundColor: form.design.backgroundColor }}></div><span className="color-value">{form.design.backgroundColor.replace('#', '').toUpperCase()}</span><span className="color-divider">|</span><span className="color-opacity">100%</span></div><input type="color" value={form.design.backgroundColor} onChange={(e) => updateDesign({ backgroundColor: e.target.value })} className="color-input" disabled={isConditionSelectionMode} /></div><div className="color-control"><h3>Section Color</h3><div className="color-picker-container"><div className="color-preview" style={{ backgroundColor: form.design.sectionColor }}></div><span className="color-value">{form.design.sectionColor.replace('#', '').toUpperCase()}</span><span className="color-divider">|</span><span className="color-opacity">100%</span></div><input type="color" value={form.design.sectionColor} onChange={(e) => updateDesign({ sectionColor: e.target.value })} className="color-input" disabled={isConditionSelectionMode} /></div></div>
                {!isConditionSelectionMode && (<button className="next-btn-bottom" onClick={handlePublish}>Next</button>)}
            </div>
            {showDesignPanel && (<DesignPanel design={form.design} onUpdate={updateDesign} onClose={() => setShowDesignPanel(false)} />)}
            {showConditionalModal && (<ConditionalLogicModal pages={form.pages} currentPageId={currentPageForCondition || currentPage} selectedConditions={selectedConditions} showJumpToPageOnly={true} conditionalLogic={form.pages.find(p => p.id === (currentPageForCondition || currentPage))?.conditionalLogic} onUpdate={(updates) => { updatePageConditionalLogic(currentPageForCondition || currentPage, updates); setShowConditionalModal(false); setIsConditionSelectionMode(false); setSelectedConditions([]); }} onClose={() => { setShowConditionalModal(false); setIsConditionSelectionMode(false); setSelectedConditions([]); }} />)}
        </div>
    );
};

export default FormBuilder;
