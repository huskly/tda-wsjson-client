import {
  AlertsResponse,
  RawAlertCancelResponse,
  RawAlertSubscribeResponse,
} from "./types/alertTypes";
import {
  OrderEventsPatchResponse,
  OrderEventsSnapshotResponse,
  RawOrderEventsResponse,
} from "./services/orderEventsMessageHandler";
import {
  PlaceOrderPatchResponse,
  PlaceOrderSnapshotResponse,
  RawPlaceOrderPatchResponse,
  RawPlaceOrderSnapshotResponse,
} from "./services/placeOrderMessageHandler";
import { RawAlertLookupResponse } from "./services/alertLookupMessageHandler";
import {
  PositionsResponse,
  RawPositionsResponse,
} from "./services/positionsMessageHandler";
import { ApiService } from "./services/apiService";
import {
  QuotesResponse,
  RawPayloadResponseQuotesPatch,
  RawPayloadResponseQuotesSnapshot,
} from "./services/quotesMessageHandler";
import {
  InstrumentSearchResponse,
  RawPayloadResponseInstrumentSearch,
} from "./services/instrumentSearchMessageHandler";
import {
  ChartResponse,
  RawPayloadResponseChart,
} from "./services/chartMessageHandler";
import { UserPropertiesResponse } from "./services/userPropertiesMessageHandler";
import {
  OptionChainResponse,
  RawOptionSeriesResponse,
} from "./services/optionSeriesMessageHandler";
import { CancelOrderResponse } from "./types/placeOrderTypes";
import { OptionChainDetailsResponse } from "./services/optionChainDetailsMessageHandler";
import { RawLoginResponse } from "./services/loginMessageHandler";

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
  | RawOptionSeriesResponse;

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

// todo change to an interface implemented by services
export type ParsedWebSocketResponse =
  | QuotesResponse
  | InstrumentSearchResponse
  | CancelOrderResponse
  | ConnectionResponse
  | ChartResponse
  | UserPropertiesResponse
  | AlertsResponse
  | PositionsResponse
  | OrderEventsSnapshotResponse
  | OrderEventsPatchResponse
  | PlaceOrderSnapshotResponse
  | PlaceOrderPatchResponse
  | OptionChainResponse
  | OptionChainDetailsResponse;
