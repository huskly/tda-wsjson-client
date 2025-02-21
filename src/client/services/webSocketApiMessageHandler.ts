import { RawPayloadRequest, RawPayloadRequestItem } from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";

// Service interface definition for implementing support for new message types
export default interface WebSocketApiMessageHandler<ReqType> {
  // The name of the websocket service this handler is responsible for implementing
  service: ApiService;

  // Constructs a new message payload to be sent to the TDA websocket server
  buildRequest: (args: ReqType) => RawPayloadRequest;
}

export function newPayload(item: RawPayloadRequestItem) {
  return { payload: [item] };
}
