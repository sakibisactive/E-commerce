import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, ShieldAlert } from 'lucide-react';
import styles from './Login.module.css';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, verifyOTP, otpPending, otpEmail, setOtpPending } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '/';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.otpRequired) {
        setInfoMessage(res.message);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyOTP(otpEmail, otp);
      navigate(redirect);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={`${styles.authCard} glass-panel`}>
        <div className={styles.header}>
          <ShieldCheck size={40} className={styles.iconLogo} />
          <h2>{!otpPending ? 'Sign In' : 'Two-Step Verification'}</h2>
          <p className={styles.subtext}>
            {!otpPending
              ? 'Enter your credentials to access your account'
              : `Please check your email (${otpEmail}) for verification code.`}
          </p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <ShieldAlert size={16} /> <span>{error}</span>
          </div>
        )}

        {infoMessage && <div className={styles.infoAlert}>{infoMessage}</div>}

        {!otpPending ? (
          /* Password credentials login form */
          <form onSubmit={handleLoginSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Password</label>
              <div className={styles.inputWrapper}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="glow-btn" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
              {loading ? 'Validating...' : 'Sign In'}
            </button>

            <div className={styles.footerLink}>
              Don't have an account? <Link to="/register">Register here</Link>
            </div>
          </form>
        ) : (
          /* OTP Verification Form */
          <form onSubmit={handleOTPSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Enter 6-Digit OTP Code</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="form-input"
                style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '8px', fontWeight: 'bold' }}
              />
            </div>

            <button type="submit" disabled={loading} className="glow-btn" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <button
              type="button"
              onClick={() => setOtpPending(false)}
              className={styles.backBtn}
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
