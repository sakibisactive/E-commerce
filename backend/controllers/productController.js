import Product from '../models/Product.js';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import { suggestProductPrice } from '../services/pricingService.js';

// @desc    Get all products (Browse, Search, Filter, Sort, Paginate)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const pageSize = parseInt(req.query.limit) || 12;
    const page = parseInt(req.query.page) || 1;

    // Filters build
    const filter = {};

    // Only show visible products unless Admin requests
    if (!req.query.isAdminQuery || req.query.isAdminQuery !== 'true') {
      filter.isVisible = true;
    }

    // Search query keyword (Product name or description keywords)
    if (req.query.keyword) {
      filter.$or = [
        { name: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } },
        { sku: { $regex: req.query.keyword, $options: 'i' } },
      ];
    }

    // Filter by category
    if (req.query.category) {
      // Could be ID or array of IDs
      if (Array.isArray(req.query.category)) {
        filter.category = { $in: req.query.category };
      } else {
        filter.category = req.query.category;
      }
    }

    // Filter by brand
    if (req.query.brand) {
      if (Array.isArray(req.query.brand)) {
        filter.brand = { $in: req.query.brand };
      } else {
        filter.brand = req.query.brand;
      }
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        filter.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter.price.$lte = Number(req.query.maxPrice);
      }
    }

    // Filter by rating
    if (req.query.rating) {
      filter.rating = { $gte: Number(req.query.rating) };
    }

    // Filter by availability (In Stock)
    if (req.query.availability === 'in-stock') {
      filter.stockQuantity = { $gt: 0 };
    } else if (req.query.availability === 'out-of-stock') {
      filter.stockQuantity = { $eq: 0 };
    }

    // Sorting
    let sortOptions = {};
    const sort = req.query.sort;
    if (sort === 'price-asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'popular') {
      sortOptions = { reviewCount: -1, rating: -1 };
    } else if (sort === 'rating') {
      sortOptions = { rating: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    } else {
      sortOptions = { createdAt: -1 }; // default: newest
    }

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name isHidden')
      .populate('brand', 'name logo')
      .sort(sortOptions)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.status(200).json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    console.error('Get Products Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving products' });
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name description')
      .populate('brand', 'name logo description');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Related products (from same category or same brand)
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      isVisible: true,
      $or: [
        { category: product.category._id },
        { brand: product.brand._id },
      ],
    }).limit(6);

    res.status(200).json({
      product,
      relatedProducts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving product details' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const {
    name,
    sku,
    description,
    brand,
    category,
    price,
    suggestedPrice,
    discountPrice,
    stockQuantity,
    images,
    isVisible,
    promoLabel,
  } = req.body;

  try {
    if (!name || !sku || !description || !brand || !category || price === undefined || stockQuantity === undefined) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    const productExists = await Product.findOne({ sku });
    if (productExists) {
      return res.status(400).json({ message: 'Product SKU already exists' });
    }

    const product = await Product.create({
      name,
      sku,
      description,
      brand,
      category,
      price,
      suggestedPrice: suggestedPrice || 0,
      discountPrice: discountPrice || 0,
      stockQuantity,
      images: images || [],
      isVisible: isVisible !== undefined ? !!isVisible : true,
      promoLabel: promoLabel || '',
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create Product Error:', error.message);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  const {
    name,
    sku,
    description,
    brand,
    category,
    price,
    suggestedPrice,
    discountPrice,
    stockQuantity,
    images,
    isVisible,
    promoLabel,
  } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name = name || product.name;
    product.sku = sku || product.sku;
    product.description = description || product.description;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.price = price !== undefined ? price : product.price;
    product.suggestedPrice = suggestedPrice !== undefined ? suggestedPrice : product.suggestedPrice;
    product.discountPrice = discountPrice !== undefined ? discountPrice : product.discountPrice;
    product.stockQuantity = stockQuantity !== undefined ? stockQuantity : product.stockQuantity;
    product.images = images || product.images;
    product.isVisible = isVisible !== undefined ? !!isVisible : product.isVisible;
    product.promoLabel = promoLabel !== undefined ? promoLabel : product.promoLabel;

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Update Product Error:', error.message);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.status(200).json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

// @desc    Request price suggestion for pricing engine
// @route   POST /api/products/suggest-price
// @access  Private/Admin
export const getPriceSuggestion = async (req, res) => {
  const {
    marketPrice,
    features,
    category,
    brandValue,
    competitorPrices,
    demandLevel,
    salesHistoryCount,
  } = req.body;

  try {
    if (!marketPrice) {
      return res.status(400).json({ message: 'Market price is required to generate a suggestion' });
    }

    const suggestion = suggestProductPrice({
      marketPrice: Number(marketPrice),
      features: features || [],
      category: category || '',
      brandValue: brandValue || 'Medium',
      competitorPrices: competitorPrices ? competitorPrices.map(Number) : [],
      demandLevel: demandLevel || 'Medium',
      salesHistoryCount: Number(salesHistoryCount || 0),
    });

    res.status(200).json(suggestion);
  } catch (error) {
    res.status(500).json({ message: 'Server error generating price suggestion' });
  }
};
