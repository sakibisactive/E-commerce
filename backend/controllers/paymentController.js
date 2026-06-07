import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import Product from '../models/Product.js';
import Notification from '../models/Notification.js';
import { validateSSLCommerzPayment } from '../services/sslcommerzService.js';
import { generateInvoicePDF } from '../services/pdfService.js';
import { logActivity } from '../middleware/logMiddleware.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// @desc    Handle SSLCommerz Success callback
// @route   POST /api/payments/success
// @access  Public
export const paymentSuccess = async (req, res) => {
  const { tranId } = req.query;
  const gatewayData = req.body; // SSLCommerz details are sent in POST body

  try {
    const order = await Order.findOne({ invoiceNumber: tranId }).populate('user');
    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Set statuses
    order.paymentStatus = 'Paid';
    order.orderStatus = 'Confirmed';
    await order.save();

    // Create Payment log
    await Payment.create({
      order: order._id,
      user: order.user._id,
      tranId,
      amount: order.grandTotal,
      valId: gatewayData.val_id || 'mock_val_id',
      cardType: gatewayData.card_type || 'Visa/Master',
      paymentStatus: 'Paid',
      gatewayResponse: gatewayData,
    });

    // Create Invoice PDF
    const pdfPath = await generateInvoicePDF(order, tranId);
    await Invoice.create({
      invoiceNumber: tranId,
      order: order._id,
      user: order.user._id,
      pdfPath,
    });

    // Send In-App Notifications
    await Notification.create({
      user: order.user._id,
      title: 'Payment Received',
      message: `Your payment of $${order.grandTotal.toFixed(2)} was successfully processed!`,
      channel: 'Both',
    });

    await logActivity(order.user._id, 'Payment Activity', { status: 'Paid', tranId });

    // Redirect user to the frontend checkout success page
    res.redirect(`${FRONTEND_URL}/checkout/success?orderId=${order._id}`);
  } catch (error) {
    console.error('Payment Success Handler Error:', error.message);
    res.status(500).send('Server Error handling payment success callback');
  }
};

// @desc    Handle SSLCommerz Fail callback
// @route   POST /api/payments/fail
// @access  Public
export const paymentFail = async (req, res) => {
  const { tranId } = req.query;

  try {
    const order = await Order.findOne({ invoiceNumber: tranId });
    if (!order) {
      return res.status(404).send('Order not found');
    }

    order.paymentStatus = 'Failed';
    order.orderStatus = 'Cancelled';
    await order.save();

    // Release stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: item.quantity },
      });
    }

    await Payment.create({
      order: order._id,
      user: order.user,
      tranId,
      amount: order.grandTotal,
      paymentStatus: 'Failed',
    });

    await logActivity(order.user, 'Payment Activity', { status: 'Failed', tranId });

    res.redirect(`${FRONTEND_URL}/checkout/fail?orderId=${order._id}`);
  } catch (error) {
    console.error('Payment Fail Handler Error:', error.message);
    res.status(500).send('Server Error handling payment fail callback');
  }
};

// @desc    Handle SSLCommerz Cancel callback
// @route   POST /api/payments/cancel
// @access  Public
export const paymentCancel = async (req, res) => {
  const { tranId } = req.query;

  try {
    const order = await Order.findOne({ invoiceNumber: tranId });
    if (!order) {
      return res.status(404).send('Order not found');
    }

    order.paymentStatus = 'Pending';
    order.orderStatus = 'Cancelled';
    await order.save();

    // Release stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: item.quantity },
      });
    }

    await logActivity(order.user, 'Payment Activity', { status: 'Cancelled', tranId });

    res.redirect(`${FRONTEND_URL}/checkout/cancel?orderId=${order._id}`);
  } catch (error) {
    console.error('Payment Cancel Handler Error:', error.message);
    res.status(500).send('Server Error handling payment cancel callback');
  }
};

