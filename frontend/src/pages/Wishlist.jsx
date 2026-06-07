import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import styles from './Wishlist.module.css';

export const Wishlist = () => {
  const { wishlist, loading, removeFromWishlist, moveToCart } = useWishlist();

  if (loading && !wishlist) {
    return (
      <div className={styles.loadingSpinner}>
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  const products = wishlist?.products || [];

  return (
    <div className={`container ${styles.wishlistPage}`}>
      <h1 className={styles.pageTitle}>My Wishlist</h1>

      {products.length === 0 ? (
        <div className={`${styles.emptyWishlist} glass-panel`}>
          <Heart size={48} className={styles.emptyIcon} />
          <h3>Your wishlist is empty</h3>
          <p>Tap the heart icon on any product to save it here!</p>
          <Link to="/shop" className="glow-btn" style={{ padding: '12px 24px', marginTop: '15px' }}>
            Go Shopping
          </Link>
        </div>
      ) : (
        <div className={styles.wishlistGrid}>
          {products.map((prod) => (
            <div key={prod._id} className={`${styles.wishlistCard} glass-panel`}>
              <div className={styles.imageContainer}>
                <img src={prod.images?.[0]} alt={prod.name} className={styles.productImg} />
                <button
                  onClick={() => removeFromWishlist(prod._id)}
                  className={styles.deleteBtn}
                  title="Remove from Wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className={styles.details}>
                <Link to={`/product/${prod._id}`} className={styles.name}>
                  <h3>{prod.name}</h3>
                </Link>
                <div className={styles.price}>
                  {prod.discountPrice > 0 ? (
                    <>
                      <span className={styles.discPrice}>${prod.discountPrice.toFixed(2)}</span>
                      <span className={styles.origPrice}>${prod.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className={styles.normalPrice}>${prod.price.toFixed(2)}</span>
                  )}
                </div>

                <button
                  onClick={() => {
                    moveToCart(prod._id);
                    alert('Item moved to cart!');
                  }}
                  className="glow-btn"
                  style={{ width: '100%', padding: '10px', fontSize: '13px', marginTop: '16px' }}
                >
                  <ShoppingCart size={14} /> Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
