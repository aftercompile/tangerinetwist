// Shiprocket's API responses nest inconsistently across endpoints and carry a lot of
// fields this app never reads — these types only cover what we actually consume.

export interface ShiprocketOrderItemInput {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
}

export interface CreateOrderPayload {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: true;
  order_items: ShiprocketOrderItemInput[];
  payment_method: "Prepaid" | "COD";
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export interface CreateOrderResponse {
  order_id: number;
  shipment_id: number;
  status: string;
  status_code: number;
}

export interface AssignAwbResponse {
  awb_assign_status: number;
  response: {
    data: {
      awb_code: string;
      courier_name: string;
      courier_company_id: number;
    };
  };
}

export interface TrackingResponse {
  tracking_data: {
    shipment_status?: number;
    shipment_track?: { current_status?: string }[];
  };
}

export interface LabelResponse {
  label_created: number;
  label_url: string;
}

export interface InvoiceResponse {
  is_invoice_created: boolean;
  invoice_url: string;
}
