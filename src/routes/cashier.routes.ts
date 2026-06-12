// ─── Cashier Routes ───────────────────────────────────────────────────────────
// All routes here require a valid JWT token with the CASHIER role.
// Cashiers handle the payment stage: they see orders that are ready/delivered,
// generate receipts (which marks the order as PAID), and print PDF receipts.

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import PDFDocument from 'pdfkit'; // Library for generating PDF files

const router = Router();
const prisma = new PrismaClient();

// Tax rate applied to all orders (10% = 0.1)
const TAX_RATE = 0.1;

// Apply authentication and CASHIER role check to all routes in this file
router.use(authenticate, authorize('CASHIER'));

// ── GET /api/cashier/orders ───────────────────────────────────────────────────
// Returns orders that are ready for payment at the cashier's branch.
// Only shows READY (food cooked, waiting to be served) and DELIVERED (served, waiting to pay).
// These are the only statuses where the cashier should take action.
router.get('/orders', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number;
  try {
    const orders = await prisma.order.findMany({
      where: { branchId, status: { in: ['READY', 'DELIVERED'] } }, // Only payable orders
      include: { table: true, orderItems: { include: { menuItem: true } } },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── POST /api/cashier/receipt/:orderId ────────────────────────────────────────
// Creates a receipt for an order and marks it as PAID.
// This is the "process payment" action — once called, the order is complete.
// Calculates: subtotal → adds 10% tax → grandTotal
// Also updates the order's totalPrice to the final amount (including tax).
router.post('/receipt/:orderId', async (req: Request, res: Response): Promise<void> => {
  const orderId = parseInt(req.params.orderId); // Order ID from URL
  try {
    // Fetch the order with all its items and branch info
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { menuItem: true } }, table: true, branch: true },
    });
    if (!order) { res.status(404).json({ message: 'Order not found' }); return; }

    // Calculate totals
    const total      = order.orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0); // Subtotal
    const tax        = parseFloat((total * TAX_RATE).toFixed(2));                          // 10% tax
    const grandTotal = parseFloat((total + tax).toFixed(2));                               // Final total

    // Create the receipt record in the database
    const receipt = await prisma.receipt.create({ data: { orderId, total, tax, grandTotal } });

    // Mark the order as PAID and save the final price
    await prisma.order.update({ where: { id: orderId }, data: { status: 'PAID', totalPrice: grandTotal } });

    res.json({ receipt, order });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── GET /api/cashier/receipt/:orderId/pdf ─────────────────────────────────────
// Generates and streams a styled PDF receipt for a given order.
// This endpoint returns a binary PDF file (not JSON), so it must be opened in a browser,
// not called from a fetch/axios request. Token is passed as ?token= in the URL.
//
// The PDF includes:
//  - Branded header with restaurant name, branch name, address
//  - Receipt metadata: receipt number, date, table, order number
//  - Itemised order table with quantities, unit prices, and line totals
//  - Subtotal, tax, and grand total
//  - "Payment received" confirmation badge and footer
router.get('/receipt/:orderId/pdf', async (req: Request, res: Response): Promise<void> => {
  const orderId = parseInt(req.params.orderId);
  try {
    // Fetch the receipt with full order details
    const receipt = await prisma.receipt.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            orderItems: { include: { menuItem: true } },
            table:      true,
            branch:     true,
          },
        },
      },
    });
    if (!receipt) { res.status(404).json({ message: 'Receipt not found' }); return; }

    // Create a new PDF document (A4 size, 50pt margins)
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers so the browser knows it's a PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=receipt-${orderId}.pdf`);

    // Stream the PDF directly to the HTTP response (no temp file needed)
    doc.pipe(res);

    // ── Design colours ──────────────────────────────────────────────────────
    const gold   = '#B8860B'; // Gold accent colour (brand colour)
    const dark   = '#1a0a00'; // Near-black for headings and important text
    const grey   = '#555555'; // Grey for labels
    const pageW  = doc.page.width;
    const margin = 50;
    const colW   = pageW - margin * 2; // Usable width between margins

    // ── Dark header bar across the top ──────────────────────────────────────
    doc.rect(0, 0, pageW, 130).fill(dark);

    // Restaurant name in gold
    doc.fillColor(gold).fontSize(28).font('Helvetica-Bold')
      .text('🍽  STREAKZ RESTAURANT', margin, 28, { align: 'center', width: colW });

    // Branch name in white, address in light grey
    doc.fillColor('#ffffff').fontSize(13).font('Helvetica')
      .text(receipt.order.branch.name, margin, 65, { align: 'center', width: colW });
    doc.fillColor('#cccccc').fontSize(10)
      .text(receipt.order.branch.address, margin, 83, { align: 'center', width: colW });

    // Gold divider line below the header
    doc.moveTo(margin, 115).lineTo(pageW - margin, 115).strokeColor(gold).lineWidth(1.5).stroke();

    // ── Receipt metadata (receipt number, date, table, order) ───────────────
    let y = 145; // Vertical cursor position — incremented as we add content
    doc.fillColor(dark).fontSize(11).font('Helvetica');

    const metaLeft  = margin;
    const metaRight = pageW / 2 + 10;

    // Left side: Receipt No. | Right side: Date
    doc.fillColor(grey).text('Receipt No.', metaLeft, y);
    doc.fillColor(dark).font('Helvetica-Bold').text(`#${receipt.id}`, metaLeft + 90, y);
    doc.fillColor(grey).font('Helvetica').text('Date', metaRight, y);
    doc.fillColor(dark).font('Helvetica-Bold')
      .text(new Date(receipt.issuedAt).toLocaleString('en-GB'), metaRight + 40, y);

    y += 20;

    // Left side: Table number | Right side: Order number
    doc.fillColor(grey).font('Helvetica').text('Table', metaLeft, y);
    doc.fillColor(dark).font('Helvetica-Bold')
      .text(`Table ${receipt.order.table.number}`, metaLeft + 90, y);
    doc.fillColor(grey).font('Helvetica').text('Order', metaRight, y);
    doc.fillColor(dark).font('Helvetica-Bold')
      .text(`#${receipt.order.id}`, metaRight + 40, y);

    y += 30;

    // ── "ORDER DETAILS" section header (gold bar) ────────────────────────────
    doc.rect(margin, y, colW, 24).fill(gold);
    doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold')
      .text('ORDER DETAILS', margin + 10, y + 6, { width: colW - 20 });
    y += 32;

    // ── Column headers for the items table ──────────────────────────────────
    doc.fillColor(grey).fontSize(10).font('Helvetica-Bold');
    doc.text('ITEM',  margin,       y);
    doc.text('QTY',   margin + 290, y);
    doc.text('UNIT',  margin + 340, y);
    doc.text('TOTAL', margin + 400, y);
    y += 14;

    // Thin grey line under column headers
    doc.moveTo(margin, y).lineTo(pageW - margin, y).strokeColor('#cccccc').lineWidth(0.5).stroke();
    y += 8;

    // ── Order items — alternating row background (zebra striping) ───────────
    receipt.order.orderItems.forEach((item, idx) => {
      const rowBg = idx % 2 === 0 ? '#fafafa' : '#ffffff'; // Alternate light grey / white
      doc.rect(margin, y - 3, colW, 20).fill(rowBg);

      // Item name (truncated with ellipsis if too long)
      doc.fillColor(dark).fontSize(10).font('Helvetica')
        .text(item.menuItem.name, margin + 4, y, { width: 270, ellipsis: true });

      // Quantity and unit price
      doc.text(String(item.quantity),             margin + 294, y);
      doc.text(`£${item.price.toFixed(2)}`,       margin + 336, y);

      // Line total in gold bold
      doc.fillColor(gold).font('Helvetica-Bold')
        .text(`£${(item.price * item.quantity).toFixed(2)}`, margin + 396, y);

      y += 20;
    });

    y += 6;
    // Gold line above totals section
    doc.moveTo(margin, y).lineTo(pageW - margin, y).strokeColor(gold).lineWidth(1).stroke();
    y += 14;

    // ── Totals block (subtotal, tax, grand total) ────────────────────────────
    const totalX = pageW - margin - 160; // Right-align totals block

    // Subtotal row
    doc.fillColor(grey).fontSize(11).font('Helvetica');
    doc.text('Subtotal:', totalX, y);
    doc.fillColor(dark).text(`£${receipt.total.toFixed(2)}`, totalX + 100, y, { align: 'right', width: 60 });
    y += 18;

    // Tax row
    doc.fillColor(grey).font('Helvetica').text('Tax (10%):', totalX, y);
    doc.fillColor(dark).text(`£${receipt.tax.toFixed(2)}`, totalX + 100, y, { align: 'right', width: 60 });
    y += 10;

    // Gold line above grand total
    doc.moveTo(totalX, y).lineTo(pageW - margin, y).strokeColor(gold).lineWidth(1).stroke();
    y += 10;

    // Grand total in large gold text
    doc.fillColor(dark).fontSize(14).font('Helvetica-Bold').text('TOTAL:', totalX, y);
    doc.fillColor(gold).fontSize(16).text(`£${receipt.grandTotal.toFixed(2)}`, totalX + 100, y, { align: 'right', width: 60 });
    y += 40;

    // ── Payment confirmation badge ───────────────────────────────────────────
    doc.rect(margin, y, colW, 28).fill('#e8f5e9'); // Light green background
    doc.fillColor('#2e7d32').fontSize(11).font('Helvetica-Bold')
      .text('✔  PAYMENT RECEIVED — Thank you!', margin, y + 8, { align: 'center', width: colW });
    y += 46;

    // ── Footer ───────────────────────────────────────────────────────────────
    doc.moveTo(margin, y).lineTo(pageW - margin, y).strokeColor('#dddddd').lineWidth(0.5).stroke();
    y += 12;
    doc.fillColor(grey).fontSize(9).font('Helvetica')
      .text('We hope you enjoyed your meal. Visit us again soon!', margin, y, { align: 'center', width: colW });
    y += 14;
    doc.fillColor(gold).fontSize(9)
      .text('hello@streakz.co.uk  |  www.streakz.co.uk', margin, y, { align: 'center', width: colW });
    y += 14;
    doc.fillColor('#aaaaaa').fontSize(8)
      .text('© 2026 STREAKZ RESTAURANT Ltd. All rights reserved.', margin, y, { align: 'center', width: colW });

    // Finalise and send the PDF
    doc.end();
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;
