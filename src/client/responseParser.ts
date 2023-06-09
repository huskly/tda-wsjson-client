import {
  ConnectionResponse,
  isPayloadResponse,
  LoginResponse,
  ParsedWebSocketResponse,
  WsJsonRawMessage,
} from "./tdaWsJsonTypes";
import { parseQuotesResponse } from "./types/quoteTypes";

export default class ResponseParser {
  isConnectionResponse(
    message: WsJsonRawMessage
  ): message is ConnectionResponse {
    return "session" in message && "build" in message && "ver" in message;
  }

  isLoginResponse(message: WsJsonRawMessage): message is LoginResponse {
    if (!("payload" in message)) return false;
    const service = message?.payload?.[0]?.header?.service;
    return service === "login";
  }

  /** Parses a raw TDA json websocket message into a more usable format */
  parseResponse(message: WsJsonRawMessage): ParsedWebSocketResponse | null {
    if (isPayloadResponse(message)) {
      const [{ header }] = message.payload;
      switch (header.service) {
        case "quotes":
          return parseQuotesResponse(message);
        default:
          return null;
      }
    } else {
      return null;
    }
  }
}
