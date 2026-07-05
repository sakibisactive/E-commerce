import { API_BASE_URL, BACKEND_URL } from '../config/api.js';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { SidebarAdmin } from '../components/SidebarAdmin';
import { DollarSign, ShoppingBag, Users, AlertTriangle, TrendingUp, RefreshCw, BarChart, Tag, FolderTree, Image, Receipt, History } from 'lucide-react';
import styles from './AdminDashboard.module.css';

export const AdminDashboard = () => {
  const location = useLocation();
  const path = location.pathname;

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sub-view data states
  const [subData, setSubData] = useState([]);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchSubData();
  }, [path]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/dashboard/analytics`);
      setAnalytics(res.data);
    } catch (e) {
      console.error('Error fetching analytics:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubData = async () => {
    if (path === '/admin' || path === '/admin/') return;
    try {
      setSubLoading(true);
      if (path.includes('/products')) {
        const res = await axios.get(`${API_BASE_URL}/products?limit=100`);
        setSubData(res.data.products || []);
      } else if (path.includes('/categories')) {
        const res = await axios.get(`${API_BASE_URL}/categories`);
        setSubData(res.data || []);
      } else if (path.includes('/brands')) {
        const res = await axios.get(`${API_BASE_URL}/brands`);
        setSubData(res.data || []);
      } else if (path.includes('/banners')) {
        const res = await axios.get(`${API_BASE_URL}/banners`);
        setSubData(res.data || []);
      } else if (path.includes('/coupons')) {
        const res = await axios.get(`${API_BASE_URL}/coupons`);
        setSubData(res.data || []);
      } else if (path.includes('/users')) {
        const res = await axios.get(`${API_BASE_URL}/users`);
        setSubData(res.data || []);
      }
    } catch (e) {
      console.error('Error fetching sub data:', e.message);
    } finally {
      setSubLoading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className={styles.loadingSpinner}>
        <RefreshCw className={styles.spinner} />
        <p>Loading admin panel...</p>
      </div>
    );
  }

  // Render Sub Views for specific Admin links
  const renderSubView = () => {
    if (subLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <RefreshCw className={styles.spinner} />
          <p>Loading items...</p>
        </div>
      );
    }

    if (path.includes('/products')) {
      return (
        <div>
          <div className={styles.headerRow}>
            <h2>Product Catalog Manager ({subData.length} Items)</h2>
            <button onClick={fetchSubData} className="secondary-btn" style={{ padding: '6px 14px', fontSize: '12px' }}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: 'var(--text-primary)', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px' }}>Name</th>
                  <th style={{ padding: '10px' }}>SKU</th>
                  <th style={{ padding: '10px' }}>Category</th>
                  <th style={{ padding: '10px' }}>Price</th>
                  <th style={{ padding: '10px' }}>Stock</th>
                  <th style={{ padding: '10px' }}>Badge</th>
                </tr>
              </thead>
              <tbody>
                {subData.slice(0, 50).map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.name}</td>
                    <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{p.sku}</td>
                    <td style={{ padding: '10px' }}>{p.category?.name || 'Uncategorized'}</td>
                    <td style={{ padding: '10px', color: 'var(--accent-primary)', fontWeight: 'bold' }}>${p.price}</td>
                    <td style={{ padding: '10px' }}>{p.stockQuantity}</td>
                    <td style={{ padding: '10px' }}>{p.promoLabel ? <span style={{ background: '#6366f1', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '10px' }}>{p.promoLabel}</span> : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (path.includes('/categories')) {
      return (
        <div>
          <div className={styles.headerRow}>
            <h2>Category Manager</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {subData.map((c) => (
              <div key={c._id} className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
                <img src={c.image} alt={c.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
                <h4 style={{ margin: '0 0 6px 0' }}>{c.name}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (path.includes('/brands')) {
      return (
        <div>
          <div className={styles.headerRow}>
            <h2>Brand Manager</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {subData.map((b) => (
              <div key={b._id} className="glass-panel" style={{ padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <img src={b.logo} alt={b.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%', margin: '0 auto 10px auto' }} />
                <h4 style={{ margin: '0 0 6px 0' }}>{b.name}</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (path.includes('/banners')) {
      return (
        <div>
          <div className={styles.headerRow}>
            <h2>Homepage Hero Banners</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {subData.map((b) => (
              <div key={b._id} className="glass-panel" style={{ padding: '16px', borderRadius: '12px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img src={b.image} alt={b.title} style={{ width: '140px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}>{b.title}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{b.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (path.includes('/coupons')) {
      return (
        <div>
          <div className={styles.headerRow}>
            <h2>Discount Coupons</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {subData.map((c) => (
              <div key={c._id} className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 6px 0', color: 'var(--accent-primary)', letterSpacing: '2px' }}>{c.code}</h3>
                <p style={{ fontSize: '13px', margin: '0 0 6px 0' }}>Discount: <strong>{c.discountType === 'Percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}</strong></p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Active: {c.isActive ? 'Yes' : 'No'}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (path.includes('/users')) {
      return (
        <div>
          <div className={styles.headerRow}>
            <h2>Registered Users List</h2>
          </div>
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: 'var(--text-primary)', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px' }}>Name</th>
                  <th style={{ padding: '10px' }}>Email</th>
                  <th style={{ padding: '10px' }}>Phone</th>
                  <th style={{ padding: '10px' }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {subData.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{u.name}</td>
                    <td style={{ padding: '10px' }}>{u.email}</td>
                    <td style={{ padding: '10px' }}>{u.phone}</td>
                    <td style={{ padding: '10px' }}><span style={{ background: u.role === 'admin' ? '#ef4444' : '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>{u.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Default Fallback
    return (
      <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', borderRadius: '12px' }}>
        <h3>Management Panel Active</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Section ready for configuration.</p>
      </div>
    );
  };

  const { revenue, orders, products, users, revenueCurve } = analytics || {
    revenue: { totalRevenue: 0, monthlyRevenue: 0, dailyRevenue: 0 },
    orders: { totalOrders: 0, pendingOrders: 0, completedOrders: 0 },
    products: { lowStockProducts: [], mostSoldProducts: [] },
    users: { totalUsers: 0, newUsers: 0 },
    revenueCurve: [],
  };

  const maxRevenue = revenueCurve.length > 0 ? Math.max(...revenueCurve.map((x) => x.revenue), 100) : 100;
  const chartPoints = revenueCurve
    .map((point, index) => {
      const x = 50 + index * 90;
      const y = 180 - (point.revenue / maxRevenue) * 120;
      return `${x},${y}`;
    })
    .join(' ');

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className={`container ${styles.dashboardPage}`}>
      {/* Sidebar Navigation */}
      <SidebarAdmin />

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {path !== '/admin' && path !== '/admin/' ? (
          renderSubView()
        ) : (
          <>
            <div className={styles.headerRow}>
              <h2>Analytics Dashboard</h2>
              <button onClick={fetchAnalytics} className="secondary-btn" style={{ padding: '8px 16px', fontSize: '12px' }}>
                <RefreshCw size={12} /> Refresh Data
              </button>
            </div>

            {/* 4 Cards Grid */}
            <div className={styles.metricsGrid}>
              <div className={`${styles.metricCard} glass-panel`}>
                <div className={styles.cardHeader}>
                  <span>Revenue Metrics</span>
                  <DollarSign className={styles.iconRevenue} />
                </div>
                <div className={styles.metricVal}>${revenue.totalRevenue.toFixed(2)}</div>
                <div className={styles.metaRow}>
                  <span>Monthly: <strong>${revenue.monthlyRevenue.toFixed(2)}</strong></span>
                  <span>Today: <strong>${revenue.dailyRevenue.toFixed(2)}</strong></span>
                </div>
              </div>

              <div className={`${styles.metricCard} glass-panel`}>
                <div className={styles.cardHeader}>
                  <span>Orders Summary</span>
                  <ShoppingBag className={styles.iconOrders} />
                </div>
                <div className={styles.metricVal}>{orders.totalOrders}</div>
                <div className={styles.metaRow}>
                  <span>Pending: <strong style={{ color: 'var(--warning)' }}>{orders.pendingOrders}</strong></span>
                  <span>Completed: <strong style={{ color: 'var(--success)' }}>{orders.completedOrders}</strong></span>
                </div>
              </div>

              <div className={`${styles.metricCard} glass-panel`}>
                <div className={styles.cardHeader}>
                  <span>User Metrics</span>
                  <Users className={styles.iconUsers} />
                </div>
                <div className={styles.metricVal}>{users.totalUsers}</div>
                <div className={styles.metaRow}>
                  <span>New (30d): <strong>{users.newUsers}</strong></span>
                </div>
              </div>

              <div className={`${styles.metricCard} glass-panel`}>
                <div className={styles.cardHeader}>
                  <span>Low Stock Alerts</span>
                  <AlertTriangle className={styles.iconAlert} />
                </div>
                <div className={styles.metricVal}>{products.lowStockProducts.length}</div>
                <div className={styles.metaRow}>
                  <span>Stock &lt;= 5 units</span>
                </div>
              </div>
            </div>

            {/* Monthly Revenue Chart */}
            <div className={`${styles.chartCard} glass-panel`}>
              <div className={styles.chartHeader}>
                <h4><BarChart size={16} /> Monthly Revenue Trend</h4>
              </div>

              {revenueCurve.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
                  No historical payment logs to construct chart.
                </div>
              ) : (
                <div className={styles.chartContainer}>
                  <svg viewBox="0 0 550 220" className={styles.svgChart}>
                    <defs>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <line x1="50" y1="60" x2="500" y2="60" stroke="var(--border-color)" strokeWidth="1" />
                    <line x1="50" y1="120" x2="500" y2="120" stroke="var(--border-color)" strokeWidth="1" />
                    <line x1="50" y1="180" x2="500" y2="180" stroke="var(--text-muted)" strokeWidth="1" />

                    {revenueCurve.length > 1 && (
                      <path d={`M 50,180 L ${chartPoints} L ${50 + (revenueCurve.length - 1) * 90},180 Z`} fill="url(#chartFill)" />
                    )}

                    {revenueCurve.length > 0 && (
                      <polyline fill="none" stroke="#6366f1" strokeWidth="3.5" points={chartPoints} filter="url(#glow)" />
                    )}

                    {revenueCurve.map((point, idx) => {
                      const cx = 50 + idx * 90;
                      const cy = 180 - (point.revenue / maxRevenue) * 120;
                      return (
                        <g key={idx}>
                          <circle cx={cx} cy={cy} r="5.5" fill="#14b8a6" stroke="#0b0f19" strokeWidth="2" />
                          <text x={cx} y={cy - 12} fontSize="9" fill="var(--text-primary)" textAnchor="middle" fontWeight="bold">
                            ${Math.round(point.revenue)}
                          </text>
                          <text x={cx} y="200" fontSize="10" fill="var(--text-secondary)" textAnchor="middle">
                            {monthNames[point._id.month - 1]}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};
