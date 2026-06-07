import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import Invoice from '../models/Invoice.js';
import Notification from '../models/Notification.js';
import { initSSLCommerzPayment } from '../services/sslcommerzService.js';
import { generateInvoicePDF } from '../services/pdfService.js';
import { logActivity } from '../middleware/logMiddleware.js';
import { sendEmail } from '../services/emailService.js';
import path from 'path';
import fs from 'fs';

// Helper to generate unique Invoice Number
const generateInvoiceNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${rand}`;
};

// @desc    Place Order & Initialize SSLCommerz Payment
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  const { couponCode, shippingAddress, billingAddress, paymentMethod = 'SSLCommerz' } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    if (!shippingAddress || !shippingAddress.addressLine || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    let subtotal = 0;
    let discountAmount = 0;
    const orderItems = [];

    // Verify stock and calculate item prices
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product.name} not found` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }

      const itemPrice = product.price;
      // If discount price is active, subtract item-level discount
      const itemDiscount = product.discountPrice > 0 ? (product.price - product.discountPrice) : 0;
      
      subtotal += itemPrice * item.quantity;
      discountAmount += itemDiscount * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: itemPrice,
        discount: itemDiscount,
      });
    }

    // Coupon discount verification
    let couponDiscountAmount = 0;
    let validCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        const currentDate = new Date();
        if (currentDate >= coupon.startDate && currentDate <= coupon.endDate && coupon.usedCount < coupon.usageLimit) {
          validCoupon = coupon;
          const discountedSub = subtotal - discountAmount;
          if (coupon.discountType === 'Percentage') {
            couponDiscountAmount = (discountedSub * coupon.discountValue) / 100;
          } else {
            couponDiscountAmount = coupon.discountValue;
          }
          // Cap discount at total subtotal
          couponDiscountAmount = Math.min(couponDiscountAmount, discountedSub);
        }
      }
    }

    const baseAmountForTax = subtotal - discountAmount - couponDiscountAmount;
    const taxAmount = parseFloat((baseAmountForTax * 0.15).toFixed(2)); // 15% tax
    const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const grandTotal = parseFloat((baseAmountForTax + taxAmount + shippingCost).toFixed(2));

    const invoiceNumber = generateInvoiceNumber();

    // Create Order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      subtotal,
      discountAmount,
      couponDiscountAmount,
      couponCode: validCoupon ? validCoupon.code : '',
      taxAmount,
      shippingCost,
      grandTotal,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      invoiceNumber,
    });

    // Deduct stock quantities
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: -item.quantity },
      });
    }

    // Update coupon usage count
    if (validCoupon) {
      validCoupon.usedCount += 1;
      await validCoupon.save();
    }

    // Clear user cart
    cart.items = [];
    await cart.save();

    // Log Activity
    await logActivity(req.user._id, 'Order Placement', { orderId: order._id, grandTotal });

    // Send In-App Notification
    await Notification.create({
      user: req.user._id,
      title: 'Order Placed Successfully',
      message: `Your order #${order._id} for $${grandTotal.toFixed(2)} has been placed. Pending payment.`,
      channel: 'Both',
    });

    // Initialize Payment
    const paymentSession = await initSSLCommerzPayment({
      totalAmount: grandTotal,
      tranId: invoiceNumber,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone,
      customerAddress: shippingAddress.addressLine,
      customerCity: shippingAddress.city,
      customerPostcode: shippingAddress.postalCode,
    });

    res.status(201).json({
      message: 'Order created successfully!',
      orderId: order._id,
      invoiceNumber,
      grandTotal,
      paymentUrl: paymentSession.GatewayPageURL,
    });
  } catch (error) {
    console.error('Order Creation Error:', error.message);
    res.status(500).json({ message: 'Server error placing order' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving your orders' });
  }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Allow user who made order, or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving order' });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving all orders' });
  }
};

// @desc    Update order status & auto-create invoice
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;

  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    const updatedOrder = await order.save();

    // Trigger Notification for Status Update
    await Notification.create({
      user: order.user._id,
      title: `Order Status Updated: ${orderStatus || order.orderStatus}`,
      message: `Your order #${order._id} status is now: ${orderStatus || order.orderStatus}. Payment status: ${paymentStatus || order.paymentStatus}`,
      channel: 'Both',
    });

    // Send status update email
    await sendEmail({
      to: order.user.email,
      subject: `Order #${order._id} Status: ${orderStatus || order.orderStatus}`,
      html: `<p>Hi ${order.user.name},</p><p>Your order status has been updated to: <b>${orderStatus || order.orderStatus}</b></p>`
    });

    // If payment status becomes Paid or order becomes Delivered, generate/verify invoice
    if (order.paymentStatus === 'Paid') {
      const invoiceExists = await Invoice.findOne({ order: order._id });
      if (!invoiceExists) {
        const pdfPath = await generateInvoicePDF(order, order.invoiceNumber);
        await Invoice.create({
          invoiceNumber: order.invoiceNumber,
          order: order._id,
          user: order.user._id,
          pdfPath,
        });
      }
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Update Order Error:', error.message);
    res.status(500).json({ message: 'Server error updating order' });
  }
};

// @desc    Download invoice PDF
// @route   GET /api/orders/:id/invoice
// @access  Private
export const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to download this invoice' });
    }

    let invoice = await Invoice.findOne({ order: order._id });
    
    // Auto-create invoice if payment is Paid but invoice is missing
    if (!invoice && order.paymentStatus === 'Paid') {
      const pdfPath = await generateInvoicePDF(order, order.invoiceNumber);
      invoice = await Invoice.create({
        invoiceNumber: order.invoiceNumber,
        order: order._id,
        user: order.user,
        pdfPath,
      });
    }

    if (!invoice || !invoice.pdfPath) {
      // Fallback: Generate PDF on the fly regardless of payment (e.g. unpaid invoice preview)
      const tempPath = await generateInvoicePDF(order, order.invoiceNumber);
      if (fs.existsSync(tempPath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.invoiceNumber}.pdf`);
        return fs.createReadStream(tempPath).pipe(res);
      }
      return res.status(400).json({ message: 'Invoice not generated yet' });
    }

    if (fs.existsSync(invoice.pdfPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.invoiceNumber}.pdf`);
      fs.createReadStream(invoice.pdfPath).pipe(res);
    } else {
      // Re-create if file deleted
      const pathRecreated = await generateInvoicePDF(order, order.invoiceNumber);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.invoiceNumber}.pdf`);
      fs.createReadStream(pathRecreated).pipe(res);
    }
  } catch (error) {
    console.error('Invoice Download Error:', error.message);
    res.status(500).json({ message: 'Server error downloading invoice PDF' });
  }
};
