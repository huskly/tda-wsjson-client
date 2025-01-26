import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler.js";
import { PlaceLimitOrderRequestParams } from "./placeOrderMessageHandler.js";
import { ApiService } from "./apiService.js";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes.js";
import { OrderEventsPatchResponse } from "./orderEventsMessageHandler.js";

// Submit new order or update existing order. Provide a `refOrderId` to update an existing order.
export default class SubmitOrderMessageHandler
  implements
    WebSocketApiMessageHandler<
      PlaceLimitOrderRequestParams,
      OrderEventsPatchResponse
    >
{
  buildRequest({
    accountNumber,
    limitPrice,
    symbol,
    quantity,
    refOrderId,
  }: PlaceLimitOrderRequestParams): RawPayloadRequest {
    return newPayload({
      header: {
        id: `update-draft-order-${symbol}`,
        service: "place_order",
        ver: 0,
      },
      params: {
        accountCode: accountNumber,
        action: "SUBMIT",
        marker: "SINGLE",
        orders: [
          {
            tif: "DAY",
            orderType: "LIMIT",
            refOrderId,
            limitPrice,
            requestType: "EDIT_ORDER",
            legs: [{ symbol, quantity }],
            tag: "TOSWeb",
          },
        ],
      },
    });
  }

  // This should never be called because the `place_order` service is handled by PlaceOrderMessageHandler instead
  parseResponse(_: RawPayloadResponse): never {
    throw new Error("This should never happen");
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  service: ApiService = "unused";
}
