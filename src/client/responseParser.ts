import {
  ConnectionResponse,
  LoginResponse,
  WsJsonRawMessage,
} from "./tdaWsJsonTypes";

export function isConnectionResponse(
  message: WsJsonRawMessage
): message is ConnectionResponse {
  return "session" in message && "build" in message && "ver" in message;
}

export function isLoginResponse(
  message: WsJsonRawMessage
): message is LoginResponse {
  if (!("payload" in message)) return false;
  const service = message?.payload?.[0]?.header?.service;
  return service === "login";
}

export function isSuccessfulLoginResponse(message: LoginResponse): boolean {
  return message?.payload?.[0]?.body?.authenticationStatus === "OK";
}
