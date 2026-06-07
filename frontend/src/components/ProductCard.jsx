import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import styles from './ProductCard.module.css';

export const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isProductInWishlist } = useWishlist();

  const inWishlist = isProductInWishlist(product._id);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in to manage your wishlist');
      return;
    }

    try {
      if (inWishlist) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in to add items to your cart');
      return;
    }

    try {
      if (product.stockQuantity === 0) {
        alert('Product is out of stock!');
        return;
      }
      await addToCart(product._id, 1);
    } catch (err) {
      console.error(err);
    }
  };

  // Determine badge type
  const badgeClass =
    product.promoLabel === 'New'
      ? 'badge-new'
      : product.promoLabel === 'Sale'
      ? 'badge-sale'
      : product.promoLabel === 'Trending'
      ? 'badge-trending'
      : product.promoLabel === 'Popular'
      ? 'badge-trending'
      : '';

  return (
    <div className={`${styles.card} glass-panel glass-panel-hover`}>
      {/* Product Image Panel */}
      <Link to={`/product/${product._id}`} className={styles.imageContainer}>
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.name} className={styles.productImage} />
        ) : (
          <div className={styles.imagePlaceholder}>No Image</div>
        )}
        
        {/* Floating Badges */}
        {product.promoLabel && (
          <span className={`badge ${badgeClass} ${styles.badgePosition}`}>{product.promoLabel}</span>
        )}

        {/* Heart icon button */}
        <button onClick={handleWishlistToggle} className={`${styles.wishlistBtn} ${inWishlist ? styles.activeWishlist : ''}`}>
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </Link>

      {/* Info details */}
      <div className={styles.details}>
        <div className={styles.categoryBrand}>
          <span>{product.brand?.name || 'Brand'}</span>
          <span className={styles.bullet}>•</span>
          <span>{product.category?.name || 'Category'}</span>
        </div>

        <Link to={`/product/${product._id}`} className={styles.name}>
          <h3>{product.name}</h3>
        </Link>

        {/* Ratings */}
        <div className={styles.ratingBox}>
          <div className={styles.stars}>
            <Star size={12} fill="#fbbf24" stroke="none" />
            <span className={styles.ratingVal}>{product.rating}</span>
          </div>
          <span className={styles.reviewCount}>({product.reviewCount} reviews)</span>
        </div>

        {/* Pricing & Add to Cart footer */}
        <div className={styles.footerRow}>
          <div className={styles.priceContainer}>
            {product.discountPrice > 0 ? (
              <>
                <span className={styles.discountedPrice}>${product.discountPrice.toFixed(2)}</span>
                <span className={styles.originalPrice}>${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className={styles.normalPrice}>${product.price.toFixed(2)}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0}
            className={`${styles.cartBtn} glow-btn`}
            title={product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
