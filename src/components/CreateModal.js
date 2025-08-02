import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateModal.css';

const CreateModal = ({ onClose, onCreateProject }) => {
    const [projectData, setProjectData] = useState({
        name: '',
        formName: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!projectData.name.trim() || !projectData.formName.trim()) {
            return;
        }

        setLoading(true);
        try {
            // onCreateProject returns an object like { id: projectId, formId: newFormId }
            const result = await onCreateProject({
                name: projectData.name,
                formName: projectData.formName,
                description: projectData.description
            });

            // FIX: Use the formId returned from onCreateProject for navigation
            // This ensures you navigate to the specific URL of the newly created form
            navigate(`/form-builder/${result.formId}`, {
                state: {
                    projectId: result.id, // This is the project ID
                    formTitle: projectData.formName
                }
            });

            onClose(); // Close the modal after successful navigation
        } catch (error) {
            console.error('Failed to create project:', error);
            // You might want to add a toast.error here as well
        } finally {
            setLoading(false);
        }
    };

    const isValid = projectData.name.trim() && projectData.formName.trim();

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="create-project-modal" onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button className="modal-close-btn" onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>

                <form onSubmit={handleSubmit} className="create-form">
                    {/* Icon */}
                    <div className="modal-icon">
                        <div className="icon-container">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                            </svg>
                        </div>
                    </div>

                    {/* Title and subtitle */}
                    <div className="modal-header">
                        <h1 className="modal-title">Create Project</h1>
                        <p className="modal-subtitle">
                            Provide your project a name and start with your journey
                        </p>
                    </div>

                    {/* Form fields */}
                    <div className="form-fields">
                        <div className="form-field">
                            <label className="field-label">Project Name</label>
                            <input
                                type="text"
                                className="field-input"
                                value={projectData.name}
                                onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter project name"
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label className="field-label">Form Name</label>
                            <input
                                type="text"
                                className="field-input"
                                value={projectData.formName}
                                onChange={(e) => setProjectData(prev => ({ ...prev, formName: e.target.value }))}
                                placeholder="Enter initial form name"
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label className="field-label">Description (Optional)</label>
                            <textarea
                                className="field-textarea"
                                value={projectData.description}
                                onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe your project..."
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="create-btn"
                            disabled={!isValid || loading}
                        >
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateModal;