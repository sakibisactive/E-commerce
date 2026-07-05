import { API_BASE_URL, BACKEND_URL } from '../config/api.js';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, ShoppingCart, Heart, ShieldAlert, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import styles from './ProductDetails.module.css';

export const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, isProductInWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gallery Active Image
  const [activeImage, setActiveImage] = useState('');

  // Review Form States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const [prodRes, reviewsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/products/${id}`),
        axios.get(`${API_BASE_URL}/reviews/product/${id}`),
      ]);
      
      setProduct(prodRes.data.product);
      setRelatedProducts(prodRes.data.relatedProducts);
      setReviews(reviewsRes.data);
      
      if (prodRes.data.product.images?.length > 0) {
        setActiveImage(prodRes.data.product.images[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please log in to add items to your cart.');
      return;
    }
    try {
      await addToCart(product._id, 1);
    } catch (err) {
      alert(err);
    }
  };

  const inWishlist = isProductInWishlist(id);

  const handleWishlistToggle = async () => {
    if (!user) {
      alert('Please log in to manage your wishlist.');
      return;
    }
    try {
      if (inWishlist) {
        await removeFromWishlist(id);
      } else {
        await addToWishlist(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!comment.trim()) {
      setReviewError('Review comment is required');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/reviews`, {
        productId: id,
        rating,
        comment,
      });
      setReviewSuccess('Review submitted successfully!');
      setComment('');
      setRating(5);
      
      // Refresh reviews list and product rating details
      fetchProductDetails();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleReportReview = async (reviewId) => {
    try {
      await axios.put(`${API_BASE_URL}/reviews/${reviewId}/report`);
      alert('Review has been reported to administrators.');
    } catch (err) {
      alert('Error reporting review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`);
      alert('Review deleted.');
      fetchProductDetails();
    } catch (err) {
      alert('Error deleting review');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingSpinner}>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlignment: 'center' }}>
        <h2>Product not found.</h2>
        <Link to="/shop" className="glow-btn" style={{ padding: '10px 20px', marginTop: '15px' }}>
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className={`container ${styles.detailPage}`}>
      
      {/* Product Spec Row */}
      <div className={styles.productSpecRow}>
        
        {/* Images Gallery */}
        <div className={styles.gallery}>
          <div className={`${styles.mainImageWrapper} glass-panel`}>
            {activeImage ? (
              <img src={activeImage} alt={product.name} className={styles.mainImage} />
            ) : (
              <div className={styles.mainPlaceholder}>No Image</div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className={styles.thumbnails}>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`${styles.thumbBtn} glass-panel ${activeImage === img ? styles.activeThumb : ''}`}
                >
                  <img src={img} alt={`Thumb ${idx}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Spec details info */}
        <div className={styles.infoPanel}>
          <div className={styles.metaRow}>
            <span className={styles.brandName}>{product.brand?.name}</span>
            <span className={styles.skuText}>SKU: {product.sku}</span>
          </div>

          <h1 className={styles.productName}>{product.name}</h1>

          {/* Ratings Header */}
          <div className={styles.ratingHeader}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.round(product.rating) ? '#fbbf24' : 'none'}
                  stroke={i < Math.round(product.rating) ? 'none' : 'currentColor'}
                  style={{ color: i < Math.round(product.rating) ? '#fbbf24' : '#6b7280' }}
                />
              ))}
              <span className={styles.ratingVal}>{product.rating}</span>
            </div>
            <span className={styles.reviewCount}>{product.reviewCount} Reviews</span>
          </div>

          {/* Price Box */}
          <div className={styles.priceBox}>
            {product.discountPrice > 0 ? (
              <div className={styles.priceRow}>
                <span className={styles.discountedPrice}>${product.discountPrice.toFixed(2)}</span>
                <span className={styles.originalPrice}>${product.price.toFixed(2)}</span>
                <span className={styles.savingsBadge}>
                  Save ${(product.price - product.discountPrice).toFixed(2)}
                </span>
              </div>
            ) : (
              <span className={styles.normalPrice}>${product.price.toFixed(2)}</span>
            )}
          </div>

          {/* Stock Availability */}
          <div className={styles.stockBox}>
            <span>Availability:</span>
            {product.stockQuantity > 0 ? (
              <span className={styles.inStock}>In Stock ({product.stockQuantity} items left)</span>
            ) : (
              <span className={styles.outOfStock}>Out of Stock</span>
            )}
          </div>

          {/* Product Description */}
          <div className={styles.description}>
            <h4>Description</h4>
            <p>{product.description}</p>
          </div>

          {/* Add actions */}
          <div className={styles.actionsRow}>
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              className="glow-btn"
              style={{ padding: '14px 28px', flexGrow: 1, fontSize: '15px' }}
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>

            <button
              onClick={handleWishlistToggle}
              className={`${styles.wishlistBtn} ${inWishlist ? styles.activeWishlist : ''}`}
            >
              <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className={styles.reviewsWrapper}>
        <div className={styles.reviewsHeader}>
          <h2>Customer Reviews</h2>
        </div>

        <div className={styles.reviewsGrid}>
          
          {/* List Reviews */}
          <div className={styles.reviewsList}>
            {reviews.length === 0 ? (
              <div className={styles.emptyReviews}>
                No reviews yet for this product. Be the first to buy and review!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className={`${styles.reviewCard} glass-panel`}>
                  <div className={styles.reviewUserRow}>
                    <div className={styles.reviewUser}>
                      {rev.user?.profilePhoto ? (
                        <img src={rev.user.profilePhoto} alt="User Avatar" />
                      ) : (
                        <div className={styles.userAvatarPlaceholder}>
                          {rev.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <h5>{rev.user?.name || 'Anonymous User'}</h5>
                        <span className={styles.revDate}>
                          {new Date(rev.reviewDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className={styles.stars}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < rev.rating ? '#fbbf24' : 'none'}
                          stroke={i < rev.rating ? 'none' : 'currentColor'}
                          style={{ color: i < rev.rating ? '#fbbf24' : '#6b7280' }}
                        />
                      ))}
                    </div>
                  </div>

                  <p className={styles.reviewComment}>{rev.comment}</p>

                  {/* Actions (Report / Admin delete) */}
                  <div className={styles.reviewActions}>
                    <button onClick={() => handleReportReview(rev._id)} className={styles.reportBtn}>
                      Report Review
                    </button>
                    
                    {user && (user.role === 'admin' || user._id === rev.user?._id) && (
                      <button onClick={() => handleDeleteReview(rev._id)} className={styles.deleteBtn}>
                        <Trash2 size={12} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Submit Review Panel (for logged-in users) */}
          <div className={`${styles.submitReviewBox} glass-panel`}>
            <h3>Write a Review</h3>
            <p className={styles.verifyP}>Note: Reviews are only allowed if you have purchased this item.</p>

            {user ? (
              <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                
                {/* Rating selection */}
                <div className={styles.starsSelector}>
                  <span>Rating:</span>
                  <div className={styles.starsRowInput}>
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setRating(idx)}
                        className={styles.starSelectBtn}
                      >
                        <Star
                          size={20}
                          fill={idx <= rating ? '#fbbf24' : 'none'}
                          stroke={idx <= rating ? 'none' : 'currentColor'}
                          style={{ color: idx <= rating ? '#fbbf24' : '#6b7280' }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <textarea
                    rows={4}
                    placeholder="Describe your experience with this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="form-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {reviewError && (
                  <div className={styles.errorAlert}>
                    <ShieldAlert size={16} /> {reviewError}
                  </div>
                )}

                {reviewSuccess && (
                  <div className={styles.successAlert}>
                    {reviewSuccess}
                  </div>
                )}

                <button type="submit" className="glow-btn" style={{ width: '100%', padding: '12px' }}>
                  Submit Review
                </button>
              </form>
            ) : (
              <div className={styles.loginRequired}>
                <p>Please <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>log in</Link> to write a review.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products list */}
      {relatedProducts.length > 0 && (
        <div className={styles.relatedSection}>
          <h2>Related Products</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
