// components/ForgotPasswordModalFlow.js
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ForgotPasswordModalFlow.css';

const ForgotPasswordModalFlow = ({ isOpen, onClose, userEmail }) => {
  const [step, setStep] = useState(1); // 1: OTP, 2: New Password
  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Step 1: Verify OTP
  const handleOTPVerify = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    toast.success('OTP verified successfully!');
    setStep(2);
    setLoading(false);
  };

  // Step 2: Reset Password
  const handlePasswordReset = async () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await resetPassword(userEmail, formData.otp, formData.newPassword);
    
    if (result.success) {
      toast.success('Password reset successfully!');
      onClose();
      navigate('/login');
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  const handleBackToOTP = () => {
    setStep(1);
    setFormData(prev => ({
      ...prev,
      newPassword: "",
      confirmPassword: ""
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      {/* Logo */}
      <div className="modal-logo">
        <div className="logo-container">
          <div className="logo-icon">
            <svg viewBox="0 0 32 32" className="logo-svg" fill="none">
              <path d="M8 8L24 8L24 24L8 24L8 8Z" stroke="#0c1421" strokeWidth="2" fill="none" />
              <path d="M12 12L20 12L20 20L12 20L12 12Z" stroke="#0c1421" strokeWidth="2" fill="none" />
              <path d="M8 16L24 16" stroke="#0c1421" strokeWidth="2" />
              <path d="M16 8L16 24" stroke="#0c1421" strokeWidth="2" />
            </svg>
          </div>
          <span className="logo-text">CANOVA</span>
        </div>
      </div>

      {/* Modal Content */}
      <div className="modal-content">
        {/* Step 1: OTP Verification */}
        {step === 1 && (
          <div className="modal-card">
            <div className="modal-header">
              <button onClick={onClose} className="close-button">×</button>
            </div>

            <div className="modal-body">
              <h1 className="modal-title">Enter Your OTP</h1>

              <div className="modal-description">
                <p className="description-text">We've sent a 6-digit OTP to</p>
                <p className="user-email">{userEmail}</p>
                <p className="description-text">Please enter it below to continue.</p>
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label htmlFor="otp" className="form-label">OTP</label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={formData.otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 6) {
                        handleInputChange('otp', value);
                      }
                    }}
                    className="otp-input"
                    maxLength={6}
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={handleOTPVerify}
                  disabled={loading || formData.otp.length !== 6}
                  className="primary-button"
                >
                  {loading ? 'Verifying...' : 'Confirm'}
                </button>
              </div>

              <div className="resend-section">
                <p className="resend-text">
                  Didn't receive the code?{' '}
                  <button className="resend-link">Resend OTP</button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: New Password */}
        {step === 2 && (
          <div className="modal-card">
            <div className="modal-header">
              <button onClick={onClose} className="close-button">×</button>
            </div>

            <div className="modal-body">
              <h1 className="modal-title">Create New Password</h1>

              <div className="modal-description">
                <p className="description-text">
                  Enter a strong password for your account
                </p>
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className="password-input"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="password-input"
                    disabled={loading}
                  />
                </div>

                {/* Password Requirements */}
                <div className="password-requirements">
                  <p className="requirements-title">Password must be:</p>
                  <ul className="requirements-list">
                    <li className={formData.newPassword.length >= 6 ? 'valid' : ''}>
                      At least 6 characters long
                    </li>
                    <li className={formData.newPassword === formData.confirmPassword && formData.newPassword ? 'valid' : ''}>
                      Both passwords match
                    </li>
                  </ul>
                </div>

                <div className="button-group">
                  <button
                    onClick={handleBackToOTP}
                    className="secondary-button"
                    disabled={loading}
                  >
                    Back to OTP
                  </button>
                  <button
                    onClick={handlePasswordReset}
                    disabled={loading || formData.newPassword.length < 6 || formData.newPassword !== formData.confirmPassword}
                    className="primary-button"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModalFlow;
