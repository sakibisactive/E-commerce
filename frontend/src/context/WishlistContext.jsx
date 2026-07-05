import { API_BASE_URL, BACKEND_URL } from '../config/api.js';
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

const WishlistContext = createContext();
const API_URL = API_BASE_URL;

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const { fetchCart } = useCart();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist(null);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/wishlist`);
      setWishlist(res.data);
    } catch (error) {
      console.error('Fetch Wishlist Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/wishlist`, { productId });
      setWishlist(res.data);
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error adding to wishlist';
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      setLoading(true);
      const res = await axios.delete(`${API_URL}/wishlist/${productId}`);
      setWishlist(res.data);
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error removing from wishlist';
    } finally {
      setLoading(false);
    }
  };

  const moveToCart = async (productId) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/wishlist/move-to-cart/${productId}`);
      setWishlist(res.data.wishlist);
      await fetchCart(); // Refresh cart context
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error moving item to cart';
    } finally {
      setLoading(false);
    }
  };

  const isProductInWishlist = (productId) => {
    if (!wishlist || !wishlist.products) return false;
    return wishlist.products.some(p => p._id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        moveToCart,
        isProductInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
export default WishlistContext;
