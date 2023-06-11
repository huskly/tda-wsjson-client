import {
  ParsedWebSocketResponse,
  RawPayloadResponse,
  WsJsonRawMessage,
} from "./tdaWsJsonTypes";
import { parseQuotesResponse } from "./types/quoteTypes";
import { parseChartResponse } from "./types/chartTypes";
import { debugLog } from "./util";
import { isPayloadResponse } from "./messageTypeHelpers";
import { parseOrderEventsResponse } from "./types/orderEventTypes";
import { parsePositionsResponse } from "./types/positionsTypes";
import { parseUserPropertiesResponse } from "./types/userPropertiesTypes";
import { parsePlaceOrderResponse } from "./types/placeOrderTypes";

type MessageServiceToParserMapping = {
  [key: string]: (
    message: RawPayloadResponse
  ) => ParsedWebSocketResponse | null;
};

export default class ResponseParser {
  private readonly messageServiceToParserMappings: MessageServiceToParserMapping =
    {
      quotes: parseQuotesResponse,
      chart: parseChartResponse,
      order_events: parseOrderEventsResponse,
      positions: parsePositionsResponse,
      place_order: parsePlaceOrderResponse,
      user_properties: parseUserPropertiesResponse,
    };

  /** Parses a raw TDA json websocket message into a more usable format */
  parseResponse(message: WsJsonRawMessage): ParsedWebSocketResponse | null {
    if (isPayloadResponse(message)) {
      const [{ header }] = message.payload;
      const { service } = header;
      const messageParser = this.messageServiceToParserMappings[service];
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
