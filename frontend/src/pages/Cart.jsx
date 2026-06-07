import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Heart, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import styles from './Cart.module.css';

export const Cart = () => {
  const navigate = useNavigate();
  const {
    cart,
    loading,
    coupon,
    couponError,
    updateCartItem,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    getCalculatedTotals,
  } = useCart();

  const { addToWishlist } = useWishlist();
  const [couponCode, setCouponCode] = useState('');

  const {
    subtotal,
    discount,
    couponDiscount,
    tax,
    shipping,
    grandTotal,
    activeItemsCount,
  } = getCalculatedTotals();

  const handleQtyChange = async (itemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    try {
      await updateCartItem(itemId, newQty, undefined);
    } catch (e) {
      alert(e);
    }
  };

  const handleSaveForLaterToggle = async (itemId, isSaved) => {
    try {
      await updateCartItem(itemId, undefined, isSaved);
    } catch (e) {
      alert(e);
    }
  };

  const handleMoveToWishlist = async (itemId, productId) => {
    try {
      await addToWishlist(productId);
      await removeFromCart(itemId);
      alert('Moved to Wishlist!');
    } catch (e) {
      alert(e);
    }
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      await applyCoupon(couponCode);
      setCouponCode('');
    } catch (err) {
      // Coupon error handled by context
    }
  };

  if (loading && !cart) {
    return (
      <div className={styles.loadingSpinner}>
        <p>Loading your shopping cart...</p>
      </div>
    );
  }

  const items = cart?.items || [];
  const activeItems = items.filter((i) => !i.isSavedForLater && i.product);
  const savedItems = items.filter((i) => i.isSavedForLater && i.product);

  return (
    <div className={`container ${styles.cartPage}`}>
      <h1 className={styles.pageTitle}>Shopping Cart</h1>

      {activeItems.length === 0 ? (
        <div className={`${styles.emptyCart} glass-panel`}>
          <h3>Your cart is empty</h3>
          <p>Browse our catalog and add items to get started!</p>
          <Link to="/shop" className="glow-btn" style={{ padding: '12px 24px', marginTop: '15px' }}>
            Go Shopping
          </Link>
        </div>
      ) : (
        <div className={styles.cartContentGrid}>
          {/* Active Items Table */}
          <div className={styles.itemsColumn}>
            <div className={styles.itemsList}>
              {activeItems.map((item) => {
                const prod = item.product;
                const price = prod.price || 0;
                const discPrice = prod.discountPrice || 0;
                const currentPrice = discPrice > 0 ? discPrice : price;

                return (
                  <div key={item._id} className={`${styles.itemCard} glass-panel`}>
                    <img src={prod.images?.[0]} alt={prod.name} className={styles.itemImg} />
                    
                    <div className={styles.itemMeta}>
                      <Link to={`/product/${prod._id}`} className={styles.itemName}>
                        <h4>{prod.name}</h4>
                      </Link>
                      <span className={styles.itemSku}>SKU: {prod.sku}</span>
                      
                      {/* Action buttons */}
                      <div className={styles.itemActions}>
                        <button
                          onClick={() => handleSaveForLaterToggle(item._id, true)}
                          className={styles.actionLink}
                        >
                          Save for Later
                        </button>
                        <span className={styles.divider}>|</span>
                        <button
                          onClick={() => handleMoveToWishlist(item._id, prod._id)}
                          className={styles.actionLink}
                        >
                          <Heart size={12} /> Move to Wishlist
                        </button>
                        <span className={styles.divider}>|</span>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className={`${styles.actionLink} ${styles.deleteLink}`}
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Quantity selectors */}
                    <div className={styles.quantityCol}>
                      <div className={styles.qtyBox}>
                        <button onClick={() => handleQtyChange(item._id, item.quantity, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleQtyChange(item._id, item.quantity, 1)}>+</button>
                      </div>
                    </div>

                    {/* Final row price */}
                    <div className={styles.priceCol}>
                      <span className={styles.itemTotalVal}>
                        ${(currentPrice * item.quantity).toFixed(2)}
                      </span>
                      {discPrice > 0 && (
                        <span className={styles.itemOriginalVal}>
                          ${(price * item.quantity).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Saved For Later items Section */}
            {savedItems.length > 0 && (
              <div className={styles.savedSection}>
                <h3>Saved for Later ({savedItems.length})</h3>
                <div className={styles.itemsList}>
                  {savedItems.map((item) => {
                    const prod = item.product;
                    return (
                      <div key={item._id} className={`${styles.itemCard} ${styles.savedCard} glass-panel`}>
                        <img src={prod.images?.[0]} alt={prod.name} className={styles.itemImg} />
                        
                        <div className={styles.itemMeta}>
                          <Link to={`/product/${prod._id}`} className={styles.itemName}>
                            <h4>{prod.name}</h4>
                          </Link>
                          <span className={styles.itemSku}>SKU: {prod.sku}</span>
                          
                          <div className={styles.itemActions}>
                            <button
                              onClick={() => handleSaveForLaterToggle(item._id, false)}
                              className={styles.actionLink}
                            >
                              Move to Cart
                            </button>
                            <span className={styles.divider}>|</span>
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className={`${styles.actionLink} ${styles.deleteLink}`}
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className={styles.priceCol}>
                          <span className={styles.normalPrice}>
                            ${(prod.discountPrice > 0 ? prod.discountPrice : prod.price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Checkout Summary panel */}
          <div className={styles.summaryColumn}>
            
            {/* Coupon Panel */}
            <div className={`${styles.couponPanel} glass-panel`}>
              <h4>Apply Coupon</h4>
              {coupon ? (
                <div className={styles.activeCouponRow}>
                  <div className={styles.couponTag}>
                    <Sparkles size={14} />
                    <span>{coupon.code}</span>
                  </div>
                  <button onClick={removeCoupon} className={styles.removeCouponBtn}>Remove</button>
                </div>
              ) : (
                <form onSubmit={handleCouponSubmit} className={styles.couponForm}>
                  <input
                    type="text"
                    placeholder="Enter Code (e.g. SAVE10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="form-input"
                    style={{ padding: '10px 14px' }}
                  />
                  <button type="submit" className="glow-btn" style={{ padding: '10px 16px' }}>
                    Apply
                  </button>
                </form>
              )}
              {couponError && (
                <div className={styles.couponError}>
                  <ShieldAlert size={14} /> {couponError}
                </div>
              )}
            </div>

            {/* Calculations Card */}
            <div className={`${styles.summaryCard} glass-panel`}>
              <h3>Order Summary</h3>
              
              <div className={styles.calcRows}>
                <div className={styles.calcRow}>
                  <span>Subtotal ({activeItemsCount} items)</span>
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
                  <span>Shipping Cost</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>

                <div className={styles.totalRow}>
                  <span>Grand Total</span>
                  <span className={styles.grandTotalVal}>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="glow-btn"
                style={{ width: '100%', padding: '14px', marginTop: '24px', fontSize: '15px' }}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
