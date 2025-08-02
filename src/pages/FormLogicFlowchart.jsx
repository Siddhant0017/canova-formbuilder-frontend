import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from '../contexts/AuthContext';
import PublishModal from "../components/PublishModal";
import ShareModal from "../components/ShareModal";
import api from "../services/api";
import "./FormLogicFlowchart.css";

export default function FormLogicFlowchart() {
    const { id } = useParams(); // Correctly called at the top level
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

    // useEffect for fetching projects (correctly placed)
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

    // useEffect for fetching form data based on URL ID (correctly placed)
    useEffect(() => {
        // Clear any pending redirect timeout if this effect re-runs
        if (redirectTimeoutRef.current) {
            clearTimeout(redirectTimeoutRef.current);
            redirectTimeoutRef.current = null;
        }

        // If a redirect has already been initiated, don't run this effect's logic again
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
                        id: id, // Ensure id is explicitly set from useParams
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
            // ID is undefined. Schedule a potential redirect, but allow a small window for it to appear.
            redirectTimeoutRef.current = setTimeout(() => {
                if (!id && !redirectInitiated.current) {
                    redirectInitiated.current = true;
                    toast.error("No form ID provided in the URL.");
                    navigate("/dashboard");
                }
            }, 100); // 100ms delay to allow React Router to catch up

            return () => {
                if (redirectTimeoutRef.current) {
                    clearTimeout(redirectTimeoutRef.current);
                }
            };
        }
    }, [id, navigate]); // Rerun if ID changes

    const pages = form?.pages || [];
    const selectedPage = pages.find(p => p.id === selectedPageId);
    const pageConditionalLogic = selectedPage?.conditionalLogic || { conditions: [], passRedirect: null, failRedirect: null };

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
        <div className="form-builder-page">
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
            <div className="form-builder-main">
                <div className="form-builder-header">
                    <h1 className="form-title">{form.title} - Logic Flowchart</h1>
                    <div className="header-actions">
                        <button className="preview-btn" onClick={handleSaveAndPreview}>
                            Continue to Preview
                        </button>
                        <button className="save-btn" onClick={handleOpenPublishModal} disabled={isLoadingProjects || isLoadingForm || !form?.id}>
                            Publish
                        </button>
                    </div>
                </div>
                <div className="form-content flowchart-content">
                    <div className="flowchart-container">
                        <div className="flowchart">
                            {selectedPage ? (
                                <>
                                    <div className="flowchart-node source-node">
                                        <div className="node-content">
                                            <h3>{selectedPage.name}</h3>
                                            <p>Source Page</p>
                                        </div>
                                    </div>
                                    {pageConditionalLogic.conditions.length > 0 ? (
                                        <div className="flowchart-logic">
                                            {pageConditionalLogic.conditions.map((logic, index) => {
                                                const { question, option } = getQuestionAndOptionDetails(logic.fieldId, logic.value);
                                                return (
                                                    <div key={index} className="flowchart-branch">
                                                        <div className="flowchart-line">
                                                            <div className="line-path"></div>
                                                            <div className="condition-label">
                                                                <span className="condition-text">
                                                                    If "{question?.title || 'Question'}" is "{option?.text || 'selected'}"
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flowchart-node target-node">
                                                            <div className="node-content">
                                                                <h3>{pages.find(p => p.id === pageConditionalLogic.passRedirect)?.name || "N/A"}</h3>
                                                                <p>Go to this page (Pass)</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {pageConditionalLogic.failRedirect && (
                                                <div className="flowchart-branch default-branch">
                                                    <div className="flowchart-line default-line">
                                                        <div className="line-path"></div>
                                                        <div className="condition-label">
                                                            <span className="condition-text">If any condition fails</span>
                                                        </div>
                                                    </div>
                                                    <div className="flowchart-node target-node default-node">
                                                        <div className="node-content">
                                                            <h3>{pages.find(p => p.id === pageConditionalLogic.failRedirect)?.name || "End of Form"}</h3>
                                                            <p>Go to this page (Fail)</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="no-logic-message">
                                            <p>No conditional logic set for this page.</p>
                                            <p>This page will proceed to the next page in sequence.</p>
                                            <div className="flowchart-line default-line">
                                                <div className="line-path"></div>
                                            </div>
                                            <div className="flowchart-node target-node default-node">
                                                <div className="node-content">
                                                    <h3>{pages[pages.findIndex(p => p.id === selectedPageId) + 1]?.name || "End of Form"}</h3>
                                                    <p>Next sequential page</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="no-logic-message">
                                    <p>Please select a page to view its logic flow.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
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