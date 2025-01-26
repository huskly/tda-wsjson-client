import {
  MessageHandlerBaseResponse,
  RawPayloadRequest,
  RawPayloadRequestItem,
  RawPayloadResponse,
} from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";

// Service interface definition for implementing support for new message types
export default interface WebSocketApiMessageHandler<
  ReqType,
  ResType extends MessageHandlerBaseResponse | null
> {
  // The name of the websocket service this handler is responsible for implementing
  service: ApiService;

  // Constructs a new message payload to be sent to the TDA websocket server
  buildRequest: (args: ReqType) => RawPayloadRequest;

  // Parses a response from the TDA websocket server into a more usable format
  parseResponse: (message: RawPayloadResponse) => ResType;
}

export function newPayload(item: RawPayloadRequestItem) {
  return { payload: [item] };
}
