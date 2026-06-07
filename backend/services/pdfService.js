import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateInvoicePDF = (order, invoiceNumber) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const dirPath = path.join(process.cwd(), 'uploads', 'invoices');
      
      // Ensure directory exists
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const filePath = path.join(dirPath, `invoice-${invoiceNumber}.pdf`);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header Banner
      doc
        .fillColor('#4F46E5')
        .rect(0, 0, 595.28, 100)
        .fill();

      doc
        .fillColor('#FFFFFF')
        .fontSize(24)
        .text('APEX E-COMMERCE', 50, 35, { align: 'left' });

      doc
        .fontSize(12)
        .text('INVOICE', 50, 45, { align: 'right' });

      // Invoice info & Meta
      doc
        .fillColor('#1F2937')
        .fontSize(10)
        .text(`Invoice Number: ${invoiceNumber}`, 50, 120)
        .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 135)
        .text(`Payment Status: ${order.paymentStatus}`, 50, 150)
        .text(`Payment Method: ${order.paymentMethod}`, 50, 165);

      // Customer info
      doc
        .fontSize(12)
        .text('Bill To:', 320, 120, { underline: true })
        .fontSize(10)
        .text(order.shippingAddress.name || '', 320, 135)
        .text(order.shippingAddress.phone || '', 320, 150)
        .text(`${order.shippingAddress.addressLine || ''}, ${order.shippingAddress.city || ''}`, 320, 165)
        .text(`Postal Code: ${order.shippingAddress.postalCode || ''}`, 320, 180);

      // Draw horizontal line
      doc
        .strokeColor('#E5E7EB')
        .lineWidth(1)
        .moveTo(50, 210)
        .lineTo(545, 210)
        .stroke();

      // Table Header
      let y = 230;
      doc
        .fontSize(10)
        .fillColor('#4F46E5')
        .text('Product Name', 50, y, { width: 200 })
        .text('Unit Price', 260, y, { width: 80, align: 'right' })
        .text('Qty', 350, y, { width: 50, align: 'right' })
        .text('Discount', 410, y, { width: 60, align: 'right' })
        .text('Total', 480, y, { width: 65, align: 'right' });

      // Reset text color
      doc.fillColor('#1F2937');

      // Table Row Loop
      order.items.forEach((item) => {
        y += 25;
        // Truncate name if it's too long
        const nameText = item.name.length > 35 ? item.name.substring(0, 32) + '...' : item.name;
        const total = (item.price - item.discount) * item.quantity;

        doc
          .text(nameText, 50, y, { width: 200 })
          .text(`$${item.price.toFixed(2)}`, 260, y, { width: 80, align: 'right' })
          .text(item.quantity.toString(), 350, y, { width: 50, align: 'right' })
          .text(`$${(item.discount * item.quantity).toFixed(2)}`, 410, y, { width: 60, align: 'right' })
          .text(`$${total.toFixed(2)}`, 480, y, { width: 65, align: 'right' });
      });

      // Draw another horizontal line
      y += 35;
      doc
        .strokeColor('#E5E7EB')
        .moveTo(50, y)
        .lineTo(545, y)
        .stroke();

      // Total Calculations
      y += 15;
      doc
        .text('Subtotal:', 350, y, { width: 100, align: 'right' })
        .text(`$${order.subtotal.toFixed(2)}`, 450, y, { width: 95, align: 'right' });

      if (order.discountAmount > 0) {
        y += 15;
        doc
          .text('Product Discounts:', 350, y, { width: 100, align: 'right' })
          .text(`-$${order.discountAmount.toFixed(2)}`, 450, y, { width: 95, align: 'right' });
      }

      if (order.couponDiscountAmount > 0) {
        y += 15;
        doc
          .text(`Coupon (${order.couponCode}):`, 350, y, { width: 100, align: 'right' })
          .text(`-$${order.couponDiscountAmount.toFixed(2)}`, 450, y, { width: 95, align: 'right' });
      }

      if (order.taxAmount > 0) {
        y += 15;
        doc
          .text('Tax (15%):', 350, y, { width: 100, align: 'right' })
          .text(`$${order.taxAmount.toFixed(2)}`, 450, y, { width: 95, align: 'right' });
      }

      if (order.shippingCost > 0) {
        y += 15;
        doc
          .text('Shipping:', 350, y, { width: 100, align: 'right' })
          .text(`$${order.shippingCost.toFixed(2)}`, 450, y, { width: 95, align: 'right' });
      }

      y += 20;
      doc
        .fontSize(12)
        .fillColor('#4F46E5')
        .text('Grand Total:', 350, y, { width: 100, align: 'right' })
        .text(`$${order.grandTotal.toFixed(2)}`, 450, y, { width: 95, align: 'right' });

      // Footer
      doc
        .fillColor('#9CA3AF')
        .fontSize(9)
        .text('Thank you for your business!', 50, 750, { align: 'center' })
        .text('If you have any questions, please contact support@apex-ecommerce.com', 50, 765, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        // Return file relative path or full path
        resolve(filePath);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};
