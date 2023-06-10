import {
  ConnectionResponse,
  LoginResponse,
  LoginResponseBody,
  RawPayloadResponse,
  WsJsonRawMessage,
} from "./tdaWsJsonTypes";

export function isSuccessfulLogin(message: LoginResponse): boolean {
  return isSuccessfulLoginResponse(message?.payload?.[0]?.body);
}

export function isSuccessfulLoginResponse(
  responseBody: LoginResponseBody | null | undefined
): boolean {
  return responseBody?.authenticationStatus === "OK";
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
