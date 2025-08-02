
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle OTP input - only allow numbers and limit to 6 digits
    if (name === 'otp') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 6) {
        setFormData({
          ...formData,
          [name]: numericValue
        });
      }
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await forgotPassword(formData.email);
    
    if (result.success) {
      toast.success('OTP sent to your email!');
      setStep(2); // Show OTP modal
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  const handleOTPVerify = async (e) => {
    e.preventDefault();
    
    if (!formData.otp || formData.otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }

    toast.success('OTP verified successfully!');
    setStep(3); // Show password modal
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
  
    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
  
    setLoading(true);
  
    const result = await resetPassword(formData.email, formData.otp, formData.newPassword);
    
    if (result.success) {
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  const handleCloseModal = () => {
    setStep(1);
    setFormData({
      email: formData.email,
      otp: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleResendOTP = async () => {
    setLoading(true);
    const result = await forgotPassword(formData.email);
    
    if (result.success) {
      toast.success('New OTP sent to your email!');
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  return (
    <>
      {/* Main Email Form */}
      <div className="forgot-password-container">
        {/* Header with CANOVA logo */}
        <div className="header-section">
          <div className="logo-container">
            <div className="logo-icon">
              <div className="logo-squares">
                <div className="logo-inner">
                  <div className="square"></div>
                  <div className="square"></div>
                  <div className="square"></div>
                  <div className="square"></div>
                </div>
                <div className="logo-center"></div>
                <div className="logo-inner-squares">
                  <div className="inner-square"></div>
                  <div className="inner-square"></div>
                  <div className="inner-square"></div>
                  <div className="inner-square"></div>
                </div>
              </div>
            </div>
            <span className="logo-text">CANOVA</span>
          </div>
        </div>

        {/* Main content */}
        <div className="main-content">
          <div className="forgot-password-card">
            <div className="card-header">
              <h1 className="card-title">Welcome CANOVA 👋</h1>
              <p className="card-subtitle">
                Please enter your registered email ID to receive an OTP
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="card-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">E-mail</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your registered email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="submit-button" 
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Mail'}
              </button>
            </form>

            <div className="card-footer">
              <p>
                Remember your password? 
                <Link to="/login" className="back-link"> Back to Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {step === 2 && (
        <div className="otp-modal-overlay">
          {/* Logo */}
          <div className="otp-modal-logo">
            <div className="otp-logo-container">
              <div className="otp-logo-icon">
                <svg viewBox="0 0 32 32" className="otp-logo-svg" fill="none">
                  <path d="M8 8L24 8L24 24L8 24L8 8Z" stroke="#0c1421" strokeWidth="2" fill="none" />
                  <path d="M12 12L20 12L20 20L12 20L12 12Z" stroke="#0c1421" strokeWidth="2" fill="none" />
                  <path d="M8 16L24 16" stroke="#0c1421" strokeWidth="2" />
                  <path d="M16 8L16 24" stroke="#0c1421" strokeWidth="2" />
                </svg>
              </div>
              <span className="otp-logo-text">CANOVA</span>
            </div>
          </div>

          {/* OTP Card */}
          <div className="otp-card-container">
            <div className="otp-card">
              <div className="otp-card-content">
                <h1 className="otp-title">Enter Your OTP</h1>

                <div className="otp-description">
                  <p className="otp-text">We've sent a 6-digit OTP to your registered mail.</p>
                  <p className="otp-text">Please enter it below to sign in.</p>
                </div>

                <form onSubmit={handleOTPVerify} className="otp-form">
                  <div className="otp-input-group">
                    <label htmlFor="otp" className="otp-label">OTP</label>
                    <input
                      id="otp"
                      type="text"
                      name="otp"
                      placeholder="xxxx05"
                      value={formData.otp}
                      onChange={handleChange}
                      className="otp-input-field"
                      maxLength={6}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formData.otp.length !== 6}
                    className="otp-confirm-button"
                  >
                    Confirm
                  </button>
                </form>

                <div className="otp-resend-section">
                  <p className="otp-resend-text">
                    Didn't receive the code?{' '}
                    <button 
                      type="button" 
                      className="otp-resend-link"
                      onClick={handleResendOTP}
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Resend OTP'}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Password Modal - Exact Design Match */}
      {step === 3 && (
        <div className="password-modal-overlay">
          {/* Logo */}
          <div className="password-modal-logo">
            <div className="password-logo-container">
              <div className="password-logo-icon">
                <div className="password-logo-square">
                  <div className="password-logo-inner">
                    <div className="password-logo-border"></div>
                  </div>
                </div>
              </div>
              <span className="password-logo-text">CANOVA</span>
            </div>
          </div>

          {/* Password Card */}
          <div className="password-card-container">
            <div className="password-card">
              <div className="password-card-header">
                <h1 className="password-title">Create New Password</h1>
                <div className="password-description">
                  <p>Today is a new day. It's your day. You shape it.</p>
                  <p>Sign in to start managing your projects.</p>
                </div>
              </div>

              <form onSubmit={handlePasswordReset} className="password-form">
                <div className="password-form-group">
                  <label htmlFor="newPassword" className="password-label">
                    Enter New Password
                  </label>
                  <div className="password-input-container">
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      placeholder="at least 8 characters"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="password-input-field"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle-button"
                    >
                      {showPassword ? (
                        <svg className="password-eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                          <line x1="2" y1="2" x2="22" y2="22"/>
                        </svg>
                      ) : (
                        <svg className="password-eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="password-form-group">
                  <label htmlFor="confirmPassword" className="password-label">
                    Confirm Password
                  </label>
                  <div className="password-input-container">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="at least 8 characters"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="password-input-field"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="password-toggle-button"
                    >
                      {showConfirmPassword ? (
                        <svg className="password-eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                          <line x1="2" y1="2" x2="22" y2="22"/>
                        </svg>
                      ) : (
                        <svg className="password-eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || formData.newPassword.length < 8 || formData.newPassword !== formData.confirmPassword}
                  className="password-submit-button"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ForgotPassword;
