import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';
import { SlidersHorizontal, Search, Star, Loader2 } from 'lucide-react';
import styles from './Shop.module.css';

export const Shop = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [availability, setAvailability] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Sync state with URL params on load/change
  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Parse URL params
    const categoryParam = params.getAll('category');
    const brandParam = params.getAll('brand');
    
    setSelectedCategories(categoryParam);
    setSelectedBrands(brandParam);
    setMinPrice(params.get('minPrice') || '');
    setMaxPrice(params.get('maxPrice') || '');
    setSelectedRating(params.get('rating') || '');
    setAvailability(params.get('availability') || '');
    setSort(params.get('sort') || 'newest');
    setPage(parseInt(params.get('page')) || 1);

    fetchProducts(params);
  }, [location.search]);

  const fetchMetadata = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        axios.get(`http://${window.location.hostname}:5000/api/categories`),
        axios.get(`http://${window.location.hostname}:5000/api/brands`),
      ]);
      setCategories(catRes.data);
      setBrands(brandRes.data);
    } catch (e) {
      console.error('Metadata Fetch error', e);
    }
  };

  const fetchProducts = async (params) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://${window.location.hostname}:5000/api/products`, {
        params: Object.fromEntries(params.entries()),
      });
      setProducts(res.data.products);
      setPages(res.data.pages);
      setTotal(res.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateUrlParams = (updates = {}) => {
    const params = new URLSearchParams(location.search);
    
    // Reset page on filter changes unless explicitly updating page
    if (!updates.page) {
      params.delete('page');
    }

    Object.entries(updates).forEach(([key, val]) => {
      params.delete(key);
      if (Array.isArray(val)) {
        val.forEach(item => params.append(key, item));
      } else if (val !== undefined && val !== null && val !== '') {
        params.set(key, val);
      }
    });

    navigate(`/shop?${params.toString()}`);
  };

  const handleCategoryToggle = (id) => {
    const index = selectedCategories.indexOf(id);
    let updated = [...selectedCategories];
    if (index > -1) {
      updated.splice(index, 1);
    } else {
      updated.push(id);
    }
    updateUrlParams({ category: updated });
  };

  const handleBrandToggle = (id) => {
    const index = selectedBrands.indexOf(id);
    let updated = [...selectedBrands];
    if (index > -1) {
      updated.splice(index, 1);
    } else {
      updated.push(id);
    }
    updateUrlParams({ brand: updated });
  };

  const handleClearFilters = () => {
    navigate('/shop');
  };

  const handleApplyPrice = (e) => {
    e.preventDefault();
    updateUrlParams({ minPrice, maxPrice });
  };

  return (
    <div className={`container ${styles.shopPage}`}>
      {/* Sidebar Filter Panel */}
      <aside className={`${styles.sidebar} glass-panel`}>
        <div className={styles.sidebarHeader}>
          <h3><SlidersHorizontal size={16} /> Filters</h3>
          <button onClick={handleClearFilters} className={styles.clearBtn}>Clear All</button>
        </div>

        {/* Categories Section */}
        <div className={styles.filterSection}>
          <h4>Categories</h4>
          <div className={styles.checkboxList}>
            {categories.map((c) => (
              <label key={c._id} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(c._id)}
                  onChange={() => handleCategoryToggle(c._id)}
                />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Brands Section */}
        <div className={styles.filterSection}>
          <h4>Brands</h4>
          <div className={styles.checkboxList}>
            {brands.map((b) => (
              <label key={b._id} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(b._id)}
                  onChange={() => handleBrandToggle(b._id)}
                />
                <span>{b.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Filter Section */}
        <div className={styles.filterSection}>
          <h4>Price Range</h4>
          <form onSubmit={handleApplyPrice} className={styles.priceForm}>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="form-input"
              style={{ padding: '8px 12px' }}
            />
            <span className={styles.dash}>-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="form-input"
              style={{ padding: '8px 12px' }}
            />
            <button type="submit" className="glow-btn" style={{ padding: '8px' }}>Go</button>
          </form>
        </div>

        {/* Ratings Filter */}
        <div className={styles.filterSection}>
          <h4>Min Rating</h4>
          <div className={styles.ratingList}>
            {[4, 3, 2].map((stars) => (
              <button
                key={stars}
                onClick={() => updateUrlParams({ rating: selectedRating == stars ? '' : stars })}
                className={`${styles.ratingBtn} ${selectedRating == stars ? styles.activeRating : ''}`}
              >
                <div className={styles.starsRow}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < stars ? '#fbbf24' : 'none'}
                      stroke={i < stars ? 'none' : 'currentColor'}
                    />
                  ))}
                </div>
                <span>& Up</span>
              </button>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className={styles.filterSection}>
          <h4>Availability</h4>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={availability === 'in-stock'}
              onChange={() => updateUrlParams({ availability: availability === 'in-stock' ? '' : 'in-stock' })}
            />
            <span>In Stock Only</span>
          </label>
        </div>
      </aside>

      {/* Main Browse Panel */}
      <main className={styles.mainContent}>
        {/* Top Control Bar */}
        <div className={`${styles.topBar} glass-panel`}>
          <div className={styles.resultsCount}>
            <span>Showing {products.length} of {total} products</span>
          </div>

          <div className={styles.sortContainer}>
            <span>Sort By:</span>
            <select
              value={sort}
              onChange={(e) => updateUrlParams({ sort: e.target.value })}
              className={styles.sortSelect}
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Products Grid list */}
        {loading ? (
          <div className={styles.loadingSpinner}>
            <Loader2 size={36} className={styles.spinner} />
            <p>Retrieving catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className={styles.emptySearch}>
            <h3>No Products Match Filters</h3>
            <p>Try resetting categories, clearing brands, or raising your price constraints.</p>
            <button onClick={handleClearFilters} className="glow-btn" style={{ padding: '10px 20px', marginTop: '15px' }}>
              Reset Search filters
            </button>
          </div>
        ) : (
          <>
            <div className={styles.productGrid}>
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>

            {/* Pagination Controls */}
            {pages > 1 && (
              <div className={styles.pagination}>
                <button
                  disabled={page === 1}
                  onClick={() => updateUrlParams({ page: page - 1 })}
                  className="secondary-btn"
                  style={{ padding: '8px 16px' }}
                >
                  Previous
                </button>
                <span className={styles.pageInfo}>Page {page} of {pages}</span>
                <button
                  disabled={page === pages}
                  onClick={() => updateUrlParams({ page: page + 1 })}
                  className="secondary-btn"
                  style={{ padding: '8px 16px' }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
