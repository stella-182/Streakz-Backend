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

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=receipt-${orderId}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text(receipt.order.branch.name, { align: 'center' });
    doc.fontSize(12).text(receipt.order.branch.address, { align: 'center' });
    doc.moveDown();
    doc.text(`Receipt #${receipt.id}`, { align: 'center' });
    doc.text(`Date: ${new Date(receipt.issuedAt).toLocaleString()}`, { align: 'center' });
    doc.text(`Table: ${receipt.order.table.number}`, { align: 'center' });
    doc.moveDown();

    doc.text('Item', 50, doc.y, { continued: true });
    doc.text('Qty', 250, doc.y, { continued: true });
    doc.text('Price', 350, doc.y);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    receipt.order.orderItems.forEach((item) => {
      doc.text(item.menuItem.name, 50, doc.y, { continued: true });
      doc.text(String(item.quantity), 250, doc.y, { continued: true });
      doc.text(`£${(item.price * item.quantity).toFixed(2)}`, 350, doc.y);
    });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.text(`Subtotal: £${receipt.total.toFixed(2)}`);
    doc.text(`Tax (10%): £${receipt.tax.toFixed(2)}`);
    doc.fontSize(14).text(`Total: £${receipt.grandTotal.toFixed(2)}`);
    doc.moveDown();
    doc.fontSize(10).text('Thank you for dining with us!', { align: 'center' });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;