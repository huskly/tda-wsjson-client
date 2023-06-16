import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler";
import { CancelOrderResponse } from "../types/placeOrderTypes";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";
import { ApiService } from "./apiService";

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
