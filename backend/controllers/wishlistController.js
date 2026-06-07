import Wishlist from '../models/Wishlist.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Helper to get or create wishlist
const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }
  return wishlist;
};

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await getOrCreateWishlist(req.user._id);
    const populated = await Wishlist.findById(wishlist._id).populate({
      path: 'products',
      select: 'name sku price suggestedPrice discountPrice stockQuantity images isVisible'
    });
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving wishlist' });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = async (req, res) => {
  const { productId } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const wishlist = await getOrCreateWishlist(req.user._id);

    if (wishlist.products.includes(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    wishlist.products.push(productId);
    await wishlist.save();

    const populated = await Wishlist.findById(wishlist._id).populate('products');
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding to wishlist' });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
export const removeFromWishlist = async (req, res) => {
  const productId = req.params.id;

  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );
    await wishlist.save();

    const populated = await Wishlist.findById(wishlist._id).populate('products');
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error removing from wishlist' });
  }
};

// @desc    Move item from wishlist to cart
// @route   POST /api/wishlist/move-to-cart/:id
// @access  Private
export const moveToCart = async (req, res) => {
  const productId = req.params.id;

  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist || !wishlist.products.includes(productId)) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }

    // Add to cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({ product: productId, quantity: 1 });
    }
    await cart.save();

    // Remove from wishlist
    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );
    await wishlist.save();

    const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
    
    res.status(200).json({
      message: 'Product moved to cart',
      wishlist: populatedWishlist,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error moving item to cart' });
  }
};
