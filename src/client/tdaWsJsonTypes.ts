import { ApiService } from "./services/apiService.js";
import { RawLoginResponse } from "./services/loginMessageHandler.js";

export type RawPayloadResponseItemHeader = {
  service: ApiService;
  id: string;
  ver: number;
  type: string;
};

export type RawPayloadResponseItem = {
  header: RawPayloadResponseItemHeader;
  body: Record<string, unknown>;
};

export type RawPayloadRequestItemHeader = {
  service: string;
  id: string;
  ver: number;
};

export type RawPayloadRequestItem = {
  header: RawPayloadRequestItemHeader;
  params: Record<string, any>;
};

export type ConnectionResponse = {
  session: string;
  build: string;
  ver: string;
};

export type RawHeartbeatResponse = { heartbeat: number };

export type RawPayloadResponse = { payload: RawPayloadResponseItem[] };

export type RawPayloadRequest = { payload: RawPayloadRequestItem[] };

export type WsJsonRawMessage =
  | RawHeartbeatResponse
  | ConnectionResponse
  | RawLoginResponse
  | RawPayloadResponse;

export type MessageHandlerBaseResponse = {
  service: ApiService;
};

export type ParsedWebSocketResponse = MessageHandlerBaseResponse;

export type ParsedPayloadResponse = {
  service: ApiService;
  body: Record<string, unknown>;
};
