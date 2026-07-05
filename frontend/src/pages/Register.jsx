import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, ShieldAlert, BadgeCheck, ShieldCheck } from 'lucide-react';
import styles from './Register.module.css';

export const Register = () => {
  const navigate = useNavigate();
  const { register, verifyOTP } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP State
  const [otpStep, setOtpStep] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [signupToken, setSignupToken] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await register(name, email, phone, password, confirmPassword);
      if (res.otpRequired) {
        setOtpStep(true);
        setRegisteredEmail(res.email);
        setSignupToken(res.signupToken);
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
      await verifyOTP(registeredEmail, otpCode, signupToken);
      navigate('/');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className={`${styles.authCard} glass-panel`}>
        <div className={styles.header}>
          {!otpStep ? (
            <BadgeCheck size={40} className={styles.iconLogo} />
          ) : (
            <ShieldCheck size={40} className={styles.iconLogo} />
          )}
          <h2>{!otpStep ? 'Create Account' : 'Verify Email OTP'}</h2>
          <p className={styles.subtext}>
            {!otpStep
              ? 'Join us to browse, wishlist, and buy items'
              : `We sent a 6-digit OTP code to your email (${registeredEmail}).`}
          </p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <ShieldAlert size={16} /> <span>{error}</span>
          </div>
        )}

        {infoMessage && <div className={styles.infoAlert}>{infoMessage}</div>}

        {!otpStep ? (
          /* Step 1: Registration Form */
          <form onSubmit={handleRegisterSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <div className={styles.inputWrapper}>
                <User size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Phone Number</label>
              <div className={styles.inputWrapper}>
                <Phone size={16} className={styles.inputIcon} />
                <input
                  type="tel"
                  required
                  placeholder="01712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
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

            <div className={styles.formGroup}>
              <label>Confirm Password</label>
              <div className={styles.inputWrapper}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="glow-btn" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
              {loading ? 'Sending OTP...' : 'Register & Get OTP'}
            </button>

            <div className={styles.footerLink}>
              Already have an account? <Link to="/login">Sign In here</Link>
            </div>
          </form>
        ) : (
          /* Step 2: OTP Verification Form */
          <form onSubmit={handleOTPSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Enter 6-Digit OTP Code</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="form-input"
                style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '8px', fontWeight: 'bold' }}
              />
            </div>

            <button type="submit" disabled={loading} className="glow-btn" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
              {loading ? 'Verifying...' : 'Verify OTP & Log In'}
            </button>

            <button
              type="button"
              onClick={() => setOtpStep(false)}
              style={{ display: 'block', margin: '12px auto 0 auto', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}
            >
              ← Change Registration Info
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
