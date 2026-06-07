import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SidebarAdmin } from '../components/SidebarAdmin';
import { DollarSign, ShoppingBag, Users, AlertTriangle, TrendingUp, RefreshCw, BarChart } from 'lucide-react';
import styles from './AdminDashboard.module.css'; // Let's name it AdminDashboard.module.css to keep it standard. Wait, target file will be AdminDashboard.jsx.module.css or AdminDashboard.module.css. Let's make it standard: AdminDashboard.module.css

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/dashboard/analytics');
      setData(res.data);
    } catch (e) {
      console.error('Error fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingSpinner}>
        <RefreshCw className={styles.spinner} />
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlignment: 'center' }}>
        <h3>Error loading dashboard data.</h3>
      </div>
    );
  }

  const { revenue, orders, products, users, revenueCurve } = data;

  // Custom SVG Chart parameters: Calculate coordinate vectors dynamically based on database items
  const maxRevenue = revenueCurve.length > 0 ? Math.max(...revenueCurve.map(x => x.revenue), 100) : 100;
  
  // Format coordinate points for SVG Polyline chart
  const chartPoints = revenueCurve
    .map((point, index) => {
      const x = 50 + index * 90;
      const y = 180 - (point.revenue / maxRevenue) * 120;
      return `${x},${y}`;
    })
    .join(' ');

  // Get months array mapping
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className={`container ${styles.dashboardPage}`}>
      
      {/* Sidebar Navigation */}
      <SidebarAdmin />

      {/* Main Analytics Panel */}
      <main className={styles.mainContent}>
        <div className={styles.headerRow}>
          <h2>Analytics Dashboard</h2>
          <button onClick={fetchAnalytics} className="secondary-btn" style={{ padding: '8px 16px', fontSize: '12px' }}>
            <RefreshCw size={12} /> Refresh Data
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div className={styles.metricsGrid}>
          {/* Revenue Card */}
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

          {/* Orders Card */}
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

          {/* Users Card */}
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

          {/* Low Stock Alert Card */}
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

        {/* Custom SVG Revenue Line Chart Card */}
        <div className={`${styles.chartCard} glass-panel`}>
          <div className={styles.chartHeader}>
            <h4><BarChart size={16} /> Monthly Revenue Trend (Last 6 Months)</h4>
          </div>
          
          {revenueCurve.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
              No historical payment logs to construct chart.
            </div>
          ) : (
            <div className={styles.chartContainer}>
              <svg viewBox="0 0 550 220" className={styles.svgChart}>
                <defs>
                  {/* Neon Glow Filter */}
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  {/* Fill Gradient */}
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="50" y1="60" x2="500" y2="60" stroke="var(--border-color)" strokeWidth="1" />
                <line x1="50" y1="120" x2="500" y2="120" stroke="var(--border-color)" strokeWidth="1" />
                <line x1="50" y1="180" x2="500" y2="180" stroke="var(--text-muted)" strokeWidth="1" />

                {/* Chart Fill Area */}
                {revenueCurve.length > 1 && (
                  <path
                    d={`M 50,180 L ${chartPoints} L ${50 + (revenueCurve.length - 1) * 90},180 Z`}
                    fill="url(#chartFill)"
                  />
                )}

                {/* Glow Line Polyline */}
                {revenueCurve.length > 0 && (
                  <polyline
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3.5"
                    points={chartPoints}
                    filter="url(#glow)"
                  />
                )}

                {/* Data point circles */}
                {revenueCurve.map((point, idx) => {
                  const cx = 50 + idx * 90;
                  const cy = 180 - (point.revenue / maxRevenue) * 120;
                  return (
                    <g key={idx}>
                      <circle cx={cx} cy={cy} r="5.5" fill="#14b8a6" stroke="#0b0f19" strokeWidth="2" />
                      {/* Price values */}
                      <text x={cx} y={cy - 12} fontSize="9" fill="var(--text-primary)" textAnchor="middle" fontWeight="bold">
                        ${Math.round(point.revenue)}
                      </text>
                      {/* Month names label */}
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

        {/* Bottom Listings Details grid */}
        <div className={styles.detailsGrid}>
          {/* Most Sold list */}
          <div className={`${styles.detailsCard} glass-panel`}>
            <h3>Most Sold Products</h3>
            <div className={styles.listContainer}>
              {products.mostSoldProducts.length === 0 ? (
                <div className={styles.emptyList}>No sales logs recorded.</div>
              ) : (
                products.mostSoldProducts.map((p, idx) => (
                  <div key={idx} className={styles.listItem}>
                    <div className={styles.itemInfo}>
                      <span className={styles.listNum}>#{idx + 1}</span>
                      <div>
                        <strong>{p.name}</strong>
                        <span className={styles.subDetail}>Sold: {p.soldQuantity} units</span>
                      </div>
                    </div>
                    <strong style={{ color: 'var(--accent-secondary)' }}>
                      ${p.totalSalesAmount.toFixed(2)}
                    </strong>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low stock Alerts & editing */}
          <div className={`${styles.detailsCard} glass-panel`}>
            <h3>Low Stock Alerts</h3>
            <div className={styles.listContainer}>
              {products.lowStockProducts.length === 0 ? (
                <div className={styles.emptyList} style={{ color: 'var(--success)' }}>
                  All items are securely stocked (&gt; 5 units).
                </div>
              ) : (
                products.lowStockProducts.map((p) => (
                  <div key={p._id} className={styles.listItem}>
                    <div>
                      <strong>{p.name}</strong>
                      <span className={styles.subDetail}>SKU: {p.sku}</span>
                    </div>
                    
                    <span className={styles.stockAlertBadge}>
                      {p.stockQuantity} Left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
