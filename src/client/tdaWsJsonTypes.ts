import {
  RawAlertCancelResponse,
  RawAlertSubscribeResponse,
} from "./types/alertTypes";
import { RawOrderEventsResponse } from "./services/orderEventsMessageHandler";
import {
  RawPlaceOrderPatchResponse,
  RawPlaceOrderSnapshotResponse,
} from "./services/placeOrderMessageHandler";
import { RawAlertLookupResponse } from "./services/alertLookupMessageHandler";
import { RawPositionsResponse } from "./services/positionsMessageHandler";
import { ApiService } from "./services/apiService";
import {
  RawPayloadResponseQuotesPatch,
  RawPayloadResponseQuotesSnapshot,
} from "./services/quotesMessageHandler";
import { RawPayloadResponseInstrumentSearch } from "./services/instrumentSearchMessageHandler";
import { RawPayloadResponseChart } from "./services/chartMessageHandler";
import { UserPropertiesResponse } from "./services/userPropertiesMessageHandler";
import { RawOptionSeriesResponse } from "./services/optionSeriesMessageHandler";
import { RawLoginResponse } from "./services/loginMessageHandler";
import { RawPayloadMarketDepthResponse } from "./services/marketDepthMessageHandler";

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
