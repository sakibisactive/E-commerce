import Brand from '../models/Brand.js';

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({});
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving brands' });
  }
};

// @desc    Create a brand
// @route   POST /api/brands
// @access  Private/Admin
export const createBrand = async (req, res) => {
  const { name, logo, description } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    const brandExists = await Brand.findOne({ name });
    if (brandExists) {
      return res.status(400).json({ message: 'Brand already exists' });
    }

    const brand = await Brand.create({
      name,
      logo: logo || '',
      description: description || '',
    });

    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating brand' });
  }
};

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
export const updateBrand = async (req, res) => {
  const { name, logo, description } = req.body;

  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    brand.name = name || brand.name;
    brand.logo = logo !== undefined ? logo : brand.logo;
    brand.description = description !== undefined ? description : brand.description;

    const updatedBrand = await brand.save();
    res.status(200).json(updatedBrand);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating brand' });
  }
};

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    await brand.deleteOne();
    res.status(200).json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting brand' });
  }
};
