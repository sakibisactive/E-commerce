import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import styles from './Checkout.module.css';

export const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, coupon, getCalculatedTotals } = useCart();

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  
  // Form States
  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPostal, setShippingPostal] = useState('');

  const [billingSame, setBillingSame] = useState(true);
  
  const [billingName, setBillingName] = useState('');
  const [billingPhone, setBillingPhone] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingPostal, setBillingPostal] = useState('');

  const {
    subtotal,
    discount,
    couponDiscount,
    tax,
    shipping,
    grandTotal,
    activeItemsCount,
  } = getCalculatedTotals();

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=checkout');
      return;
    }
    fetchSavedAddresses();
  }, [user]);

  const fetchSavedAddresses = async () => {
    try {
      const res = await axios.get(`http://${window.location.hostname}:5000/api/users/addresses`);
      setAddresses(res.data);
      
      // Auto-fill form with default address if available
      const defaultAddr = res.data.find(a => a.isDefault);
      if (defaultAddr) {
        setShippingPhone(defaultAddr.phone);
        setShippingAddress(defaultAddr.addressLine);
        setShippingCity(defaultAddr.city);
        setShippingPostal(defaultAddr.postalCode);
        setShippingName(user.name);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavedAddressSelect = (addr) => {
    setShippingPhone(addr.phone);
    setShippingAddress(addr.addressLine);
    setShippingCity(addr.city);
    setShippingPostal(addr.postalCode);
    setShippingName(user.name);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!shippingName || !shippingPhone || !shippingAddress || !shippingCity || !shippingPostal) {
      alert('Please fill out all required shipping fields');
      return;
    }

    const shipAddrObj = {
      name: shippingName,
      phone: shippingPhone,
      addressLine: shippingAddress,
      city: shippingCity,
      postalCode: shippingPostal,
    };

    const billAddrObj = billingSame
      ? shipAddrObj
      : {
          name: billingName,
          phone: billingPhone,
          addressLine: billingAddress,
          city: billingCity,
          postalCode: billingPostal,
        };

    try {
      setLoading(true);
      const res = await axios.post(`http://${window.location.hostname}:5000/api/orders`, {
        couponCode: coupon?.code || '',
        shippingAddress: shipAddrObj,
        billingAddress: billAddrObj,
        paymentMethod: 'SSLCommerz',
      });

      // Redirect to SSLCommerz Sandbox
      if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        alert('Order placed, but payment URL initialization failed.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const activeItems = cart?.items?.filter(item => !item.isSavedForLater && item.product) || [];

  if (activeItems.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlignment: 'center' }}>
        <h3>Your checkout is empty. Please add items to cart first.</h3>
        <button onClick={() => navigate('/shop')} className="glow-btn" style={{ padding: '10px 20px', marginTop: '15px' }}>
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className={`container ${styles.checkoutPage}`}>
      <h1 className={styles.pageTitle}>Secure Checkout</h1>

      <div className={styles.checkoutGrid}>
        
        {/* Address Forms Column */}
        <div className={styles.formsColumn}>
          
          {/* Saved Addresses Quick Pick */}
          {addresses.length > 0 && (
            <div className={`${styles.savedAddressesBox} glass-panel`}>
              <h4>Select Saved Address</h4>
              <div className={styles.addressPills}>
                {addresses.map((addr) => (
                  <button
                    key={addr._id}
                    onClick={() => handleSavedAddressSelect(addr)}
                    className={styles.addrPill}
                  >
                    <strong>{addr.label}</strong>: {addr.addressLine}, {addr.city}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handlePlaceOrder}>
            {/* Shipping Address */}
            <div className={`${styles.formCard} glass-panel`}>
              <h3>Shipping Information</h3>
              
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="form-input"
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Address line *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="form-input"
                    placeholder="Street address, Apartment, Suite, etc."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>City *</label>
                  <input
                    type="text"
                    required
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={shippingPostal}
                    onChange={(e) => setShippingPostal(e.target.value.replace(/[^0-9]/g, ''))}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Billing Address Toggle */}
            <div className={styles.checkboxContainer}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={billingSame}
                  onChange={(e) => setBillingSame(e.target.checked)}
                />
                <span>Billing Address same as Shipping Address</span>
              </label>
            </div>

            {/* Billing Address Fields */}
            {!billingSame && (
              <div className={`${styles.formCard} glass-panel`} style={{ marginTop: '20px' }}>
                <h3>Billing Information</h3>
                
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Full Name *</label>
                    <input
                      type="text"
                      required={!billingSame}
                      value={billingName}
                      onChange={(e) => setBillingName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      required={!billingSame}
                      value={billingPhone}
                      onChange={(e) => setBillingPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      className="form-input"
                    />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>Address line *</label>
                    <input
                      type="text"
                      required={!billingSame}
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>City *</label>
                    <input
                      type="text"
                      required={!billingSame}
                      value={billingCity}
                      onChange={(e) => setBillingCity(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Postal Code *</label>
                    <input
                      type="text"
                      required={!billingSame}
                      value={billingPostal}
                      onChange={(e) => setBillingPostal(e.target.value.replace(/[^0-9]/g, ''))}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className={styles.gatewayDisclaimer}>
              <CreditCard size={16} />
              <span>You will be securely redirected to SSLCommerz to complete the payment.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glow-btn"
              style={{ width: '100%', padding: '16px', marginTop: '24px', fontSize: '16px' }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className={styles.spinner} /> Placing Order...
                </>
              ) : (
                'Place Order & Proceed to Payment'
              )}
            </button>
          </form>
        </div>

        {/* Order Items Summary Column */}
        <div className={styles.summaryColumn}>
          <div className={`${styles.summaryCard} glass-panel`}>
            <h3>Order Summary</h3>
            
            {/* Products lines */}
            <div className={styles.itemsList}>
              {activeItems.map((item) => (
                <div key={item._id} className={styles.summaryItem}>
                  <img src={item.product?.images?.[0]} alt={item.product?.name} />
                  <div className={styles.itemMeta}>
                    <h5>{item.product?.name}</h5>
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <span className={styles.itemPrice}>
                    ${((item.product?.discountPrice > 0 ? item.product.discountPrice : item.product?.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations lines */}
            <div className={styles.calcRows}>
              <div className={styles.calcRow}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className={`${styles.calcRow} ${styles.savingRow}`}>
                  <span>Catalog Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className={`${styles.calcRow} ${styles.savingRow}`}>
                  <span>Coupon Discount</span>
                  <span>-${couponDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className={styles.calcRow}>
                <span>Tax (15%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className={styles.calcRow}>
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>

              <div className={styles.totalRow}>
                <span>Grand Total</span>
                <span className={styles.grandTotalVal}>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className={styles.secureBadge}>
              <ShieldCheck size={16} /> <span>SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
