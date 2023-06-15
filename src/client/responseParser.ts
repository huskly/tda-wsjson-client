import {
  ParsedWebSocketResponse,
  RawPayloadResponse,
  WsJsonRawMessage,
} from "./tdaWsJsonTypes";
import { debugLog } from "./util";
import { isPayloadResponse } from "./messageTypeHelpers";
import MessageServiceDefinition from "./services/messageServiceDefinition";

export type MessageServiceToParserMapping = {
  [key: string]: (
    message: RawPayloadResponse
  ) => ParsedWebSocketResponse | null;
};

export default class ResponseParser {
  constructor(
    private readonly services: MessageServiceDefinition<any, any>[]
  ) {}

  /** Parses a raw TDA json websocket message into a more usable format */
  parseResponse(message: WsJsonRawMessage): ParsedWebSocketResponse | null {
    if (isPayloadResponse(message)) {
      const [{ header }] = message.payload;
      const { service } = header;
      const messageParser = this.responseMessageParsers[service];
      if (messageParser) {
        return messageParser(message);
      } else {
        debugLog(`Don't know how to parse message with service: ${service}`);
        return null;
      }
    } else {
      return null;
    }
  }
}
