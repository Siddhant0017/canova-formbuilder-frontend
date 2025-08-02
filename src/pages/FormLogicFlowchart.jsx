import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from '../contexts/AuthContext';
import PublishModal from "../components/PublishModal";
import ShareModal from "../components/ShareModal";
import api from "../services/api";
import "./FormLogicFlowchart.css";

export default function FormLogicFlowchart() {
    const { id } = useParams(); 
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [form, setForm] = useState(null);
    const [isLoadingForm, setIsLoadingForm] = useState(true);
    const [selectedPageId, setSelectedPageId] = useState(null);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    const redirectTimeoutRef = useRef(null);
    const redirectInitiated = useRef(false);

    // Your existing useEffect hooks remain exactly the same...
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setIsLoadingProjects(true);
                const response = await api.get('/projects');
                setProjects(response.data.projects || []);
            } catch (error) {
                toast.error('Failed to load projects for publishing.');
                console.error('Error fetching projects:', error);
            } finally {
                setIsLoadingProjects(false);
            }
        };
        fetchProjects();
    }, []);

    useEffect(() => {
        if (redirectTimeoutRef.current) {
            clearTimeout(redirectTimeoutRef.current);
            redirectTimeoutRef.current = null;
        }

        if (redirectInitiated.current) {
            return;
        }

        if (id) {
            const fetchFormData = async () => {
                try {
                    setIsLoadingForm(true);
                    const response = await api.get(`/forms/${id}`);
                    const fetchedForm = {
                        ...response.data.form,
                        id: id,
                        pages: response.data.form.pages.map(page => ({
                            ...page,
                            conditionalLogic: page.conditionalLogic || { conditions: [], passRedirect: null, failRedirect: null }
                        }))
                    };
                    setForm(fetchedForm);
                    if (fetchedForm.pages.length > 0) {
                        setSelectedPageId(fetchedForm.pages[0].id);
                    }
                } catch (error) {
                    toast.error('Failed to load form data.');
                    console.error('Error fetching form:', error);
                    if (!redirectInitiated.current) {
                        redirectInitiated.current = true;
                        navigate("/dashboard");
                    }
                } finally {
                    setIsLoadingForm(false);
                }
            };
            fetchFormData();
        } else {
            redirectTimeoutRef.current = setTimeout(() => {
                if (!id && !redirectInitiated.current) {
                    redirectInitiated.current = true;
                    toast.error("No form ID provided in the URL.");
                    navigate("/dashboard");
                }
            }, 100);

            return () => {
                if (redirectTimeoutRef.current) {
                    clearTimeout(redirectTimeoutRef.current);
                }
            };
        }
    }, [id, navigate]);

    const pages = form?.pages || [];
    const selectedPage = pages.find(p => p.id === selectedPageId);
    const pageConditionalLogic = selectedPage?.conditionalLogic || { conditions: [], passRedirect: null, failRedirect: null };

    // Your existing handler functions remain exactly the same...
    const handleSaveAndPreview = () => {
        if (form) {
            navigate(`/form-preview/${form.id || "new"}`, { state: { form } });
        }
    };

    const handleOpenPublishModal = () => {
        if (isLoadingProjects || isLoadingForm) {
            toast.info("Loading data, please wait...");
            return;
        }
        if (!form?.id) {
            toast.error("Cannot publish: Form data is not fully loaded or ID is missing.");
            return;
        }
        setIsPublishModalOpen(true);
    };

    const handleClosePublishModal = () => {
        setIsPublishModalOpen(false);
    };

    const handleOpenShareModal = () => {
        setIsShareModalOpen(true);
    };

    const handleCloseShareModal = () => {
        setIsShareModalOpen(false);
        navigate("/dashboard");
    };

    const handlePublishForm = async ({ visibility, projectId, accessControl }) => {
        try {
            if (!form?.id) {
                toast.error("Form ID is missing, cannot publish.");
                return;
            }
            await api.put(`/forms/${form.id}/publish`, {
                visibility,
                project: projectId,
                accessControl
            });
            toast.success("Form published successfully!");
            handleClosePublishModal();
            handleOpenShareModal();
        } catch (error) {
            console.error('Failed to publish form:', error);
            toast.error("Failed to publish form. Please try again.");
        }
    };

    const getQuestionAndOptionDetails = (questionId, optionId) => {
        const question = form?.questions?.find(q => q.id === questionId);
        const option = question?.options?.find(o => o.id === optionId);
        return { question, option };
    };

    if (isLoadingForm) {
        return (
            <div className="form-builder-loading">
                <div className="loading-spinner"></div>
                <p>Loading form logic...</p>
            </div>
        );
    }

    if (!form || pages.length === 0) {
        return (
            <div className="form-builder-page">
                <div className="empty-flowchart">
                    <p>{!form ? "Form data could not be loaded or is invalid." : "No pages found in this form."}</p>
                    <p>Please go back to the Form Builder to add pages.</p>
                    <button onClick={() => navigate(`/form-builder/${id || 'new'}`)}>Go to Form Builder</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flowchart-page">
            {/* ✅ KEEPING YOUR ORIGINAL SIDEBAR - NO CHANGES */}
            <div className="form-builder-sidebar">
                <div className="sidebar-content">
                    <div className="sidebar-logo">
                        <div className="logo-icon">
                            <div className="logo-shape"></div>
                        </div>
                        <span className="logo-text">CANOVA</span>
                    </div>
                    <div className="pages-section">
                        {pages.map((page) => (
                            <div
                                key={page.id}
                                className={`page-item ${selectedPageId === page.id ? 'active' : ''}`}
                                onClick={() => setSelectedPageId(page.id)}
                            >
                                <span>{page.name}</span>
                                {page.conditionalLogic && page.conditionalLogic.conditions && page.conditionalLogic.conditions.length > 0 && (
                                    <span className="condition-indicator">⚡</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="sidebar-profile">
                    <div className="profile-info">
                        <svg className="profile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>{user?.name || 'Profile'}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Updated Design */}
            <main className="flowchart-main">
                <div className="flowchart-container">
                    {/* Title Section */}
                    <div className="flowchart-header">
                        <h1 className="flowchart-title">{form.title}</h1>
                    </div>

                    {/* Flowchart Content */}
                    <div className="flowchart-content">
                        <div className="flowchart-diagram">
                            {selectedPage && pageConditionalLogic.conditions.length > 0 ? (
                                <>
                                    {/* Top Page */}
                                    <div className="flowchart-node top-node">
                                        {selectedPage.name}
                                        <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <polyline points="6,9 12,15 18,9"/>
                                        </svg>
                                    </div>

                                    {/* Vertical line from Top Page */}
                                    <div className="vertical-connector"></div>

                                    {/* True/False Branch Container */}
                                    <div className="branch-container">
                                        <div className="horizontal-connector"></div>
                                        <div className="vertical-true"></div>
                                        <div className="vertical-false"></div>

                                        {/* True Branch */}
                                        <div className="true-branch">
                                            <div className="condition-tag true-tag">
                                                <svg className="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                                </svg>
                                                True
                                            </div>
                                            <div className="branch-connector"></div>
                                            <div className="flowchart-node result-node">
                                                {pages.find(p => p.id === pageConditionalLogic.passRedirect)?.name || "Next Page"}
                                            </div>
                                        </div>

                                        {/* False Branch */}
                                        <div className="false-branch">
                                            <div className="condition-tag false-tag">
                                                <svg className="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                                </svg>
                                                False
                                            </div>
                                            <div className="branch-connector"></div>
                                            <div className="flowchart-node result-node">
                                                {pages.find(p => p.id === pageConditionalLogic.failRedirect)?.name || "End Form"}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="no-logic">
                                    <div className="flowchart-node single-node">
                                        {selectedPage?.name || "Select a Page"}
                                    </div>
                                    <p className="no-logic-text">No conditional logic set for this page</p>
                                    <p className="no-logic-subtext">Page will proceed to next page in sequence</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Next Button */}
                    <div className="flowchart-footer">
                        <button 
                            className="next-button"
                            onClick={handleOpenPublishModal}
                            disabled={isLoadingProjects || isLoadingForm || !form?.id}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </main>

            {/* Your existing modals */}
            <PublishModal
                isOpen={isPublishModalOpen}
                onClose={handleClosePublishModal}
                onPublish={handlePublishForm}
                formId={form?.id}
                currentProject={form?.project}
                ownerUser={user}
                currentAccessControl={form?.accessControl}
                availableProjects={projects}
                api={api}
            />
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={handleCloseShareModal}
                formId={form?.id}
            />
        </div>
    );
}
