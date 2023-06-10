import {
  AlertsResponse,
  RawAlertCancelResponse,
  RawAlertLookupResponse,
  RawAlertSubscribeResponse,
} from "./types/alertTypes";
import {
  PlaceOrderPatchResponse,
  PlaceOrderSnapshotResponse,
  RawPlaceOrderPatchResponse,
  RawPlaceOrderSnapshotResponse,
} from "./types/placeOrderTypes";
import {
  OrderEventsPatchResponse,
  OrderEventsSnapshotResponse,
  RawOrderEventsResponse,
} from "./types/orderEventTypes";
import {
  QuotesResponse,
  RawPayloadResponseQuotesPatch,
  RawPayloadResponseQuotesSnapshot,
} from "./types/quoteTypes";
import {
  PositionsResponse,
  RawPositionsResponse,
} from "./types/positionsTypes";
import {
  InstrumentSearchResponse,
  RawPayloadResponseInstrumentSearch,
} from "./types/instrumentSearchTypes";
import { RawPayloadResponseUserProperties } from "./types/userPropertiesTypes";
import { ChartResponse, RawPayloadResponseChart } from "./types/chartTypes";
import {
  OptionChainResponse,
  RawOptionSeriesResponse,
} from "./types/optionChainTypes";

export type RawPayloadResponseItemBody =
  | RawPayloadResponseQuotesSnapshot
  | RawPayloadResponseQuotesPatch
  | RawPayloadResponseInstrumentSearch
  | RawPayloadResponseChart
  | RawPayloadResponseUserProperties
  | RawPlaceOrderSnapshotResponse
  | RawPlaceOrderPatchResponse
  | RawAlertLookupResponse
  | RawAlertCancelResponse
  | RawAlertSubscribeResponse
  | RawPositionsResponse
  | RawOrderEventsResponse
  | RawOptionSeriesResponse;

export type RawPayloadResponseItemHeader = {
  service: string;
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

export type LoginResponseBody = {
  message?: string;
  authenticationStatus: string;
  authenticated: boolean;
  forceLogout: boolean;
  stalePassword: boolean;
  userDomain: string;
  userSegment: string;
  userId: number;
  userCdi: string;
  userCode: string;
  token: string;
  schwabAccountMigrationValue: string;
  permissions: {
    isCryptoAllowed: boolean;
    isFractionalQuantityAllowed: boolean;
    isMandatoryAutoLockAllowed: boolean;
    isSchwabIntegrationHubLinkAllowed: boolean;
    isPlaceQuantityLinkOrdersAllowed: boolean;
  };
  quotePermissions: {
    name: string;
    isAllowed: boolean;
    children: {
      name: string;
      isAllowed: boolean;
      children: { name: string; isAllowed: boolean }[];
    }[];
  };
};

export type LoginResponse = {
  payload: {
    header: RawPayloadResponseItemHeader;
    body: LoginResponseBody;
  }[];
};

export type RawHeartbeatResponse = { heartbeat: number };

export type RawPayloadResponse = { payload: RawPayloadResponseItem[] };

export type RawPayloadRequest = { payload: RawPayloadRequestItem[] };

export type WsJsonRawMessage =
  | RawHeartbeatResponse
  | ConnectionResponse
  | LoginResponse
  | RawPayloadResponse;

export type ParsedWebSocketResponse =
  | QuotesResponse
  | InstrumentSearchResponse
  | ConnectionResponse
  | ChartResponse
  | RawPayloadResponseUserProperties
  | AlertsResponse
  | PositionsResponse
  | OrderEventsSnapshotResponse
  | OrderEventsPatchResponse
  | PlaceOrderSnapshotResponse
  | PlaceOrderPatchResponse
  | OptionChainResponse;
