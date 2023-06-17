export type CancelOrderResponse = {
  service: "cancel_order";
  orderId: number;
  // type: "snapshot" | "error"
  // for a failed cancel order request, type will be "error"
  type: string;
  body: Record<string, any>;
};
