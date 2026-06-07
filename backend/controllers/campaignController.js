import Campaign from '../models/Campaign.js';
import Product from '../models/Product.js';

// @desc    Get all active campaigns
// @route   GET /api/campaigns
// @access  Public
export const getActiveCampaigns = async (req, res) => {
  try {
    const currentDate = new Date();
    const campaigns = await Campaign.find({
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    }).populate({
      path: 'products',
      select: 'name sku price discountPrice images rating'
    });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving campaigns' });
  }
};

// @desc    Create a campaign (Admin only)
// @route   POST /api/campaigns
// @access  Private/Admin
export const createCampaign = async (req, res) => {
  const { title, description, discountType, discountValue, products, startDate, endDate, isActive } = req.body;

  try {
    if (!title || !discountType || discountValue === undefined || !startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const campaign = await Campaign.create({
      title,
      description: description || '',
      discountType,
      discountValue: Number(discountValue),
      products: products || [],
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: isActive !== undefined ? !!isActive : true,
    });

    // Apply campaign discounts directly to product discountPrice fields
    if (products && products.length > 0) {
      for (const prodId of products) {
        const prod = await Product.findById(prodId);
        if (prod) {
          let discPrice = 0;
          if (discountType === 'Percentage') {
            discPrice = prod.price - (prod.price * discountValue) / 100;
          } else {
            discPrice = prod.price - discountValue;
          }
          prod.discountPrice = Math.max(0, parseFloat(discPrice.toFixed(2)));
          prod.promoLabel = 'Sale';
          await prod.save();
        }
      }
    }

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Create Campaign Error:', error.message);
    res.status(500).json({ message: 'Server error creating campaign' });
  }
};

// @desc    Get all campaigns (Admin list)
// @route   GET /api/campaigns/all
// @access  Private/Admin
export const getCampaignsAdmin = async (req, res) => {
  try {
    const campaigns = await Campaign.find({}).sort({ createdAt: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving admin campaign list' });
  }
};

// @desc    Update campaign status & discounts
// @route   PUT /api/campaigns/:id
// @access  Private/Admin
export const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    campaign.title = req.body.title || campaign.title;
    campaign.description = req.body.description !== undefined ? req.body.description : campaign.description;
    campaign.isActive = req.body.isActive !== undefined ? !!req.body.isActive : campaign.isActive;
    campaign.startDate = req.body.startDate ? new Date(req.body.startDate) : campaign.startDate;
    campaign.endDate = req.body.endDate ? new Date(req.body.endDate) : campaign.endDate;

    const updated = await campaign.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating campaign' });
  }
};

// @desc    Delete campaign (Admin only)
// @route   DELETE /api/campaigns/:id
// @access  Private/Admin
export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Reset discount prices on products belonging to the campaign
    if (campaign.products && campaign.products.length > 0) {
      await Product.updateMany(
        { _id: { $in: campaign.products } },
        { discountPrice: 0, promoLabel: '' }
      );
    }

    await campaign.deleteOne();
    res.status(200).json({ message: 'Campaign removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting campaign' });
  }
};