// @desc    Handle SSLCommerz Instant Payment Notification (IPN)
// @route   POST /api/payments/ipn
// @access  Public
export const paymentIPN = async (req, res) => {
  const { val_id, tran_id, status } = req.body;

  try {
    const order = await Order.findOne({ invoiceNumber: tran_id }).populate('user');
    if (!order) {
      return res.status(400).send('Order not found for transaction');
    }

    if (status === 'VALID' || status === 'VALIDATED') {
      const verified = await validateSSLCommerzPayment(val_id);
      
      if (verified && verified.status === 'VALIDATED') {
        order.paymentStatus = 'Paid';
        order.orderStatus = 'Confirmed';
        await order.save();

        const payment = await Payment.findOne({ tranId: tran_id });
        if (payment) {
          payment.paymentStatus = 'Paid';
          payment.valId = val_id;
          payment.gatewayResponse = req.body;
          await payment.save();
        }

        // Generate Invoice
        const pdfPath = await generateInvoicePDF(order, tran_id);
        await Invoice.findOneAndUpdate(
          { invoiceNumber: tran_id },
          { order: order._id, user: order.user._id, pdfPath },
          { upsert: true }
        );
      }
    }
    res.status(200).send('IPN Processed Successfully');
  } catch (error) {
    console.error('Payment IPN Error:', error.message);
    res.status(500).send('IPN processing failed');
  }
};

