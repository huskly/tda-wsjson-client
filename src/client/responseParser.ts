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
import {
  parseCancelOrderResponse,
  parsePlaceOrderResponse,
} from "./types/placeOrderTypes";
import {
  parseCancelAlertResponse,
  parseCreateAlertResponse,
  parseLookupAlertsResponse,
  parseSubscribeToAlertResponse,
} from "./types/alertTypes";
import { parseInstrumentSearchResponse } from "./types/instrumentSearchTypes";
import {
  parseOptionChainDetailsResponse,
  parseOptionChainResponse,
} from "./types/optionChainTypes";

type MessageServiceToParserMapping = {
  [key: string]: (
    message: RawPayloadResponse
  ) => ParsedWebSocketResponse | null;
};

export default class ResponseParser {
  private readonly messageServiceToParserMappings: MessageServiceToParserMapping =
    {
      cancel_order: parseCancelOrderResponse,
      chart: parseChartResponse,
      order_events: parseOrderEventsResponse,
      instrument_search: parseInstrumentSearchResponse,
      optionSeries: parseOptionChainResponse,
      "option_chain/get": parseOptionChainDetailsResponse,
      positions: parsePositionsResponse,
      place_order: parsePlaceOrderResponse,
      quotes: parseQuotesResponse,
      // "quotes/options": parseOptionQuotesResponse,
      user_properties: parseUserPropertiesResponse,
      "alerts/create": parseCreateAlertResponse,
      "alerts/cancel": parseCancelAlertResponse,
      "alerts/subscribe": parseSubscribeToAlertResponse,
      "alerts/lookup": parseLookupAlertsResponse,
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
