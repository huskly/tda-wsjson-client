import { RawLoginResponseBody } from "./services/loginMessageHandler";
import { QuotesResponse } from "./services/quotesMessageHandler";
import { PositionsResponse } from "./services/positionsMessageHandler";
import {
  ChartRequestParams,
  ChartResponse,
} from "./services/chartMessageHandler";
import { InstrumentSearchResponse } from "./services/instrumentSearchMessageHandler";
import { AlertsResponse } from "./types/alertTypes";
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

export interface WsJsonClient {
  authenticate(): Promise<RawLoginResponseBody | null>;

  isConnected(): boolean;

  isConnecting(): boolean;

  ensureConnected(): void;

  quotes(symbols: string[]): AsyncIterable<QuotesResponse>;

  accountPositions(accountNumber: string): AsyncIterable<PositionsResponse>;

  chart(request: ChartRequestParams): AsyncIterable<ChartResponse>;

  searchInstruments(query: string): Promise<InstrumentSearchResponse>;

  lookupAlerts(): AsyncIterable<AlertsResponse>;

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

  createAlert(request: CreateAlertRequestParams): Promise<AlertsResponse>;

  cancelAlert(alertId: number): Promise<AlertsResponse>;

  cancelOrder(orderId: number): Promise<CancelOrderResponse>;

  userProperties(): Promise<UserPropertiesResponse>;

  disconnect(): void;
}
