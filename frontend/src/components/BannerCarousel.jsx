import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './BannerCarousel.module.css';

export const BannerCarousel = ({ banners = [] }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play feature
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners || banners.length === 0) {
    return null;
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const currentBanner = banners[currentIndex];

  return (
    <div className={styles.carouselContainer}>
      {/* Slide Wrapper */}
      <div
        className={styles.slide}
        style={{ backgroundImage: `linear-gradient(to right, rgba(11, 15, 25, 0.95) 20%, rgba(11, 15, 25, 0.4) 100%), url(${currentBanner.image})` }}
      >
        <div className={`container ${styles.contentContainer}`}>
          <div className={styles.content}>
            <h1 className={styles.title}>{currentBanner.title}</h1>
            <p className={styles.subtitle}>{currentBanner.subtitle}</p>
            <button
              onClick={() => navigate(currentBanner.redirectUrl)}
              className="glow-btn"
              style={{ padding: '12px 28px', fontSize: '15px' }}
            >
              {currentBanner.buttonText}
            </button>
          </div>
        </div>
      </div>

      {/* Manual Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button onClick={prevSlide} className={`${styles.navBtn} ${styles.leftBtn}`}>
            <ChevronLeft size={24} />
          </button>
          <button onClick={nextSlide} className={`${styles.navBtn} ${styles.rightBtn}`}>
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Slide Dot Indicators */}
      {banners.length > 1 && (
        <div className={styles.dotsContainer}>
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`${styles.dot} ${idx === currentIndex ? styles.activeDot : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
