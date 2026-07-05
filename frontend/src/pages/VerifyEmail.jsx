import { API_BASE_URL, BACKEND_URL } from '../config/api.js';
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Loader2, ShieldAlert } from 'lucide-react';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setError('Verification token is missing.');
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/auth/verify-email?token=${token}`);
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification link is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '40px', textAlign: 'center' }}>
        
        {loading ? (
          <>
            <Loader2 size={40} style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite', margin: '0 auto 20px auto' }} />
            <h3>Verifying Email Address</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '10px' }}>Please hold on, validating token with database...</p>
          </>
        ) : error ? (
          <>
            <ShieldAlert size={40} style={{ color: 'var(--error)', margin: '0 auto 20px auto' }} />
            <h3 style={{ color: 'var(--text-primary)' }}>Verification Failed</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '12px 0 24px 0', lineHeight: '1.5' }}>{error}</p>
            <Link to="/register" className="glow-btn" style={{ padding: '12px 24px', width: '100%', display: 'inline-block' }}>
              Back to Registration
            </Link>
          </>
        ) : (
          <>
            <ShieldCheck size={40} style={{ color: 'var(--success)', margin: '0 auto 20px auto' }} />
            <h3 style={{ color: 'var(--text-primary)' }}>Email Confirmed!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '12px 0 24px 0', lineHeight: '1.5' }}>{success}</p>
            <Link to="/login" className="glow-btn" style={{ padding: '12px 24px', width: '100%', display: 'inline-block' }}>
              Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
