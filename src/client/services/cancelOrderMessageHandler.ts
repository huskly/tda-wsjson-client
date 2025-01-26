import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler.js";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";

export type CancelOrderResponse = {
  service: "cancel_order";
  orderId: number;
  // type: "snapshot" | "error"
  // for a failed cancel order request, type will be "error"
  type: string;
  body: Record<string, any>;
};

export default class CancelOrderMessageHandler
  implements WebSocketApiMessageHandler<number, CancelOrderResponse>
{
  parseResponse(message: RawPayloadResponse): CancelOrderResponse {
    const [{ header, body }] = message.payload;
    return {
      service: "cancel_order",
      type: header.type,
      orderId: +header.id.split("-")[1],
      body,
    };
  }

  buildRequest(orderId: number): RawPayloadRequest {
    return newPayload({
      header: { service: "cancel_order", id: `cancel-${orderId}`, ver: 0 },
      params: { orderId },
    });
  }

  service: ApiService = "cancel_order";
}
