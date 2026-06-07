import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BadgeCheck, AlertOctagon, Undo2, ArrowLeft, Download, Eye } from 'lucide-react';

export const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://${window.location.hostname}:5000/api/orders/${orderId}`);
      setOrder(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    const token = localStorage.getItem('token');
    window.open(`http://${window.location.hostname}:5000/api/orders/${orderId}/invoice?token=${token}`, '_blank');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="glass-panel" style={{ maxWidth: '520px', width: '100%', padding: '40px', textAlign: 'center' }}>
        <BadgeCheck size={48} style={{ color: 'var(--success)', margin: '0 auto 20px auto' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Payment Successful!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '10px' }}>
          Thank you for your purchase. Your payment was verified and processed successfully.
        </p>

        {order && (
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '16px', margin: '24px 0', textAlign: 'left', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Order ID:</span>
              <strong style={{ color: 'var(--text-primary)' }}>#{order._id}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Invoice Number:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{order.invoiceNumber}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Amount Paid:</span>
              <strong style={{ color: 'var(--accent-secondary)' }}>${order.grandTotal.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
              <strong style={{ color: 'var(--success)' }}>{order.orderStatus}</strong>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={handleDownloadInvoice} className="glow-btn" style={{ padding: '12px', width: '100%' }}>
            <Download size={16} /> Download Invoice PDF
          </button>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/profile" className="secondary-btn" style={{ padding: '12px', flexGrow: 1, fontSize: '14px' }}>
              <Eye size={14} /> Track Order
            </Link>
            <Link to="/" className="secondary-btn" style={{ padding: '12px', flexGrow: 1, fontSize: '14px' }}>
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CheckoutFail = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '40px', textAlign: 'center' }}>
        <AlertOctagon size={48} style={{ color: 'var(--error)', margin: '0 auto 20px auto' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Payment Failed</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '12px 0 32px 0', lineHeight: '1.5' }}>
          We were unable to authorize your payment transaction. Your inventory items have been rolled back to prevent duplication.
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/cart" className="glow-btn" style={{ padding: '12px 24px', flexGrow: 1 }}>
            <Undo2 size={16} /> Retry Checkout
          </Link>
          <Link to="/" className="secondary-btn" style={{ padding: '12px 24px', flexGrow: 1 }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export const CheckoutCancel = () => {
  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '40px', textAlign: 'center' }}>
        <AlertOctagon size={48} style={{ color: 'var(--warning)', margin: '0 auto 20px auto' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Payment Cancelled</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '12px 0 32px 0', lineHeight: '1.5' }}>
          Your payment transaction was cancelled. No charges were made.
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/cart" className="glow-btn" style={{ padding: '12px 24px', flexGrow: 1 }}>
            Return to Cart
          </Link>
          <Link to="/" className="secondary-btn" style={{ padding: '12px 24px', flexGrow: 1 }}>
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};
