import { RawLoginResponseBody } from "./services/loginMessageHandler";
import { QuotesResponse } from "./services/quotesMessageHandler";
import { PositionsResponse } from "./services/positionsMessageHandler";
import {
  ChartRequestParams,
  ChartResponse,
} from "./services/chartMessageHandler";
import { InstrumentSearchResponse } from "./services/instrumentSearchMessageHandler";
import { OptionChainResponse } from "./services/optionSeriesMessageHandler";
import { OptionSeriesQuotesResponse } from "./services/optionSeriesQuotesMessageHandler";
import {
  OptionChainDetailsRequest,
  OptionChainDetailsResponse,
} from "./services/optionChainDetailsMessageHandler";
import {
  OptionQuotesRequestParams,
  OptionQuotesResponse,
} from "./services/optionQuotesMessageHandler";
import {
  PlaceLimitOrderRequestParams,
  PlaceOrderSnapshotResponse,
} from "./services/placeOrderMessageHandler";
import { OrderEventsResponse } from "./services/orderEventsMessageHandler";
import { CreateAlertRequestParams } from "./services/createAlertMessageHandler";
import { CancelOrderResponse } from "./services/cancelOrderMessageHandler";
import { UserPropertiesResponse } from "./services/userPropertiesMessageHandler";
import {
  CancelAlertResponse,
  CreateAlertResponse,
  LookupAlertsResponse,
} from "./types/alertTypes";
import { MarketDepthResponse } from "./services/marketDepthMessageHandler";
import { GetWatchlistResponse } from "./services/getWatchlistMessageHandler";

export interface WsJsonClient {
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

  disconnect(): void;

  marketDepth(symbol: string): AsyncIterable<MarketDepthResponse>;

  watchlist(watchlistId: number): Promise<GetWatchlistResponse>;
}
