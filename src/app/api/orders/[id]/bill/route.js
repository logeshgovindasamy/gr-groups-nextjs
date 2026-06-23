/**
 * Order Bill/Invoice Download API Route
 * Migrated from: Java OrderController.getOrderBill() + PdfInvoiceService.java
 * GET /api/orders/[id]/bill - Download PDF invoice
 *
 * Note: Uses pdfkit for server-side PDF generation
 */

import { getOrderById } from '@/services/order.service';
import { apiError } from '@/utils/helpers';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return apiError('Order not found', 404);
    }

    // Dynamic import of pdfkit to avoid build issues
    const PDFDocument = (await import('pdfkit')).default;

    // Generate PDF in memory
    const chunks = [];
    const doc = new PDFDocument({ margin: 50 });

    // Collect PDF data into buffer
    await new Promise((resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', resolve);
      doc.on('error', reject);

      // Top accent bar
      doc.rect(0, 0, 612, 15).fillColor('#1e293b').fill();

      // Header logo & branding
      doc.fillColor('#1e293b')
         .fontSize(22)
         .font('Helvetica-Bold')
         .text('GR GROUPS', 50, 45);

      doc.fillColor('#64748b')
         .fontSize(9)
         .font('Helvetica')
         .text('Premium Headless Storefront', 50, 70);

      // Invoice header title (right-aligned)
      doc.fillColor('#1e293b')
         .fontSize(26)
         .font('Helvetica-Bold')
         .text('INVOICE', 400, 45, { align: 'right', width: 162 });

      // Horizontal divider line
      doc.moveTo(50, 92).lineTo(562, 92).strokeColor('#cbd5e1').lineWidth(1).stroke();

      let y = 110;

      // Column 1: Billed To
      doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold').text('BILLED TO:', 50, y);
      doc.fillColor('#334155').font('Helvetica').fontSize(9.5);
      
      const email = order.userId || 'Guest Customer';
      doc.text(`Email: ${email}`, 50, y + 16);
      
      if (order.shippingAddress) {
        doc.text(order.shippingAddress.address || '', 50, y + 28);
        doc.text(`${order.shippingAddress.city || ''}, ${order.shippingAddress.postalCode || ''}`, 50, y + 40);
        doc.text(order.shippingAddress.country || '', 50, y + 52);
      }

      // Column 2: Invoice Details
      doc.fillColor('#1e293b').font('Helvetica-Bold').text('INVOICE DETAILS:', 350, y);
      doc.fillColor('#334155').font('Helvetica');
      doc.text(`Invoice Number: #${order.id}`, 350, y + 16);

      let dateString = '';
      if (order.createdAt) {
        try {
          dateString = new Date(order.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        } catch (_) {
          dateString = order.createdAt;
        }
      }
      doc.text(`Date: ${dateString}`, 350, y + 28);
      doc.text(`Payment: ${order.paymentMethod || 'Credit Card'}`, 350, y + 40);

      // Divider line
      doc.moveTo(50, 185).lineTo(562, 185).strokeColor('#cbd5e1').stroke();

      // Table Header Row
      y = 198;
      doc.fillColor('#475569').fontSize(9.5).font('Helvetica-Bold');
      doc.text('ITEM DESCRIPTION', 50, y);
      doc.text('PRICE', 320, y, { width: 60, align: 'right' });
      doc.text('QTY', 400, y, { width: 40, align: 'center' });
      doc.text('TOTAL', 480, y, { width: 82, align: 'right' });

      // Table Header Divider
      doc.moveTo(50, 212).lineTo(562, 212).strokeColor('#cbd5e1').lineWidth(1.5).stroke();

      // Table Rows
      y = 222;
      doc.font('Helvetica').fontSize(9.5).fillColor('#334155');

      if (order.orderItems && order.orderItems.length > 0) {
        order.orderItems.forEach((item) => {
          doc.text(item.name || 'Product', 50, y, { width: 250 });
          doc.text(`$${Number(item.price || 0).toFixed(2)}`, 320, y, { width: 60, align: 'right' });
          doc.text(String(item.qty || 1), 400, y, { width: 40, align: 'center' });
          doc.text(`$${(Number(item.price || 0) * Number(item.qty || 1)).toFixed(2)}`, 480, y, { width: 82, align: 'right' });
          
          y += 24;
          // Thin divider line between items
          doc.moveTo(50, y - 6).lineTo(562, y - 6).strokeColor('#f1f5f9').lineWidth(1).stroke();
        });
      }

      // Summary / Totals section
      y += 10;
      
      const drawTotalRow = (label, amount, isBold = false) => {
        doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica')
           .fillColor(isBold ? '#1e293b' : '#475569')
           .fontSize(isBold ? 10.5 : 9.5);
        
        doc.text(label, 320, y, { width: 140, align: 'right' });
        doc.text(amount, 480, y, { width: 82, align: 'right' });
        y += 16;
      };

      const subtotalVal = (order.orderItems || []).reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.qty || 1)), 0);
      drawTotalRow('Subtotal:', `$${subtotalVal.toFixed(2)}`);
      drawTotalRow('Shipping:', `$${Number(order.shippingPrice || 0).toFixed(2)}`);
      drawTotalRow('Tax:', `$${Number(order.taxPrice || 0).toFixed(2)}`);

      // Applied Coupon/Discount
      const discount = Number(order.discountPrice || 0);
      if (discount > 0) {
        const couponLabel = order.appliedCoupons?.[0] ? `Discount (${order.appliedCoupons[0].toUpperCase()}):` : 'Discount:';
        drawTotalRow(couponLabel, `-$${discount.toFixed(2)}`);
      }

      y += 2;
      doc.moveTo(350, y - 4).lineTo(562, y - 4).strokeColor('#cbd5e1').lineWidth(1).stroke();
      y += 4;
      drawTotalRow('Total Due:', `$${Number(order.totalPrice || 0).toFixed(2)}`, true);

      // Thank you footer
      doc.moveTo(50, 715).lineTo(562, 715).strokeColor('#cbd5e1').lineWidth(0.75).stroke();
      doc.fillColor('#64748b')
         .fontSize(8.5)
         .font('Helvetica-Oblique')
         .text('Thank you for your purchase!', 50, 728, { align: 'center', width: 512 });
      doc.text('For queries regarding this invoice, please contact support@grgroups.com', 50, 742, { align: 'center', width: 512 });

      doc.end();
    });

    const pdfBuffer = Buffer.concat(chunks);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice_${order.id}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error('[Order Bill]', error);
    return apiError('Failed to generate invoice', 500);
  }
}
