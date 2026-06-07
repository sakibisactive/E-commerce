import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, ShieldAlert, BadgeCheck } from 'lucide-react';
import styles from './Register.module.css';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const msg = await register(name, email, phone, password, confirmPassword);
      setSuccess(msg);
      // Clear fields
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
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
          <BadgeCheck size={40} className={styles.iconLogo} />
          <h2>Create Account</h2>
          <p className={styles.subtext}>Join us to browse, wishlist, and buy items</p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <ShieldAlert size={16} /> <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className={styles.successContainer}>
            <div className={styles.successAlert}>{success}</div>
            <Link to="/login" className="glow-btn" style={{ padding: '12px 24px', width: '100%', display: 'inline-block', textAlign: 'center' }}>
              Proceed to Sign In
            </Link>
          </div>
        ) : (
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
              {loading ? 'Registering...' : 'Register'}
            </button>

            <div className={styles.footerLink}>
              Already have an account? <Link to="/login">Sign In here</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