// @desc    Mock Sandbox payment gateway HTML page
// @route   GET /api/payments/mock-gateway
// @access  Public
export const getMockGateway = (req, res) => {
  const { tranId, amount } = req.query;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ApexCommerz Payment Sandbox Gateway</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        :root {
          --bg-primary: #0b0f19;
          --bg-card: rgba(17, 24, 39, 0.85);
          --accent-primary: #6366f1;
          --accent-gradient: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #14b8a6 100%);
          --text-primary: #f3f4f6;
          --text-secondary: #9ca3af;
          --border-color: rgba(255, 255, 255, 0.08);
          --success: #10b981;
          --error: #f43f5e;
          --warning: #f59e0b;
        }

        body {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          overflow-y: auto;
          position: relative;
          padding: 20px 0;
        }

        /* Decorative blur grids */
        body::before {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: var(--accent-gradient);
          filter: blur(120px);
          opacity: 0.15;
          top: 10%;
          left: 10%;
          z-index: 1;
          pointer-events: none;
        }

        body::after {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: var(--accent-gradient);
          filter: blur(120px);
          opacity: 0.15;
          bottom: 10%;
          right: 10%;
          z-index: 1;
          pointer-events: none;
        }

        .gateway-card {
          background-color: var(--bg-card);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.1);
          padding: 40px;
          max-width: 480px;
          width: 100%;
          text-align: center;
          position: relative;
          z-index: 5;
        }

        .ssl-logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-bottom: 12px;
        }

        .ssl-logo-icon {
          background-color: var(--accent-primary);
          color: white;
          font-weight: 900;
          font-size: 14px;
          padding: 4px 8px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s;
        }

        .ssl-logo-text {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: var(--text-primary);
        }

        .header {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 6px;
          background: linear-gradient(to right, #ffffff, #f1f5f9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          color: var(--text-secondary);
          font-size: 13px;
          margin-bottom: 28px;
        }

        .meta-box {
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 18px;
          text-align: left;
          margin-bottom: 24px;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 13px;
        }

        .meta-row:last-child {
          margin-bottom: 0;
          border-top: 1px dashed var(--border-color);
          padding-top: 10px;
        }

        .meta-label {
          color: var(--text-secondary);
        }

        .meta-val {
          font-weight: 600;
          color: var(--text-primary);
        }

        .amount-val {
          color: #14b8a6;
          font-weight: 700;
          font-size: 16px;
        }

        /* Method select visual display grid */
        .payment-methods {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 24px;
        }

        .method-icon {
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 12px 6px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s ease;
          outline: none;
        }

        .method-icon:hover {
          border-color: var(--text-secondary);
          color: var(--text-primary);
        }

        .method-active {
          border-color: var(--accent-primary) !important;
          color: var(--text-primary) !important;
          background-color: rgba(255, 255, 255, 0.05) !important;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.1);
        }

        /* Interactive inputs styling */
        .input-container {
          background-color: rgba(255, 255, 255, 0.01);
          border: 1px dashed var(--border-color);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          transition: border-color 0.3s;
        }

        .input-group {
          text-align: left;
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group:last-child {
          margin-bottom: 0;
        }

        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .input-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 12px;
          font-size: 14px;
          color: var(--text-primary);
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
        }

        .form-input:focus {
          border-color: var(--accent-primary);
          background-color: rgba(255, 255, 255, 0.04);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
        }

        .btn-otp-gen {
          background-color: transparent;
          border: 1px solid var(--accent-primary);
          color: var(--accent-primary);
          border-radius: 8px;
          padding: 12px;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .btn-otp-gen:hover {
          background-color: var(--accent-primary);
          color: white;
        }

        .sms-toast {
          background-color: rgba(255, 255, 255, 0.03);
          border-left: 4px solid var(--accent-primary);
          border-radius: 0 8px 8px 0;
          padding: 12px;
          margin-bottom: 20px;
          text-align: left;
          font-size: 13px;
          display: none;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .button-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn {
          border: none;
          border-radius: 8px;
          padding: 14px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          font-family: inherit;
        }

        .btn-success {
          background-color: var(--success);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        }

        .btn-success:hover {
          background-color: #059669;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
        }

        .btn-fail {
          background-color: var(--error);
          color: white;
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.25);
        }

        .btn-fail:hover {
          background-color: #dc2626;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(244, 63, 94, 0.35);
        }

        .btn-cancel {
          background-color: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
        }

        .btn-cancel:hover {
          background-color: var(--border-color);
          color: var(--text-primary);
        }

        .security-footer {
          margin-top: 28px;
          font-size: 11px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          opacity: 0.6;
        }

        /* Processing Loader Overlay */
        .loader-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(11, 15, 25, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loader-content {
          text-align: center;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top: 4px solid var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
          transition: border-top-color 0.3s;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loader-title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .loader-subtitle {
          color: var(--text-secondary);
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="gateway-card">
        
        <div class="ssl-logo-container">
          <div class="ssl-logo-icon">APEX</div>
          <div class="ssl-logo-text">Commerz</div>
        </div>

        <div class="header">Payment Sandbox</div>
        <div class="subtitle">Secure multi-channel merchant gateway simulator</div>
        
        <div class="meta-box">
          <div class="meta-row">
            <span class="meta-label">Transaction ID:</span>
            <span class="meta-val">${tranId}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Store Username:</span>
            <span class="meta-val">Apex_Store_Sandbox</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Amount Payable:</span>
            <span class="meta-val amount-val">$${parseFloat(amount || 0).toFixed(2)} BDT</span>
          </div>
        </div>

        <div class="payment-methods">
          <button type="button" class="method-icon method-active" data-method="Card">Card</button>
          <button type="button" class="method-icon" data-method="bKash">bKash</button>
          <button type="button" class="method-icon" data-method="Nagad">Nagad</button>
          <button type="button" class="method-icon" data-method="Rocket">Rocket</button>
        </div>

        <div class="sms-toast" id="sms-toast">
          <span id="sms-toast-text"></span>
        </div>

        <div class="button-group">
          <form action="/api/payments/success?tranId=${tranId}" method="POST" id="successForm">
            <input type="hidden" name="val_id" value="mock_val_${Date.now()}" />
            <input type="hidden" name="card_type" id="cardTypeInput" value="Mock Visa/Mastercard" />
            
            <div class="input-container">
              <!-- Card details group -->
              <div id="card-fields">
                <div class="input-group">
                  <label class="input-label">Card Number</label>
                  <input type="text" id="cardNumber" placeholder="4242 4242 4242 4242" class="form-input" required maxlength="19" pattern="\\d{4} \\d{4} \\d{4} \\d{4}" title="16-digit card number (e.g. 4242 4242 4242 4242)" autocomplete="off" />
                </div>
                <div class="input-row">
                  <div class="input-group">
                    <label class="input-label">Expiry Date</label>
                    <input type="text" id="cardExpiry" placeholder="MM/YY" class="form-input" required maxlength="5" pattern="(0[1-9]|1[0-2])\\/\\d{2}" title="Expiry date in MM/YY format" autocomplete="off" />
                  </div>
                  <div class="input-group">
                    <label class="input-label">CVV / CVC</label>
                    <input type="password" id="cardCvv" placeholder="123" class="form-input" required maxlength="4" pattern="\\d{3,4}" title="3 or 4-digit card security code (CVC/CVV)" autocomplete="off" />
                  </div>
                </div>
                <div class="input-group">
                  <label class="input-label">Card Holder Name</label>
                  <input type="text" id="cardName" placeholder="JOHN DOE" class="form-input" required style="text-transform: uppercase;" autocomplete="off" />
                </div>
              </div>

              <!-- Mobile wallet details group -->
              <div id="wallet-fields" style="display: none;">
                <div class="input-group">
                  <label class="input-label" id="walletNumberLabel">bKash Account Number</label>
                  <input type="tel" id="walletNumber" placeholder="017XXXXXXXX" class="form-input" maxlength="11" pattern="01[3-9]\\d{8}" title="11-digit mobile number starting with 01 (e.g. 017XXXXXXXX)" autocomplete="off" />
                </div>
                <div class="input-row" style="margin-bottom: 0;">
                  <div class="input-group">
                    <label class="input-label" id="walletCodeLabel">4-Digit PIN</label>
                    <input type="password" id="walletCode" placeholder="••••" class="form-input" maxlength="6" pattern="\\d{4,6}" title="4 to 6-digit account PIN code" autocomplete="off" />
                  </div>
                  <div class="input-group">
                    <label class="input-label" style="visibility: hidden;">Spacer</label>
                    <button type="button" class="btn-otp-gen" onclick="generateMockOTP()">Send OTP SMS</button>
                  </div>
                </div>
                <div id="otpInputContainer" style="display: none; margin-top: 16px;">
                  <div class="input-group">
                    <label class="input-label">6-Digit OTP Received</label>
                    <input type="text" id="walletOtp" placeholder="123456" class="form-input" maxlength="6" pattern="\\d{6}" title="6-digit SMS verification code" autocomplete="off" />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" class="btn btn-success" id="payButton" style="margin-bottom: 12px;">Verify & Pay with Card</button>
          </form>

          <form action="/api/payments/fail?tranId=${tranId}" method="POST">
            <button type="submit" class="btn btn-fail" style="margin-bottom: 12px;">Simulate Payment Failure</button>
          </form>

          <form action="/api/payments/cancel?tranId=${tranId}" method="POST">
            <button type="submit" class="btn btn-cancel">Cancel Order Checkout</button>
          </form>
        </div>

        <div class="security-footer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <span>PCI-DSS Compliant • 256-bit SSL Encryption</span>
        </div>
      </div>

      <!-- Processing Loader Overlay -->
      <div id="loader-overlay" class="loader-overlay" style="display: none;">
        <div class="loader-content">
          <div class="spinner"></div>
          <div class="loader-title">Processing Payment</div>
          <div class="loader-subtitle" id="loader-subtitle">Connecting to secure gateway...</div>
        </div>
      </div>

      <script>
        const brandThemes = {
          Card: {
            color: '#6366f1',
            labelNumber: 'Card Number',
            labelCode: 'CVC / CVV',
            bgGlow: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #14b8a6 100%)'
          },
          bKash: {
            color: '#e2136e',
            labelNumber: 'bKash Mobile Number',
            labelCode: 'bKash Account PIN',
            bgGlow: 'linear-gradient(135deg, #e2136e 0%, #f13c95 50%, #8c3494 100%)'
          },
          Nagad: {
            color: '#f85c2c',
            labelNumber: 'Nagad Mobile Number',
            labelCode: 'Nagad Account PIN',
            bgGlow: 'linear-gradient(135deg, #f85c2c 0%, #fa8231 50%, #f39c12 100%)'
          },
          Rocket: {
            color: '#8c3494',
            labelNumber: 'Rocket Mobile Number',
            labelCode: 'Rocket Account PIN',
            bgGlow: 'linear-gradient(135deg, #8c3494 0%, #a55eea 50%, #6366f1 100%)'
          }
        };

        const methods = document.querySelectorAll('.method-icon');
        const cardTypeInput = document.getElementById('cardTypeInput');
        const payButton = document.getElementById('payButton');
        const cardFields = document.getElementById('card-fields');
        const walletFields = document.getElementById('wallet-fields');
        const walletNumberLabel = document.getElementById('walletNumberLabel');
        const walletCodeLabel = document.getElementById('walletCodeLabel');

        function setRequired(fieldsContainer, isRequired) {
          const inputs = fieldsContainer.querySelectorAll('input');
          inputs.forEach(input => {
            if (isRequired) {
              input.setAttribute('required', 'required');
            } else {
              input.removeAttribute('required');
            }
          });
        }

        // Initialize Card as active/required, Wallet as inactive
        setRequired(cardFields, true);
        setRequired(walletFields, false);

        methods.forEach(btn => {
          btn.addEventListener('click', () => {
            methods.forEach(m => m.classList.remove('method-active'));
            btn.classList.add('method-active');

            const method = btn.getAttribute('data-method');
            const theme = brandThemes[method];

            // Apply brand theme colors
            document.documentElement.style.setProperty('--accent-primary', theme.color);
            document.documentElement.style.setProperty('--accent-gradient', theme.bgGlow);

            // Update form input properties
            if (method === 'Card') {
              cardTypeInput.value = 'Mock Visa/Mastercard';
              payButton.textContent = 'Verify & Pay with Card';
              cardFields.style.display = 'block';
              walletFields.style.display = 'none';
              setRequired(cardFields, true);
              setRequired(walletFields, false);
            } else {
              cardTypeInput.value = method + ' Mobile Wallet';
              payButton.textContent = 'Verify & Pay with ' + method;
              cardFields.style.display = 'none';
              walletFields.style.display = 'block';
              walletNumberLabel.textContent = theme.labelNumber;
              walletCodeLabel.textContent = theme.labelCode;
              setRequired(cardFields, false);
              setRequired(walletFields, true);
              
              // Reset OTP inputs
              document.getElementById('otpInputContainer').style.display = 'none';
              document.getElementById('walletOtp').removeAttribute('required');
              document.getElementById('sms-toast').style.display = 'none';
            }
          });
        });

        // Input formatting for Card Number (adds space every 4 digits)
        const cardNumberInput = document.getElementById('cardNumber');
        cardNumberInput.addEventListener('input', (e) => {
          let value = e.target.value.replace(/\\s+/g, '').replace(/[^0-9]/gi, '');
          let formatted = '';
          for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
              formatted += ' ';
            }
            formatted += value[i];
          }
          e.target.value = formatted;
        });

        // Input formatting for Expiry Date (MM/YY)
        const cardExpiryInput = document.getElementById('cardExpiry');
        cardExpiryInput.addEventListener('input', (e) => {
          let value = e.target.value.replace(/[^0-9]/g, '');
          if (value.length > 2) {
            e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
          } else {
            e.target.value = value;
          }
        });

        // Numeric only inputs
        document.getElementById('cardCvv').addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
        document.getElementById('walletNumber').addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
        document.getElementById('walletCode').addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
        document.getElementById('walletOtp').addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });

        // OTP Generator Function for Mobile Wallets
        window.generateMockOTP = function() {
          const phone = document.getElementById('walletNumber').value;
          if (!phone || phone.length < 11) {
            alert('Please enter a valid 11-digit mobile number first.');
            return;
          }
          const otp = Math.floor(100000 + Math.random() * 900000);
          const toast = document.getElementById('sms-toast');
          const toastText = document.getElementById('sms-toast-text');
          const method = document.querySelector('.method-icon.method-active').getAttribute('data-method');
          
          toastText.innerHTML = '<strong>Mock SMS:</strong> Your ' + method + ' verification OTP is <b style="color: var(--accent-primary); font-size:16px;">' + otp + '</b>';
          toast.style.display = 'block';
          
          // Show OTP field and make it required
          document.getElementById('otpInputContainer').style.display = 'block';
          const otpInput = document.getElementById('walletOtp');
          otpInput.setAttribute('required', 'required');
          otpInput.value = otp;
        };

        // Intercept form submit to show beautiful loading overlay
        const successForm = document.getElementById('successForm');
        successForm.addEventListener('submit', (e) => {
          e.preventDefault();
          
          const loader = document.getElementById('loader-overlay');
          const loaderSubtitle = document.getElementById('loader-subtitle');
          loader.style.display = 'flex';
          
          setTimeout(() => {
            loaderSubtitle.textContent = 'Verifying credentials with APEX gateway...';
          }, 400);
          
          setTimeout(() => {
            loaderSubtitle.textContent = 'Securing connection & completing transaction...';
          }, 900);
          
          setTimeout(() => {
            successForm.submit();
          }, 1400);
        });
      </script>
    </body>
    </html>
  `;
  res.send(html);
};
