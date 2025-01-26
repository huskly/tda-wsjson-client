import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler.js";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";

export default class WorkingOrdersMessageHandler
  implements WebSocketApiMessageHandler<string, never>
{
  buildRequest(accountNumber: string): RawPayloadRequest {
    return newPayload({
      header: { service: "order_events", ver: 0, id: "workingOrders" },
      params: { account: accountNumber, types: ["WORKING"] },
    });
  }

  parseResponse(_: RawPayloadResponse): never {
    // All order_events responses are handled by `OrderEventsMessageHandler` instead
    // It is not currently possible for multiple message handlers to handle the same service
    throw new Error("should never be called.");
  }

  service: ApiService = "order_events";
}
