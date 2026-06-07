import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BannerCarousel } from '../components/BannerCarousel';
import { ProductCard } from '../components/ProductCard';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

export const Home = () => {
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    try {
      setLoading(true);
      const [bannersRes, productsRes] = await Promise.all([
        axios.get(`http://${window.location.hostname}:5000/api/banners`),
        axios.get(`http://${window.location.hostname}:5000/api/products`),
      ]);
      setBanners(bannersRes.data);
      setProducts(productsRes.data.products);
    } catch (e) {
      console.error('Error fetching homepage data', e);
    } finally {
      setLoading(false);
    }
  };

  // Filter sections
  const newProducts = products.filter(p => p.promoLabel === 'New').slice(0, 4);
  const trendingProducts = products.filter(p => p.promoLabel === 'Trending').slice(0, 4);
  const popularProducts = products.filter(p => p.promoLabel === 'Popular').slice(0, 4);
  const promoProducts = products.filter(p => p.discountPrice > 0).slice(0, 4);
  const regularProducts = products.filter(p => !p.promoLabel && p.discountPrice === 0).slice(0, 4);

  return (
    <div className={styles.homeContainer}>
      {/* Banners Carousel */}
      <BannerCarousel banners={banners} />

      {/* Sections Container */}
      <div className="container" style={{ marginTop: '40px', paddingBottom: '80px' }}>
        
        {/* Popular Products */}
        {popularProducts.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Popular Products</h2>
              <Link to="/shop?sort=popular" className={styles.viewAll}>
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className={styles.productGrid}>
              {popularProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Trending Products */}
        {trendingProducts.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Trending Products</h2>
              <Link to="/shop?sort=popular" className={styles.viewAll}>
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className={styles.productGrid}>
              {trendingProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Promotional Deals */}
        {promoProducts.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.saleTitle}>Promotional Deals</h2>
              <Link to="/shop" className={styles.viewAll}>
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className={styles.productGrid}>
              {promoProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* New Products */}
        {newProducts.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>New Arrivals</h2>
              <Link to="/shop?sort=newest" className={styles.viewAll}>
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className={styles.productGrid}>
              {newProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Regular Catalogue Products */}
        {regularProducts.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Our Catalog</h2>
              <Link to="/shop" className={styles.viewAll}>
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className={styles.productGrid}>
              {regularProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {products.length === 0 && !loading && (
          <div className={styles.noProducts}>
            <ShoppingBag size={48} className={styles.emptyIcon} />
            <h3>No Products Found</h3>
            <p>Our store catalog is currently empty. Seed the database or add products in admin console.</p>
          </div>
        )}
      </div>
    </div>
  );
};
