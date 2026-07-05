import { API_BASE_URL, BACKEND_URL } from '../config/api.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, ClipboardList, Plus, Trash2, Edit, Download, Loader2 } from 'lucide-react';
import styles from './Profile.module.css';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [password, setPassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrLine, setAddrLine] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrPostal, setAddrPostal] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrDefault, setAddrDefault] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setProfilePhoto(user.profilePhoto || '');
      fetchAddresses();
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await axios.get(`${API_BASE_URL}/orders/my`);
      setOrders(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users/addresses`);
      setAddresses(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    try {
      await updateProfile({ name, email, phone, profilePhoto, password });
      setProfileSuccess('Profile updated successfully!');
      setPassword('');
    } catch (err) {
      setProfileError(err);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      label: addrLabel,
      addressLine: addrLine,
      city: addrCity,
      postalCode: addrPostal,
      phone: addrPhone,
      isDefault: addrDefault,
    };

    try {
      if (editingAddressId) {
        await axios.put(`${API_BASE_URL}/users/addresses/${editingAddressId}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/users/addresses`, payload);
      }
      resetAddressForm();
      fetchAddresses();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving address');
    }
  };

  const resetAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddrLabel('Home');
    setAddrLine('');
    setAddrCity('');
    setAddrPostal('');
    setAddrPhone('');
    setAddrDefault(false);
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddrLabel(addr.label);
    setAddrLine(addr.addressLine);
    setAddrCity(addr.city);
    setAddrPostal(addr.postalCode);
    setAddrPhone(addr.phone);
    setAddrDefault(addr.isDefault);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/users/addresses/${id}`);
      fetchAddresses();
    } catch (err) {
      alert('Error deleting address');
    }
  };

  const handleDownloadInvoice = (id) => {
    const token = localStorage.getItem('token');
    window.open(`${API_BASE_URL}/orders/${id}/invoice?token=${token}`, '_blank');
  };

  return (
    <div className={`container ${styles.profilePage}`}>
      
      {/* Sidebar Links */}
      <aside className={`${styles.sidebar} glass-panel`}>
        <div className={styles.profileSummary}>
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt="Profile" className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>{user?.name?.charAt(0).toUpperCase()}</div>
          )}
          <h3>{user?.name}</h3>
          <p>{user?.email}</p>
        </div>

        <nav className={styles.nav}>
          <button
            onClick={() => setActiveTab('profile')}
            className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.activeTab : ''}`}
          >
            <User size={16} /> <span>My Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`${styles.tabBtn} ${activeTab === 'addresses' ? styles.activeTab : ''}`}
          >
            <MapPin size={16} /> <span>Addresses</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.activeTab : ''}`}
          >
            <ClipboardList size={16} /> <span>Order History</span>
          </button>
        </nav>
      </aside>

      {/* Profile Details Panel */}
      <main className={styles.mainContent}>
        
        {/* Profile Details tab */}
        {activeTab === 'profile' && (
          <div className={`${styles.contentCard} glass-panel`}>
            <h2>Account Details</h2>
            <form onSubmit={handleProfileUpdate} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="form-input"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Profile Image URL</label>
                  <input
                    type="text"
                    value={profilePhoto}
                    onChange={(e) => setProfilePhoto(e.target.value)}
                    className="form-input"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Change Password (leave empty to keep current)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {profileSuccess && <div className={styles.successAlert}>{profileSuccess}</div>}
              {profileError && <div className={styles.errorAlert}>{profileError}</div>}

              <button type="submit" className="glow-btn" style={{ padding: '12px 24px', marginTop: '10px' }}>
                Save Profile updates
              </button>
            </form>
          </div>
        )}

        {/* Addresses tab */}
        {activeTab === 'addresses' && (
          <div className={`${styles.contentCard} glass-panel`}>
            <div className={styles.headerRow}>
              <h2>Address Management</h2>
              {!showAddressForm && (
                <button onClick={() => setShowAddressForm(true)} className="glow-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  <Plus size={14} /> Add New Address
                </button>
              )}
            </div>

            {/* Address CRUD Form */}
            {showAddressForm && (
              <form onSubmit={handleAddressSubmit} className={`${styles.addressForm} glass-panel`}>
                <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>
                  {editingAddressId ? 'Edit Address' : 'New Address'}
                </h3>
                
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Label (e.g. Home, Work) *</label>
                    <input
                      type="text"
                      required
                      value={addrLabel}
                      onChange={(e) => setAddrLabel(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Contact Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      className="form-input"
                    />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>Address Line *</label>
                    <input
                      type="text"
                      required
                      value={addrLine}
                      onChange={(e) => setAddrLine(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>City *</label>
                    <input
                      type="text"
                      required
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Postal Code *</label>
                    <input
                      type="text"
                      required
                      value={addrPostal}
                      onChange={(e) => setAddrPostal(e.target.value.replace(/[^0-9]/g, ''))}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ margin: '15px 0' }}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={addrDefault}
                      onChange={(e) => setAddrDefault(e.target.checked)}
                    />
                    <span>Set as default address</span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="glow-btn" style={{ padding: '10px 20px' }}>
                    Save Address
                  </button>
                  <button type="button" onClick={resetAddressForm} className="secondary-btn" style={{ padding: '10px 20px' }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* List addresses */}
            <div className={styles.addressList}>
              {addresses.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', padding: '20px 0', fontSize: '14px' }}>
                  No addresses saved yet.
                </div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr._id} className={`${styles.addressCard} glass-panel`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className={styles.addrHeader}>
                        <strong>{addr.label}</strong>
                        {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                      </div>
                      
                      <div className={styles.addrCardActions}>
                        <button onClick={() => handleEditAddress(addr)} className={styles.cardActionBtn} title="Edit">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteAddress(addr._id)} className={`${styles.cardActionBtn} ${styles.deleteCardBtn}`} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      {addr.addressLine}, {addr.city}, {addr.postalCode}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Phone: {addr.phone}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Orders tab */}
        {activeTab === 'orders' && (
          <div className={`${styles.contentCard} glass-panel`}>
            <h2>My Previous Orders</h2>

            {loadingOrders ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Loader2 className={styles.spinner} />
              </div>
            ) : orders.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', padding: '20px 0', fontSize: '14px' }}>
                You have not placed any orders yet.
              </div>
            ) : (
              <div className={styles.ordersList}>
                {orders.map((ord) => (
                  <div key={ord._id} className={`${styles.orderCard} glass-panel`}>
                    <div className={styles.orderHeaderRow}>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Order ID:</span>
                        <h4 style={{ fontSize: '14px' }}>#{ord._id}</h4>
                      </div>

                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span className={`${styles.statusBadge} ${ord.paymentStatus === 'Paid' ? styles.statusPaid : styles.statusUnpaid}`}>
                          {ord.paymentStatus}
                        </span>

                        <span className={`${styles.statusBadge} ${ord.orderStatus === 'Delivered' ? styles.statusPaid : styles.statusUnpaid}`}>
                          {ord.orderStatus}
                        </span>

                        <button onClick={() => handleDownloadInvoice(ord._id)} className="secondary-btn" style={{ padding: '6px 12px', fontSize: '12px' }}>
                          <Download size={12} /> Invoice
                        </button>
                      </div>
                    </div>

                    {/* Order summary listing */}
                    <div className={styles.orderItems}>
                      {ord.items.map((item, idx) => (
                        <div key={idx} className={styles.orderItemRow}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{item.name}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>Qty: {item.quantity}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Total Row */}
                    <div className={styles.orderTotalRow}>
                      <span style={{ color: 'var(--text-muted)' }}>Plural Date: {new Date(ord.createdAt).toLocaleDateString()}</span>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', marginRight: '8px' }}>Total Amount:</span>
                        <strong style={{ fontSize: '16px', color: 'var(--accent-primary)' }}>
                          ${ord.grandTotal.toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
