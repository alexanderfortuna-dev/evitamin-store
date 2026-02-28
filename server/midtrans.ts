import midtransClient from "midtrans-client";

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

export function getSnapClient() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    throw new Error("MIDTRANS_SERVER_KEY is not configured");
  }

  return new midtransClient.Snap({
    isProduction,
    serverKey,
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
  });
}

export function getCoreApiClient() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    throw new Error("MIDTRANS_SERVER_KEY is not configured");
  }

  return new midtransClient.CoreApi({
    isProduction,
    serverKey,
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
  });
}

export function getMidtransConfig() {
  return {
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    isProduction,
    snapUrl: isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js",
  };
}

export type PaymentMethod =
  | "bank_transfer"
  | "qris"
  | "gopay"
  | "shopeepay"
  | "credit_card"
  | "cstore"
  | "echannel";

export interface CreateTransactionParams {
  orderId: string;
  grossAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  shippingCost: number;
  courierName: string;
}

export async function createSnapTransaction(params: CreateTransactionParams) {
  const snap = getSnapClient();

  const itemDetails = [
    ...params.items.map((item) => ({
      id: item.id,
      name: item.name.substring(0, 50),
      price: Math.round(item.price),
      quantity: item.quantity,
    })),
  ];

  if (params.shippingCost > 0) {
    itemDetails.push({
      id: "SHIPPING",
      name: `Ongkir ${params.courierName}`,
      price: Math.round(params.shippingCost),
      quantity: 1,
    });
  }

  const transactionDetails = {
    order_id: params.orderId,
    gross_amount: Math.round(params.grossAmount),
  };

  const customerDetails = {
    first_name: params.customerName,
    phone: params.customerPhone,
    email: params.customerEmail || "",
    shipping_address: {
      first_name: params.customerName,
      phone: params.customerPhone,
      address: params.shippingAddress,
      city: params.shippingCity,
      postal_code: params.shippingPostalCode,
      country_code: "IDN",
    },
  };

  const parameter = {
    transaction_details: transactionDetails,
    item_details: itemDetails,
    customer_details: customerDetails,
    enabled_payments: [
      "bank_transfer",
      "echannel",
      "permata_va",
      "bca_va",
      "bni_va",
      "bri_va",
      "cimb_va",
      "other_va",
      "gopay",
      "shopeepay",
      "qris",
      "credit_card",
      "cstore",
      "alfamart",
      "indomaret",
    ],
    credit_card: {
      secure: true,
    },
    callbacks: {
      finish: `${process.env.REPLIT_DEV_DOMAIN ? "https://" + process.env.REPLIT_DEV_DOMAIN : ""}/checkout/finish`,
    },
  };

  const transaction = await snap.createTransaction(parameter);

  return {
    token: transaction.token,
    redirectUrl: transaction.redirect_url,
  };
}

export async function getTransactionStatus(orderId: string) {
  const core = getCoreApiClient();
  const status = await core.transaction.status(orderId);
  return status;
}
