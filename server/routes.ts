import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import {
  createSnapTransaction,
  getTransactionStatus,
  getMidtransConfig,
} from "./midtrans";

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

      console.log(`Order ${orderId}: ${paymentStatus} (${transactionStatus})`);

      res.status(200).json({ status: "ok" });
    } catch (error: any) {
      console.error("Midtrans notification error:", error);
      res.status(500).json({ error: "Failed to process notification" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
