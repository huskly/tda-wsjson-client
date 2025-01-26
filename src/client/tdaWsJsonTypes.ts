import {
  RawAlertCancelResponse,
  RawAlertSubscribeResponse,
} from "./types/alertTypes.js";
import { RawOrderEventsResponse } from "./services/orderEventsMessageHandler.js";
import {
  RawPlaceOrderPatchResponse,
  RawPlaceOrderSnapshotResponse,
} from "./services/placeOrderMessageHandler.js";
import { RawAlertLookupResponse } from "./services/alertLookupMessageHandler.js";
import { RawPositionsResponse } from "./services/positionsMessageHandler.js";
import { ApiService } from "./services/apiService.js";
import {
  RawPayloadResponseQuotesPatch,
  RawPayloadResponseQuotesSnapshot,
} from "./services/quotesMessageHandler.js";
import { RawPayloadResponseInstrumentSearch } from "./services/instrumentSearchMessageHandler.js";
import { RawPayloadResponseChart } from "./services/chartMessageHandler.js";
import { UserPropertiesResponse } from "./services/userPropertiesMessageHandler.js";
import { RawOptionSeriesResponse } from "./services/optionSeriesMessageHandler.js";
import { RawLoginResponse } from "./services/loginMessageHandler.js";
import { RawPayloadMarketDepthResponse } from "./services/marketDepthMessageHandler.js";

export type RawPayloadResponseItemBody =
  | RawPayloadResponseQuotesSnapshot
  | RawPayloadResponseQuotesPatch
  | RawPayloadResponseInstrumentSearch
  | RawPayloadResponseChart
  | UserPropertiesResponse
  | RawPlaceOrderSnapshotResponse
  | RawPlaceOrderPatchResponse
  | RawAlertLookupResponse
  | RawAlertCancelResponse
  | RawAlertSubscribeResponse
  | RawPositionsResponse
  | RawOrderEventsResponse
  | RawOptionSeriesResponse
  | RawPayloadMarketDepthResponse;

export type RawPayloadResponseItemHeader = {
  service: ApiService;
  id: string;
  ver: number;
  type: string;
};

export type RawPayloadResponseItem = {
  header: RawPayloadResponseItemHeader;
  body: RawPayloadResponseItemBody;
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
