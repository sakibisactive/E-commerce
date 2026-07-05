import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, ShieldAlert } from 'lucide-react';
import styles from './Login.module.css';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '/';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(identifier, password);
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
          <h2>Sign In</h2>
          <p className={styles.subtext}>
            Enter your Phone Number or Email and Password to access your account
          </p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <ShieldAlert size={16} /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Phone Number or Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                type="text"
                required
                placeholder="01712345678 or name@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className={styles.footerLink}>
            Don't have an account? <Link to="/register">Register here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
