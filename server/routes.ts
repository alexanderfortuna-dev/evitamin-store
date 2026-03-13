import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { eq, desc } from "drizzle-orm";
import {
  createSnapTransaction,
  getTransactionStatus,
  getMidtransConfig,
} from "./midtrans";
import { db } from "./db";
import { orders, orderItems } from "../shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/midtrans/config", (_req: Request, res: Response) => {
    try {
      const config = getMidtransConfig();
      res.json({
        clientKey: config.clientKey,
        snapUrl: config.snapUrl,
        isProduction: config.isProduction,
        isConfigured: !!config.clientKey,
      });
    } catch {
      res.json({
        clientKey: "",
        snapUrl: "https://app.sandbox.midtrans.com/snap/snap.js",
        isProduction: false,
        isConfigured: false,
      });
    }
  });

  app.post("/api/midtrans/create-transaction", async (req: Request, res: Response) => {
    try {
      const {
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress,
        shippingCity,
        shippingPostalCode,
        items,
        shippingCost,
        courierName,
      } = req.body;

      if (!customerName || !customerPhone || !shippingAddress || !shippingCity) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "No items in order" });
      }

      const itemTotal = items.reduce(
        (sum: number, item: { price: number; quantity: number }) =>
          sum + item.price * item.quantity,
        0,
      );
      const grossAmount = itemTotal + (shippingCost || 0);
      const orderId = `EV-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const result = await createSnapTransaction({
        orderId,
        grossAmount,
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress,
        shippingCity,
        shippingPostalCode: shippingPostalCode || "",
        items,
        shippingCost: shippingCost || 0,
        courierName: courierName || "Standard",
      });

      await db.insert(orders).values({
        orderId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        shippingAddress,
        shippingCity,
        shippingPostalCode: shippingPostalCode || null,
        courierName: courierName || "Standard",
        shippingCost: shippingCost || 0,
        itemTotal,
        grossAmount,
        paymentStatus: "pending",
        midtransToken: result.token || null,
        midtransRedirectUrl: result.redirectUrl || null,
      });

      await db.insert(orderItems).values(
        items.map((item: { id: string; name: string; price: number; quantity: number; imageUrl?: string }) => ({
          orderId,
          productSku: item.id,
          productName: item.name,
          price: Math.round(item.price),
          quantity: item.quantity,
          subtotal: Math.round(item.price * item.quantity),
          imageUrl: item.imageUrl || null,
        }))
      );

      res.json({
        orderId,
        token: result.token,
        redirectUrl: result.redirectUrl,
      });
    } catch (error: any) {
      console.error("Midtrans create transaction error:", error);
      res.status(500).json({
        error: "Failed to create payment transaction",
        details: error.message || "Unknown error",
      });
    }
  });

  app.get("/api/midtrans/status/:orderId", async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const status = await getTransactionStatus(orderId);
      res.json(status);
    } catch (error: any) {
      console.error("Midtrans status error:", error);
      res.status(500).json({
        error: "Failed to get transaction status",
        details: error.message || "Unknown error",
      });
    }
  });

  app.post("/api/midtrans/notification", async (req: Request, res: Response) => {
    try {
      const notification = req.body;
      console.log("Midtrans notification received:", JSON.stringify(notification));

      const orderId = notification.order_id;
      const transactionStatus = notification.transaction_status;
      const fraudStatus = notification.fraud_status;

      let paymentStatus = "pending";

      if (transactionStatus === "capture") {
        paymentStatus = fraudStatus === "accept" ? "paid" : "challenge";
      } else if (transactionStatus === "settlement") {
        paymentStatus = "paid";
      } else if (
        transactionStatus === "cancel" ||
        transactionStatus === "deny" ||
        transactionStatus === "expire"
      ) {
        paymentStatus = "failed";
      } else if (transactionStatus === "pending") {
        paymentStatus = "pending";
      }

      await db
        .update(orders)
        .set({
          paymentStatus,
          paidAt: paymentStatus === "paid" ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(orders.orderId, orderId));

      console.log(`Order ${orderId} updated to: ${paymentStatus}`);

      res.status(200).json({ status: "ok" });
    } catch (error: any) {
      console.error("Midtrans notification error:", error);
      res.status(500).json({ error: "Failed to process notification" });
    }
  });

  app.get("/api/orders", async (req: Request, res: Response) => {
    try {
      const { phone } = req.query;

      let orderList;
      if (phone && typeof phone === "string") {
        orderList = await db
          .select()
          .from(orders)
          .where(eq(orders.customerPhone, phone))
          .orderBy(desc(orders.createdAt));
      } else {
        orderList = await db
          .select()
          .from(orders)
          .orderBy(desc(orders.createdAt))
          .limit(50);
      }

      const orderIds = orderList.map((o) => o.orderId);
      let items: typeof orderItems.$inferSelect[] = [];

      if (orderIds.length > 0) {
        const allItems = await db.select().from(orderItems);
        items = allItems.filter((item) => orderIds.includes(item.orderId));
      }

      const result = orderList.map((order) => ({
        ...order,
        items: items.filter((item) => item.orderId === order.orderId),
      }));

      res.json(result);
    } catch (error: any) {
      console.error("Get orders error:", error);
      res.status(500).json({ error: "Failed to get orders", details: error.message });
    }
  });

  app.get("/api/orders/:orderId", async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;

      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.orderId, orderId));

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));

      res.json({ ...order, items });
    } catch (error: any) {
      console.error("Get order error:", error);
      res.status(500).json({ error: "Failed to get order", details: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
