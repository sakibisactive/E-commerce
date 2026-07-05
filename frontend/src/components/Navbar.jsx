import { API_BASE_URL, BACKEND_URL } from '../config/api.js';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, LogOut, Menu, X, Bell, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import axios from 'axios';
import styles from './Navbar.module.css';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { getCalculatedTotals } = useCart();
  const { wishlist } = useWishlist();

  const [keyword, setKeyword] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // In-app notifications states
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const { activeItemsCount } = getCalculatedTotals();
  const wishlistCount = wishlist?.products?.length || 0;

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // poll every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  // Sync keyword with URL search param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get('keyword') || '');
  }, [location.search]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/notifications`);
      setNotifications(res.data);
    } catch (e) {
      console.error('Notification Fetch error');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate('/shop');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  return (
    <header className={styles.header}>
      <div className={`container ${styles.navContainer}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoText}>APEX</span>
          <span className={styles.logoSub}>Store</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Search products, categories, brands..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            <Search size={18} />
          </button>
        </form>

        {/* Nav Icons */}
        <nav className={`${styles.navActions} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
          <Link to="/shop" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
            Browse
          </Link>

          {/* Wishlist Link */}
          <Link to="/wishlist" className={styles.iconWrapper} onClick={() => setMobileMenuOpen(false)}>
            <Heart size={20} className={styles.icon} />
            {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
          </Link>

          {/* Cart Link */}
          <Link to="/cart" className={styles.iconWrapper} onClick={() => setMobileMenuOpen(false)}>
            <ShoppingBag size={20} className={styles.icon} />
            {activeItemsCount > 0 && <span className={styles.badge}>{activeItemsCount}</span>}
          </Link>

          {/* Notifications Panel */}
          {user && (
            <div className={styles.popoverContainer} ref={notificationRef}>
              <button
                className={styles.iconButton}
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setDropdownOpen(false);
                }}
              >
                <Bell size={20} className={styles.icon} />
                {unreadNotifications > 0 && (
                  <span className={`${styles.badge} ${styles.badgeAlert}`}>{unreadNotifications}</span>
                )}
              </button>
              
              {notificationsOpen && (
                <div className={`${styles.popover} glass-panel`}>
                  <div className={styles.popoverHeader}>
                    <h4>Notifications</h4>
                    {unreadNotifications > 0 && (
                      <button onClick={handleMarkAllRead} className={styles.markReadBtn}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className={styles.popoverList}>
                    {notifications.length === 0 ? (
                      <div className={styles.emptyAlert}>No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleNotificationClick(n._id)}
                          className={`${styles.popoverItem} ${!n.isRead ? styles.unreadItem : ''}`}
                        >
                          <div className={styles.notiTitle}>{n.title}</div>
                          <div className={styles.notiMsg}>{n.message}</div>
                          <span className={styles.notiTime}>
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile Dropdown */}
          {user ? (
            <div className={styles.popoverContainer} ref={profileRef}>
              <button
                className={styles.profileBtn}
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                  setNotificationsOpen(false);
                }}
              >
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className={styles.avatarImg} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className={styles.userName}>{user.name.split(' ')[0]}</span>
              </button>

              {dropdownOpen && (
                <div className={`${styles.dropdownMenu} glass-panel`}>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className={styles.dropdownItem}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Shield size={16} /> Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={16} /> My Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                      navigate('/');
                    }}
                    className={`${styles.dropdownItem} ${styles.logoutBtn}`}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="glow-btn" style={{ padding: '8px 16px', fontSize: '14px' }}>
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
};
