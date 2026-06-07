import Banner from '../models/Banner.js';

// @desc    Get all active banners
// @route   GET /api/banners
// @access  Public
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({}).sort({ sequence: 1 });
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving banners' });
  }
};

// @desc    Create a banner (Admin only)
// @route   POST /api/banners
// @access  Private/Admin
export const createBanner = async (req, res) => {
  const { title, subtitle, image, buttonText, redirectUrl, sequence } = req.body;

  try {
    if (!title || !image) {
      return res.status(400).json({ message: 'Title and Image URL are required' });
    }

    const banner = await Banner.create({
      title,
      subtitle: subtitle || '',
      image,
      buttonText: buttonText || 'Shop Now',
      redirectUrl: redirectUrl || '/shop',
      sequence: Number(sequence || 0),
    });

    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating banner' });
  }
};

// @desc    Update banner (Admin only)
// @route   PUT /api/banners/:id
// @access  Private/Admin
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    banner.title = req.body.title || banner.title;
    banner.subtitle = req.body.subtitle !== undefined ? req.body.subtitle : banner.subtitle;
    banner.image = req.body.image || banner.image;
    banner.buttonText = req.body.buttonText || banner.buttonText;
    banner.redirectUrl = req.body.redirectUrl || banner.redirectUrl;
    banner.sequence = req.body.sequence !== undefined ? Number(req.body.sequence) : banner.sequence;

    const updated = await banner.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating banner' });
  }
};

// @desc    Delete banner (Admin only)
// @route   DELETE /api/banners/:id
// @access  Private/Admin
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    await banner.deleteOne();
    res.status(200).json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting banner' });
  }
};
