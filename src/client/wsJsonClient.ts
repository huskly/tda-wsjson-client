import { RawLoginResponseBody } from "./services/loginMessageHandler.js";
import { QuotesResponse } from "./services/quotesMessageHandler.js";
import { PositionsResponse } from "./services/positionsMessageHandler.js";
import {
  ChartRequestParams,
  ChartResponse,
} from "./services/chartMessageHandler.js";
import { InstrumentSearchResponse } from "./services/instrumentSearchMessageHandler.js";
import { OptionChainResponse } from "./services/optionSeriesMessageHandler.js";
import { OptionSeriesQuotesResponse } from "./services/optionSeriesQuotesMessageHandler.js";
import {
  OptionChainDetailsRequest,
  OptionChainDetailsResponse,
} from "./services/optionChainDetailsMessageHandler.js";
import {
  OptionQuotesRequestParams,
  OptionQuotesResponse,
} from "./services/optionQuotesMessageHandler.js";
import {
  PlaceLimitOrderRequestParams,
  PlaceOrderSnapshotResponse,
} from "./services/placeOrderMessageHandler.js";
import { OrderEventsResponse } from "./services/orderEventsMessageHandler.js";
import { CreateAlertRequestParams } from "./services/createAlertMessageHandler.js";
import { CancelOrderResponse } from "./services/cancelOrderMessageHandler.js";
import { UserPropertiesResponse } from "./services/userPropertiesMessageHandler.js";
import {
  CancelAlertResponse,
  CreateAlertResponse,
  LookupAlertsResponse,
} from "./types/alertTypes.js";
import { MarketDepthResponse } from "./services/marketDepthMessageHandler.js";
import { GetWatchlistResponse } from "./services/getWatchlistMessageHandler.js";
import { Disposable } from "../server/disposable.js";

export interface WsJsonClient extends Disposable {
  authenticate(accessToken: string): Promise<RawLoginResponseBody | null>;

  isConnected(): boolean;

  isConnecting(): boolean;

  ensureConnected(): void;

  quotes(symbols: string[]): AsyncIterable<QuotesResponse>;

  accountPositions(accountNumber: string): AsyncIterable<PositionsResponse>;

  chart(request: ChartRequestParams): AsyncIterable<ChartResponse>;

  searchInstruments(query: string): Promise<InstrumentSearchResponse>;

  lookupAlerts(): AsyncIterable<LookupAlertsResponse>;

  optionChain(symbol: string): Promise<OptionChainResponse>;

  optionChainQuotes(symbol: string): AsyncIterable<OptionSeriesQuotesResponse>;

  optionChainDetails(
    request: OptionChainDetailsRequest
  ): Promise<OptionChainDetailsResponse>;

  optionQuotes(
    request: OptionQuotesRequestParams
  ): AsyncIterable<OptionQuotesResponse>;

  placeOrder(
    request: PlaceLimitOrderRequestParams
  ): Promise<PlaceOrderSnapshotResponse>;

  replaceOrder(
    request: Required<PlaceLimitOrderRequestParams>
  ): Promise<OrderEventsResponse>;

  workingOrders(accountNumber: string): AsyncIterable<OrderEventsResponse>;

  createAlert(request: CreateAlertRequestParams): Promise<CreateAlertResponse>;

  cancelAlert(alertId: number): Promise<CancelAlertResponse>;

  cancelOrder(orderId: number): Promise<CancelOrderResponse>;

  userProperties(): Promise<UserPropertiesResponse>;

  marketDepth(symbol: string): AsyncIterable<MarketDepthResponse>;

  watchlist(watchlistId: number): Promise<GetWatchlistResponse>;
}
