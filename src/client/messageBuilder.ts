import { RawPayloadRequest } from "./tdaWsJsonTypes";
import { newPayload } from "./services/webSocketApiMessageHandler";
import { PlaceLimitOrderRequestParams } from "./services/placeOrderMessageHandler";

export const CONNECTION_REQUEST_MESSAGE = {
  ver: "27.*.*",
  fmt: "json-patches-structured",
  heartbeat: "2s",
};

export const newRandomId = () => Math.floor(Math.random() * 1_000_000_000);

export function newSubmitLimitOrderRequest({
  accountNumber,
  limitPrice,
  symbol,
  quantity,
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
          limitPrice: limitPrice,
          requestType: "EDIT_ORDER",
          legs: [{ symbol, quantity }],
          tag: "TOSWeb",
        },
      ],
    },
  });
}
