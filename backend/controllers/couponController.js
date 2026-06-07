import Coupon from '../models/Coupon.js';

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req, res) => {
  const { code } = req.body;

  try {
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon invalid or disabled' });
    }

    const currentDate = new Date();
    if (currentDate < coupon.startDate) {
      return res.status(400).json({ message: 'Coupon campaign has not started yet' });
    }

    if (currentDate > coupon.endDate) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    res.status(200).json({
      message: 'Coupon is valid!',
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error validating coupon' });
  }
};

// @desc    Create a coupon (Admin only)
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  const { code, discountType, discountValue, startDate, endDate, usageLimit } = req.body;

  try {
    if (!code || !discountType || !discountValue || !startDate || !endDate || !usageLimit) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      usageLimit: Number(usageLimit),
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating coupon' });
  }
};

// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving coupons' });
  }
};

// @desc    Update coupon (Admin only)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    coupon.discountType = req.body.discountType || coupon.discountType;
    coupon.discountValue = req.body.discountValue !== undefined ? Number(req.body.discountValue) : coupon.discountValue;
    coupon.startDate = req.body.startDate ? new Date(req.body.startDate) : coupon.startDate;
    coupon.endDate = req.body.endDate ? new Date(req.body.endDate) : coupon.endDate;
    coupon.usageLimit = req.body.usageLimit !== undefined ? Number(req.body.usageLimit) : coupon.usageLimit;
    coupon.isActive = req.body.isActive !== undefined ? !!req.body.isActive : coupon.isActive;

    const updatedCoupon = await coupon.save();
    res.status(200).json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating coupon' });
  }
};

// @desc    Delete coupon (Admin only)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await coupon.deleteOne();
    res.status(200).json({ message: 'Coupon removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting coupon' });
  }
};
