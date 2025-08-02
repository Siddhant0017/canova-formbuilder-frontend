import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import './PublishModal.css';

// Recreated icons in JSX for easy use
const PackageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="package-icon"> <path d="m7.5 4.275-5 2.875c-.2.125-.4.325-.5.55-.1.225-.1.475 0 .7.1.225.3.425.5.55l5 2.875c.2.125.4.325.5.55.1.225.1.475 0 .7-.1.225-.3.425-.5.55l-5 2.875c-.2.125-.4.325-.5.55-.1.225-.1.475 0 .7.1.225.3.425.5.55l5 2.875c.2.125.4.325.5.55.1.225.1.475 0 .7-.1.225-.3.425-.5.55l-5 2.875c-.2.125-.4.325-.5.55-.1.225-.1.475 0 .7.1.225.3.425.5.55l5 2.875" /><path d="M12 2v20" /><path d="m16.5 4.275l5 2.875c.2.125.4.325.5.55.1.225.1.475 0 .7-.1.225-.3.425-.5.55l-5 2.875c-.2.125-.4.325-.5.55-.1.225-.1.475 0 .7.1.225.3.425.5.55l5 2.875" /> </svg>
);
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="x-icon"> <path d="M18 6L6 18" /><path d="M6 6L18 18" /> </svg>
);
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="plus-icon"> <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /> </svg>
);
const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="copy-icon"> <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /> <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /> </svg>
);
const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chevron-down-icon"> <polyline points="6 9 12 15 18 9" /> </svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="trash-icon"> <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /> </svg>
);


