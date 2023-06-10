import {
  ConnectionResponse,
  LoginResponse,
  ParsedWebSocketResponse,
  RawPayloadResponse,
  WsJsonRawMessage,
} from "./tdaWsJsonTypes";
import { ChartResponse } from "./types/chartTypes";
import { QuotesResponse } from "./types/quoteTypes";
import { PositionsResponse } from "./types/positionsTypes";
import { RawPayloadResponseUserProperties } from "./types/userPropertiesTypes";

export function isSuccessful({ payload }: LoginResponse): boolean {
  return payload?.[0]?.body?.authenticationStatus === "OK";
}

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
): message is LoginResponse {
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
): response is RawPayloadResponseUserProperties {
  return "defaultAccountCode" in response;
}
