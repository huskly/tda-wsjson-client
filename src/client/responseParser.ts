import { ParsedPayloadResponse, WsJsonRawMessage } from "./tdaWsJsonTypes.js";
import { isPayloadResponse } from "./messageTypeHelpers.js";
import GenericIncomingMessageHandler from "./services/genericIncomingMessageHandler.js";

export default class ResponseParser {
  constructor(private readonly genericHandler: GenericIncomingMessageHandler) {}

  /** Parses and returns a list of records from a raw TOS wsjson websocket response using json-patch */
  parseResponse(message: WsJsonRawMessage): ParsedPayloadResponse[] {
    if (isPayloadResponse(message)) {
      return this.genericHandler.parseResponse(message);
    } else {
      return [];
    }
  }
}
