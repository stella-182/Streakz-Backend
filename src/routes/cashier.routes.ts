import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import PDFDocument from 'pdfkit';

const router = Router();
const prisma = new PrismaClient();
const TAX_RATE = 0.1;

router.use(authenticate, authorize('CASHIER'));

// GET /api/cashier/orders
router.get('/orders', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number;
  try {
    const orders = await prisma.order.findMany({
      where: { branchId, status: { in: ['READY', 'DELIVERED'] } },
      include: { table: true, orderItems: { include: { menuItem: true } } },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// POST /api/cashier/receipt/:orderId
router.post('/receipt/:orderId', async (req: Request, res: Response): Promise<void> => {
  const orderId = parseInt(req.params.orderId);
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { menuItem: true } }, table: true, branch: true },
    });
    if (!order) { res.status(404).json({ message: 'Order not found' }); return; }

    const total = order.orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = parseFloat((total * TAX_RATE).toFixed(2));
    const grandTotal = parseFloat((total + tax).toFixed(2));

    const receipt = await prisma.receipt.create({ data: { orderId, total, tax, grandTotal } });
    await prisma.order.update({ where: { id: orderId }, data: { status: 'PAID', totalPrice: grandTotal } });

    res.json({ receipt, order });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/cashier/receipt/:orderId/pdf
router.get('/receipt/:orderId/pdf', async (req: Request, res: Response): Promise<void> => {
  const orderId = parseInt(req.params.orderId);
  try {
    const receipt = await prisma.receipt.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            orderItems: { include: { menuItem: true } },
            table: true,
            branch: true,
          },
        },
      },
    });
    if (!receipt) { res.status(404).json({ message: 'Receipt not found' }); return; }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=receipt-${orderId}.pdf`);
    doc.pipe(res);

    const gold   = '#B8860B';
    const dark   = '#1a0a00';
    const grey   = '#555555';
    const pageW  = doc.page.width;
    const margin = 50;
    const colW   = pageW - margin * 2;

    // ── Header background bar ──────────────────────────────────────────────
    doc.rect(0, 0, pageW, 130).fill(dark);

    // Brand name
    doc.fillColor(gold).fontSize(28).font('Helvetica-Bold')
      .text('🍽  STREAKZ RESTAURANT', margin, 28, { align: 'center', width: colW });

    // Branch name & address
    doc.fillColor('#ffffff').fontSize(13).font('Helvetica')
      .text(receipt.order.branch.name, margin, 65, { align: 'center', width: colW });
    doc.fillColor('#cccccc').fontSize(10)
      .text(receipt.order.branch.address, margin, 83, { align: 'center', width: colW });

    // Gold divider line
    doc.moveTo(margin, 115).lineTo(pageW - margin, 115).strokeColor(gold).lineWidth(1.5).stroke();

    // ── Receipt meta ───────────────────────────────────────────────────────
    let y = 145;
    doc.fillColor(dark).fontSize(11).font('Helvetica');

    const metaLeft  = margin;
    const metaRight = pageW / 2 + 10;

    doc.fillColor(grey).text('Receipt No.', metaLeft, y);
    doc.fillColor(dark).font('Helvetica-Bold').text(`#${receipt.id}`, metaLeft + 90, y);

    doc.fillColor(grey).font('Helvetica').text('Date', metaRight, y);
    doc.fillColor(dark).font('Helvetica-Bold')
      .text(new Date(receipt.issuedAt).toLocaleString('en-GB'), metaRight + 40, y);

    y += 20;
    doc.fillColor(grey).font('Helvetica').text('Table', metaLeft, y);
    doc.fillColor(dark).font('Helvetica-Bold')
      .text(`Table ${receipt.order.table.number}`, metaLeft + 90, y);

    doc.fillColor(grey).font('Helvetica').text('Order', metaRight, y);
    doc.fillColor(dark).font('Helvetica-Bold')
      .text(`#${receipt.order.id}`, metaRight + 40, y);

    y += 30;

    // ── Gold section title ─────────────────────────────────────────────────
    doc.rect(margin, y, colW, 24).fill(gold);
    doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold')
      .text('ORDER DETAILS', margin + 10, y + 6, { width: colW - 20 });
    y += 32;

    // ── Column headers ─────────────────────────────────────────────────────
    doc.fillColor(grey).fontSize(10).font('Helvetica-Bold');
    doc.text('ITEM',     margin,       y);
    doc.text('QTY',      margin + 290, y);
    doc.text('UNIT',     margin + 340, y);
    doc.text('TOTAL',    margin + 400, y);
    y += 14;
    doc.moveTo(margin, y).lineTo(pageW - margin, y).strokeColor('#cccccc').lineWidth(0.5).stroke();
    y += 8;

    // ── Order items ────────────────────────────────────────────────────────
    receipt.order.orderItems.forEach((item, idx) => {
      const rowBg = idx % 2 === 0 ? '#fafafa' : '#ffffff';
      doc.rect(margin, y - 3, colW, 20).fill(rowBg);

      doc.fillColor(dark).fontSize(10).font('Helvetica')
        .text(item.menuItem.name, margin + 4, y, { width: 270, ellipsis: true });
      doc.text(String(item.quantity),                margin + 294, y);
      doc.text(`£${item.price.toFixed(2)}`,          margin + 336, y);
      doc.fillColor(gold).font('Helvetica-Bold')
        .text(`£${(item.price * item.quantity).toFixed(2)}`, margin + 396, y);
      y += 20;
    });

    y += 6;
    doc.moveTo(margin, y).lineTo(pageW - margin, y).strokeColor(gold).lineWidth(1).stroke();
    y += 14;

    // ── Totals block ───────────────────────────────────────────────────────
    const totalX = pageW - margin - 160;
    doc.fillColor(grey).fontSize(11).font('Helvetica');
    doc.text('Subtotal:',   totalX, y);
    doc.fillColor(dark).text(`£${receipt.total.toFixed(2)}`, totalX + 100, y, { align: 'right', width: 60 });
    y += 18;

    doc.fillColor(grey).font('Helvetica').text('Tax (10%):',  totalX, y);
    doc.fillColor(dark).text(`£${receipt.tax.toFixed(2)}`,    totalX + 100, y, { align: 'right', width: 60 });
    y += 10;

    doc.moveTo(totalX, y).lineTo(pageW - margin, y).strokeColor(gold).lineWidth(1).stroke();
    y += 10;

    doc.fillColor(dark).fontSize(14).font('Helvetica-Bold').text('TOTAL:',  totalX, y);
    doc.fillColor(gold).fontSize(16).text(`£${receipt.grandTotal.toFixed(2)}`, totalX + 100, y, { align: 'right', width: 60 });
    y += 40;

    // ── Status badge ───────────────────────────────────────────────────────
    doc.rect(margin, y, colW, 28).fill('#e8f5e9');
    doc.fillColor('#2e7d32').fontSize(11).font('Helvetica-Bold')
      .text('✔  PAYMENT RECEIVED — Thank you!', margin, y + 8, { align: 'center', width: colW });
    y += 46;

    // ── Footer ─────────────────────────────────────────────────────────────
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

    doc.end();
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;