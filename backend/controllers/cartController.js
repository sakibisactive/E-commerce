import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { logActivity } from '../middleware/logMiddleware.js';

// Helper to get or create a cart for a user
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// @desc    Get user cart details
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name sku price suggestedPrice discountPrice stockQuantity images isVisible',
      populate: [
        { path: 'brand', select: 'name' },
        { path: 'category', select: 'name' }
      ]
    });
    
    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving cart' });
  }
};

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  const { productId, quantity = 1, isSavedForLater = false } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product || !product.isVisible) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const cart = await getOrCreateCart(req.user._id);

    // Check if product exists in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Product exists, update quantity
      cart.items[itemIndex].quantity += Number(quantity);
      cart.items[itemIndex].isSavedForLater = isSavedForLater;
    } else {
      // Product does not exist, add new item
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
        isSavedForLater,
      });
    }

    await cart.save();
    
    await logActivity(req.user._id, 'Cart Activity', { 
      action: 'Added product to cart', 
      productId, 
      quantity 
    });

    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding to cart' });
  }
};

// @desc    Update cart item quantity or saved state
// @route   PUT /api/cart/items/:id
// @access  Private
export const updateCartItem = async (req, res) => {
  const { quantity, isSavedForLater } = req.body;
  const itemId = req.params.id;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (quantity !== undefined) {
      item.quantity = Number(quantity);
    }
    if (isSavedForLater !== undefined) {
      item.isSavedForLater = !!isSavedForLater;
    }

    await cart.save();

    await logActivity(req.user._id, 'Cart Activity', { 
      action: 'Updated cart item', 
      itemId, 
      quantity,
      isSavedForLater 
    });

    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating cart item' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:id
// @access  Private
export const removeFromCart = async (req, res) => {
  const itemId = req.params.id;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    const productId = item ? item.product : null;

    cart.items = cart.items.filter((i) => i._id.toString() !== itemId);
    await cart.save();

    if (productId) {
      await logActivity(req.user._id, 'Cart Activity', { 
        action: 'Removed product from cart', 
        productId 
      });
    }

    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: 'Server error removing item from cart' });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ message: 'Cart cleared successfully', items: [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error clearing cart' });
  }
};
