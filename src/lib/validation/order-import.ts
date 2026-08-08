import { z } from "zod";

// One row = one order line, after the admin's column mapping has been applied. Multiple
// rows can share the same externalOrderId (a marketplace order with 2+ products exports
// as 2+ rows) — order-import-actions.ts groups them back into one order.
export const importedOrderRowSchema = z.object({
  externalOrderId: z.string().trim().min(1, "Order ID is required"),
  orderDate: z.string().trim().optional(),
  customerName: z.string().trim().min(1, "Customer name is required"),
  customerPhone: z.string().trim().optional(),
  customerEmail: z.string().trim().optional(),
  addressLine: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  pin: z.string().trim().min(1, "PIN code is required"),
  productName: z.string().trim().min(1, "Product name is required"),
  quantity: z.coerce.number().int().positive("Quantity must be a positive number"),
  lineTotal: z.coerce.number().positive("Line total must be a positive number"),
});

export type ImportedOrderRow = z.infer<typeof importedOrderRowSchema>;

export const REQUIRED_IMPORT_FIELDS: { key: keyof ImportedOrderRow; label: string; required: boolean }[] = [
  { key: "externalOrderId", label: "Order ID", required: true },
  { key: "orderDate", label: "Order Date", required: false },
  { key: "customerName", label: "Customer Name", required: true },
  { key: "customerPhone", label: "Customer Phone", required: false },
  { key: "customerEmail", label: "Customer Email", required: false },
  { key: "addressLine", label: "Address", required: true },
  { key: "city", label: "City", required: true },
  { key: "state", label: "State", required: true },
  { key: "pin", label: "PIN Code", required: true },
  { key: "productName", label: "Product Name", required: true },
  { key: "quantity", label: "Quantity", required: true },
  { key: "lineTotal", label: "Line Total (₹)", required: true },
];
