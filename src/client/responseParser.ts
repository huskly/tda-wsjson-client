import { ParsedWebSocketResponse, WsJsonRawMessage } from "./tdaWsJsonTypes";
import { debugLog } from "./util";
import { isPayloadResponse } from "./messageTypeHelpers";
import WebSocketApiMessageHandler from "./services/webSocketApiMessageHandler";
import { ApiService } from "./services/apiService";
import { keyBy } from "lodash";

export default class ResponseParser {
  private readonly serviceRegistry: Record<
    ApiService,
    WebSocketApiMessageHandler<any, any>
  >;

  constructor(services: WebSocketApiMessageHandler<any, any>[]) {
    this.serviceRegistry = keyBy(services, (s) => s.service) as Record<
      ApiService,
      WebSocketApiMessageHandler<any, any>
    >;
  }

  /** Parses a raw TDA json websocket message into a more usable format */
  parseResponse(message: WsJsonRawMessage): ParsedWebSocketResponse | null {
    if (isPayloadResponse(message)) {
      const [{ header }] = message.payload;
      const { service } = header;
      const serviceHandler = this.serviceRegistry[service];
      if (serviceHandler) {
        return serviceHandler.parseResponse(message);
      } else {
        debugLog(`Don't know how to handle message with service=${service}`);
        return null;
      }
    } else {
      return null;
    }
  }
}
