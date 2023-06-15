import MessageServiceDefinition, {
  newPayload,
} from "./messageServiceDefinition";
import { CancelOrderResponse } from "../types/placeOrderTypes";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";

export default class CancelOrderService
  implements MessageServiceDefinition<number, CancelOrderResponse>
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

  sendRequest(orderId: number): RawPayloadRequest {
    return newPayload({
      header: { service: "cancel_order", id: `cancel-${orderId}`, ver: 0 },
      params: { orderId },
    });
  }
}
