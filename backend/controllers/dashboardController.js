import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Get dashboard analytics metrics
// @route   GET /api/dashboard/analytics
// @access  Private/Admin
export const getDashboardAnalytics = async (req, res) => {
  try {
    const now = new Date();
    
    // Start of Today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of Current Month
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Start of last 10 days (for trending products)
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    
    // Start of last 30 days (for new users)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // --- REVENUE METRICS ---
    // Total Revenue (Only Paid orders)
    const totalRevResult = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);
    const totalRevenue = totalRevResult[0] ? totalRevResult[0].total : 0;

    // Monthly Revenue (Paid, current month)
    const monthlyRevResult = await Order.aggregate([
      { $match: { paymentStatus: 'Paid', createdAt: { $gte: startOfCurrentMonth } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);
    const monthlyRevenue = monthlyRevResult[0] ? monthlyRevResult[0].total : 0;

    // Daily Revenue (Paid, today)
    const dailyRevResult = await Order.aggregate([
      { $match: { paymentStatus: 'Paid', createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);
    const dailyRevenue = dailyRevResult[0] ? dailyRevResult[0].total : 0;

    // --- ORDERS METRICS ---
    const totalOrders = await Order.countDocuments({});
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const completedOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

    // --- PRODUCT METRICS ---
    // Low stock products
    const lowStockProducts = await Product.find({ stockQuantity: { $lte: 5 } })
      .select('name sku stockQuantity price')
      .limit(10);

    // Most Sold Products (Aggregated)
    const mostSoldProducts = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          soldQuantity: { $sum: '$items.quantity' },
          totalSalesAmount: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { soldQuantity: -1 } },
      { $limit: 5 },
    ]);

    // Trending Products (Aggregated over last 10 days)
    const trendingProducts = await Order.aggregate([
      { $match: { paymentStatus: 'Paid', createdAt: { $gte: tenDaysAgo } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          soldQuantity: { $sum: '$items.quantity' },
        },
      },
      { $sort: { soldQuantity: -1 } },
      { $limit: 5 },
    ]);

    // --- USER METRICS ---
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const newUsers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: thirtyDaysAgo },
    });

    // --- MONTHLY REVENUE CURVE DATA (Last 6 Months) ---
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const revenueCurve = await Order.aggregate([
      { $match: { paymentStatus: 'Paid', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$grandTotal' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      revenue: {
        totalRevenue,
        monthlyRevenue,
        dailyRevenue,
      },
      orders: {
        totalOrders,
        pendingOrders,
        completedOrders,
      },
      products: {
        lowStockProducts,
        mostSoldProducts,
        trendingProducts,
      },
      users: {
        totalUsers,
        newUsers,
      },
      revenueCurve,
    });
  } catch (error) {
    console.error('Analytics Fetch Error:', error.message);
    res.status(500).json({ message: 'Server error compiling dashboard analytics' });
  }
};
