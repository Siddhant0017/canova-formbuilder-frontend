import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateModal.css';

const CreateModal = ({ onClose, onCreateProject }) => {
    const [projectData, setProjectData] = useState({
        name: '',
        formName: ''
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
            const result = await onCreateProject({
                name: projectData.name,
                formName: projectData.formName,
                description: '' // Empty description
            });

            navigate(`/form-builder/${result.formId}`, {
                state: {
                    projectId: result.id,
                    formTitle: projectData.formName
                }
            });

            onClose();
        } catch (error) {
            console.error('Failed to create project:', error);
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
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                <path d="M9 12l2 2 4-4"/>
                            </svg>
                        </div>
                    </div>

                    {/* Title and subtitle */}
                    <div className="modal-header">
                        <h2 className="modal-title">Create Project</h2>
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
                                placeholder="Project Name"
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
                                placeholder="Form Name"
                                required
                            />
                        </div>
                    </div>

                    {/* Single Create Button */}
                    <button
                        type="submit"
                        className="create-btn-primary"
                        disabled={!isValid || loading}
                    >
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateModal;
