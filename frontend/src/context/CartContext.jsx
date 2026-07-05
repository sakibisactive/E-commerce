import { API_BASE_URL, BACKEND_URL } from '../config/api.js';
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();
const API_URL = API_BASE_URL;

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Fetch cart when user logs in
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
      setCoupon(null);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/cart`);
      setCart(res.data);
    } catch (error) {
      console.error('Fetch Cart Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/cart`, { productId, quantity });
      setCart(res.data);
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error adding to cart';
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity, isSavedForLater) => {
    try {
      setLoading(true);
      const res = await axios.put(`${API_URL}/cart/items/${itemId}`, {
        quantity,
        isSavedForLater,
      });
      setCart(res.data);
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error updating cart item';
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      const res = await axios.delete(`${API_URL}/cart/items/${itemId}`);
      setCart(res.data);
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error removing item';
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const res = await axios.delete(`${API_URL}/cart`);
      setCart(res.data);
      setCoupon(null);
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error clearing cart';
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (code) => {
    try {
      setCouponError('');
      const res = await axios.post(`${API_URL}/coupons/validate`, { code });
      setCoupon(res.data);
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid coupon code';
      setCouponError(msg);
      setCoupon(null);
      throw msg;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError('');
  };

  const getCalculatedTotals = () => {
    if (!cart || !cart.items) {
      return { subtotal: 0, discount: 0, couponDiscount: 0, tax: 0, shipping: 0, grandTotal: 0 };
    }

    // Filter out items that are saved for later
    const activeItems = cart.items.filter(item => !item.isSavedForLater && item.product);

    let subtotal = 0;
    let discount = 0;

    activeItems.forEach((item) => {
      const price = item.product.price || 0;
      const discPrice = item.product.discountPrice || 0;
      subtotal += price * item.quantity;
      if (discPrice > 0) {
        discount += (price - discPrice) * item.quantity;
      }
    });

    const netSubtotal = subtotal - discount;

    // Apply Coupon
    let couponDiscount = 0;
    if (coupon) {
      if (coupon.discountType === 'Percentage') {
        couponDiscount = (netSubtotal * coupon.discountValue) / 100;
      } else {
        couponDiscount = coupon.discountValue;
      }
      couponDiscount = Math.min(couponDiscount, netSubtotal);
    }

    const baseAmountForTax = netSubtotal - couponDiscount;
    const tax = parseFloat((baseAmountForTax * 0.15).toFixed(2)); // 15% tax
    const shipping = baseAmountForTax > 100 || baseAmountForTax === 0 ? 0 : 10;
    const grandTotal = parseFloat((baseAmountForTax + tax + shipping).toFixed(2));

    return {
      subtotal,
      discount,
      couponDiscount,
      tax,
      shipping,
      grandTotal,
      activeItemsCount: activeItems.reduce((acc, item) => acc + item.quantity, 0),
    };
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        coupon,
        couponError,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        getCalculatedTotals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
