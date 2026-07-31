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

// Shiprocket's track API nests the checkpoint history under
// shipment_track_activities (each entry roughly { date, status, activity, location }),
// separate from shipment_track (one summary row per courier leg with current_status).
// Field presence/naming has some documented variance across Shiprocket API versions, so
// applyTrackingUpdate() (shiprocket-actions.ts) parses this tolerantly rather than
// assuming every field is always present.
export interface ShiprocketTrackingActivity {
  date?: string;
  status?: string;
  activity?: string;
  location?: string;
}

export interface TrackingResponse {
  tracking_data: {
    shipment_status?: number;
    shipment_track?: { current_status?: string }[];
    shipment_track_activities?: ShiprocketTrackingActivity[];
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

// A stored checkpoint row (order_tracking_events), shared by both the admin and
// customer-facing order detail queries so they render the same timeline shape.
export interface OrderTrackingEvent {
  status: string;
  activity: string | null;
  location: string | null;
  occurredAt: Date;
}
