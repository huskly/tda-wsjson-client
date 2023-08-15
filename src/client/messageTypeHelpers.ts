import {
  ConnectionResponse,
  ParsedWebSocketResponse,
  RawPayloadResponse,
  WsJsonRawMessage,
} from "./tdaWsJsonTypes";
import { ChartResponse } from "./services/chartMessageHandler";
import { QuotesResponse } from "./services/quotesMessageHandler";
import { PositionsResponse } from "./services/positionsMessageHandler";
import { PlaceOrderSnapshotResponse } from "./services/placeOrderMessageHandler";
import {
  OrderEventsPatchResponse,
  OrderEventsSnapshotResponse,
} from "./services/orderEventsMessageHandler";
import { UserPropertiesResponse } from "./services/userPropertiesMessageHandler";
import { InstrumentSearchResponse } from "./services/instrumentSearchMessageHandler";
import { AlertsResponse } from "./types/alertTypes";
import { OptionChainResponse } from "./services/optionSeriesMessageHandler";
import { RawLoginResponse } from "./services/loginMessageHandler";
import { OptionQuotesResponse } from "./services/optionQuotesMessageHandler";
import { CancelOrderResponse } from "./services/cancelOrderMessageHandler";

export function isPayloadResponse(
  response: WsJsonRawMessage
): response is RawPayloadResponse {
  return "payload" in response;
}

export function isConnectionResponse(
  message: WsJsonRawMessage
): message is ConnectionResponse {
  return "session" in message && "build" in message && "ver" in message;
}

export function isLoginResponse(
  message: WsJsonRawMessage
): message is RawLoginResponse {
  if (!isPayloadResponse(message)) return false;
  const [{ header }] = message.payload;
  const { service } = header;
  return service === "login";
}

export function isChartResponse(
  response: ParsedWebSocketResponse
): response is ChartResponse {
  return "candles" in response;
}

export function isQuotesResponse(
  response: ParsedWebSocketResponse
): response is QuotesResponse {
  return "quotes" in response;
}

export function isPositionsResponse(
  response: ParsedWebSocketResponse
): response is PositionsResponse {
  return "positions" in response;
}

export function isUserPropertiesResponse(
  response: ParsedWebSocketResponse
): response is UserPropertiesResponse {
  return "defaultAccountCode" in response;
}

export function isPlaceOrderResponse(
  response: ParsedWebSocketResponse
): response is PlaceOrderSnapshotResponse {
  return "orders" in response && response.service === "place_order";
}

export function isCancelOrderResponse(
  response: ParsedWebSocketResponse
): response is CancelOrderResponse {
  return "service" in response && response.service === "cancel_order";
}

export function isOrderEventsPatchResponse(
  response: ParsedWebSocketResponse
): response is OrderEventsPatchResponse {
  return "patches" in response && response.service === "order_events";
}

export function isOptionQuotesResponse(
  response: ParsedWebSocketResponse
): response is OptionQuotesResponse {
  return "service" in response && response.service === "quotes/options";
}

export function isOrderEventsSnapshotResponse(
  response: ParsedWebSocketResponse
): response is OrderEventsSnapshotResponse {
  return "orders" in response && response.service === "order_events";
}

export function isAlertsResponse(
  response: ParsedWebSocketResponse
): response is AlertsResponse {
  return "alerts" in response;
}

export function isInstrumentsResponse(
  response: ParsedWebSocketResponse
): response is InstrumentSearchResponse {
  return "instruments" in response;
}

export function isOptionChainResponse(
  response: ParsedWebSocketResponse
): response is OptionChainResponse {
  return "series" in response;
}