const PublishModal = ({
    isOpen,
    onClose,
    onPublish,
    formId,
    currentProject,
    ownerUser,
    currentAccessControl,
    availableProjects,
    api
}) => {
    const [selectedProjectId, setSelectedProjectId] = useState(currentProject?._id || null);
    const [selectedVisibility, setSelectedVisibility] = useState('restricted');
    
    const [sharedUsers, setSharedUsers] = useState([]); 
    const [newShareEmail, setNewShareEmail] = useState('');
    const [showProjectSelector, setShowProjectSelector] = useState(false);
    const [shareLoading, setShareLoading] = useState(false);
    const [publishSaving, setPublishSaving] = useState(false);

    useEffect(() => {
        const ownerEntry = {
            email: ownerUser?.email,
            level: 'edit',
            userId: ownerUser?._id,
            isOwner: true,
            grantedBy: ownerUser?._id
        };
        
        const existingOthers = (currentAccessControl || [])
            .filter(ac => ac.email !== ownerUser?.email)
            .map(ac => ({
                email: ac.email,
                level: ac.level,
                userId: ac.userId,
                isOwner: false,
                grantedBy: ac.grantedBy
            }));
        
        if (ownerUser) {
            setSharedUsers([ownerEntry, ...existingOthers]);
        } else {
            setSharedUsers(existingOthers);
        }

        const initialVisibility = currentAccessControl && currentAccessControl.length > 0 ? 'restricted' : 'public';
        setSelectedVisibility(initialVisibility);
    }, [ownerUser, currentAccessControl]);


    if (!isOpen) return null;

    const handleCopyLink = () => {
        if (!formId) {
            toast.error("Form ID is not available to create a link.");
            return;
        }
        const shareLink = `${window.location.origin}/form/${formId}`;
        navigator.clipboard.writeText(shareLink);
        toast.success("Form link copied to clipboard!");
    };

    const handleAddSharedUser = async () => {
        if (!newShareEmail || !newShareEmail.includes('@')) {
            toast.error("Please enter a valid email address.");
            return;
        }

        if (sharedUsers.some(u => u.email === newShareEmail)) {
            toast.info("User with this email is already on the list.");
            return;
        }

        setShareLoading(true);
        try {
            const userLookupRes = await api.post('/auth/lookup-by-email', { emails: [newShareEmail] });
            const userLookup = userLookupRes.data.users[0];

            const newUser = {
                email: newShareEmail,
                level: 'view',
                userId: userLookup ? userLookup._id : null,
                isOwner: false,
                grantedBy: ownerUser._id
            };
            setSharedUsers(prev => [...prev, newUser]);
            setNewShareEmail('');
            toast.success(`'${newShareEmail}' added to share list.`);
        } catch (error) {
            console.error('Error adding shared user:', error);
            toast.error("Failed to add user. Please check if the email is valid.");
        } finally {
            setShareLoading(false);
        }
    };

    const handlePermissionChange = (targetEmail, newLevel) => {
        setSharedUsers(prev => prev.map(u => {
            if (u.email === targetEmail) {
                if (newLevel === 'remove') {
                    return null;
                }
                return { ...u, level: newLevel };
            }
            return u;
        }).filter(Boolean));
    };

    const handlePublishClick = async () => {
        setPublishSaving(true);
        
        const accessControlPayload = sharedUsers
            .filter(u => !u.isOwner && u.level !== 'remove')
            .map(u => ({
                email: u.email,
                userId: u.userId,
                level: u.level,
                grantedBy: u.grantedBy
            }));
            
        const finalProjectId = selectedProjectId;

        onPublish({
            visibility: selectedVisibility,
            projectId: finalProjectId,
            accessControl: accessControlPayload
        });

        setPublishSaving(false);
    };

    return (
        <div className="publish-modal-overlay">
            <div className="publish-modal-content">
                <div className="modal-header">
                    <div className="header-left-group">
                        <div className="header-icon-container">
                            <PackageIcon />
                        </div>
                        <h2 className="modal-title">Publish</h2>
                    </div>
                    <button className="close-button" onClick={onClose}>
                        <XIcon />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Save to Project Section */}
                    <div className="body-section">
                        <h3 className="body-title">Save to</h3>
                        {showProjectSelector ? (
                            <div className="project-selector-container">
                                <select
                                    className="project-select-dropdown"
                                    value={selectedProjectId || ''}
                                    onChange={(e) => setSelectedProjectId(e.target.value || null)}
                                >
                                    <option value="">No Project</option>
                                    {availableProjects.map(project => (
                                        <option key={project._id} value={project._id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                                <button className="link-button" onClick={() => setShowProjectSelector(false)}>
                                    Done
                                </button>
                            </div>
                        ) : (
                            <div className="section-content">
                                <span>Project: {availableProjects.find(p => p._id === selectedProjectId)?.name || 'None'}</span>
                                <button className="link-button" onClick={() => setShowProjectSelector(true)}>
                                    Change
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Responders Section */}
                    <div className="body-section">
                        <h3 className="body-title">Responders</h3>
                        <div className="visibility-options">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="public"
                                    checked={selectedVisibility === 'public'}
                                    onChange={() => setSelectedVisibility('public')}
                                />
                                Anyone with the Link
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="restricted"
                                    checked={selectedVisibility === 'restricted'}
                                    onChange={() => setSelectedVisibility('restricted')}
                                />
                                Restricted
                            </label>
                        </div>

                        {selectedVisibility === 'restricted' && (
                            <div className="share-panel">
                                <div className="owner-row">
                                    <span>{ownerUser?.email}</span>
                                    <span className="owner-status">(Owner)</span>
                                    <button className="link-button copy-link-button" onClick={handleCopyLink}>
                                        <CopyIcon /> Copy Link
                                    </button>
                                </div>

                                <div className="shared-users-list">
                                    {sharedUsers.filter(u => !u.isOwner).map(user => (
                                        <div key={user.email} className="shared-user-row">
                                            <span>{user.email}</span>
                                            <div className="permission-dropdown-container">
                                                <select
                                                    value={user.level}
                                                    onChange={(e) => handlePermissionChange(user.email, e.target.value)}
                                                    className="permission-select"
                                                    disabled={publishSaving || user.isOwner}
                                                >
                                                    <option value="view">View</option>
                                                    <option value="edit" disabled={ownerUser?.level !== 'edit'}>Edit</option>
                                                    <option value="share" disabled={ownerUser?.level !== 'edit'}>Share</option>
                                                    <option value="remove">Remove</option>
                                                </select>
                                                <ChevronDownIcon />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="add-user-section">
                                    <input
                                        type="email"
                                        placeholder="Add email address"
                                        value={newShareEmail}
                                        onChange={(e) => setNewShareEmail(e.target.value)}
                                        className="add-email-input"
                                        disabled={shareLoading}
                                    />
                                    <button
                                        className="add-email-button"
                                        onClick={handleAddSharedUser}
                                        disabled={shareLoading || !newShareEmail.includes('@') || newShareEmail === ownerUser?.email}
                                    >
                                        {shareLoading ? 'Adding...' : <PlusIcon />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="publish-button" onClick={handlePublishClick} disabled={publishSaving}>
                        {publishSaving ? 'Publishing...' : 'Publish'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PublishModal;