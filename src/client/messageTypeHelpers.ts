import {
  ConnectionResponse,
  RawPayloadResponse,
  WsJsonRawMessage,
} from "./tdaWsJsonTypes";
import { RawLoginResponse } from "./services/loginMessageHandler";

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
