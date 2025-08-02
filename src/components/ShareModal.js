import React from 'react';
import './ShareModal.css';
import { toast } from 'react-toastify';

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="x-icon"> <path d="M18 6L6 18" /><path d="M6 6L18 18" /> </svg>
);
const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="copy-icon"> <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /> <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /> </svg>
);
const Share2Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="share-icon"> <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /> </svg>
);

const ShareModal = ({ isOpen, onClose, formId }) => {
    if (!isOpen || !formId) return null;

    // FIX: Construct the share link to point to FormViewer.js
    const shareLink = `${window.location.origin}/form/${formId}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink);
        toast.success("Form link copied to clipboard!");
    };

    const handleShareClick = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Check out this form!',
                text: 'Fill out this form:',
                url: shareLink,
            })
            .then(() => console.log('Successful share'))
            .catch((error) => console.log('Error sharing', error));
        } else {
            toast.info("Web Share API is not supported in your browser. Link is copied.");
            handleCopyLink();
        }
    };

    return (
        <div className="share-modal-overlay">
            <div className="share-modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">Share</h2>
                    <button className="close-button" onClick={onClose}>
                        <XIcon />
                    </button>
                </div>

                <div className="modal-body">
                    <p className="share-instruction">Share this link with your participants:</p>
                    <div className="share-link-container">
                        <input type="text" value={shareLink} readOnly className="share-link-input" />
                        <button className="copy-link-button-share" onClick={handleCopyLink}>
                            <CopyIcon /> Copy
                        </button>
                    </div>

                    <button className="share-action-button" onClick={handleShareClick}>
                        <Share2Icon /> Share
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;