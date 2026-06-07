import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Helper to recalculate ratings for a product
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const reviewCount = reviews.length;
  const rating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  await Product.findByIdAndUpdate(productId, {
    rating: parseFloat(rating.toFixed(1)),
    reviewCount,
  });
};

// @desc    Add review for a product
// @route   POST /api/reviews
// @access  Private
export const addReview = async (req, res) => {
  const { productId, rating, comment } = req.body;

  try {
    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'All review fields are required' });
    }

    // Check if user has purchased the product (Paid orders containing the product)
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      paymentStatus: 'Paid',
      'items.product': productId,
    });

    if (!hasPurchased) {
      return res.status(403).json({
        message: 'Only customers who purchased this product can submit a review',
      });
    }

    // Check if review already exists
    const reviewExists = await Review.findOne({
      user: req.user._id,
      product: productId,
    });

    if (reviewExists) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      comment,
    });

    await updateProductRating(productId);

    res.status(201).json(review);
  } catch (error) {
    console.error('Review Error:', error.message);
    res.status(500).json({ message: 'Server error creating review' });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const review = await Review.findById(req.params.id);
    if (!review || review.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }

    review.rating = rating !== undefined ? Number(rating) : review.rating;
    review.comment = comment || review.comment;

    await review.save();
    await updateProductRating(review.product);

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating review' });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Allowed for author or admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const productId = review.product;
    await review.deleteOne();
    await updateProductRating(productId);

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting review' });
  }
};

// @desc    Report a review
// @route   PUT /api/reviews/:id/report
// @access  Private
export const reportReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isReported = true;
    await review.save();

    res.status(200).json({ message: 'Review has been reported to administration' });
  } catch (error) {
    res.status(500).json({ message: 'Server error reporting review' });
  }
};

// @desc    Get reported reviews (Admin only)
// @route   GET /api/reviews/reported
// @access  Private/Admin
export const getReportedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isReported: true })
      .populate('user', 'name email')
      .populate('product', 'name');
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving reported reviews' });
  }
};

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name profilePhoto')
      .sort({ reviewDate: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving reviews' });
  }
};
