import { WsJsonClient } from "./wsJsonClient.js";
import { PositionsResponse } from "./services/positionsMessageHandler.js";
import { RawLoginResponseBody } from "./services/loginMessageHandler.js";
import { CancelOrderResponse } from "./services/cancelOrderMessageHandler.js";
import {
  ChartRequestParams,
  ChartResponse,
} from "./services/chartMessageHandler.js";
import { CreateAlertRequestParams } from "./services/createAlertMessageHandler.js";
import { OptionChainResponse } from "./services/optionSeriesMessageHandler.js";
import {
  OptionChainDetailsRequest,
  OptionChainDetailsResponse,
} from "./services/optionChainDetailsMessageHandler.js";
import { OptionSeriesQuotesResponse } from "./services/optionSeriesQuotesMessageHandler.js";
import {
  OptionQuotesRequestParams,
  OptionQuotesResponse,
} from "./services/optionQuotesMessageHandler.js";
import {
  PlaceLimitOrderRequestParams,
  PlaceOrderSnapshotResponse,
} from "./services/placeOrderMessageHandler.js";
import { OrderEventsResponse } from "./services/orderEventsMessageHandler.js";
import { QuotesResponse } from "./services/quotesMessageHandler.js";
import { InstrumentSearchResponse } from "./services/instrumentSearchMessageHandler.js";
import { UserPropertiesResponse } from "./services/userPropertiesMessageHandler.js";
import {
  CancelAlertResponse,
  CreateAlertResponse,
  LookupAlertsResponse,
} from "./types/alertTypes.js";
import { MarketDepthResponse } from "./services/marketDepthMessageHandler.js";
import { GetWatchlistResponse } from "./services/getWatchlistMessageHandler.js";

export default class MockWsJsonClient implements WsJsonClient {
  async *accountPositions(_: string): AsyncIterable<PositionsResponse> {
    return yield {
      service: "positions",
      positions: [],
    };
  }

  authenticate(): Promise<RawLoginResponseBody | null> {
    return Promise.resolve(null);
  }

  cancelAlert(_: number): Promise<CancelAlertResponse> {
    return Promise.resolve({
      service: "alerts/cancel",
      alerts: [],
    });
  }

  cancelOrder(_: number): Promise<CancelOrderResponse> {
    return Promise.resolve({
      service: "cancel_order",
      orderId: 123,
      type: "snapshot",
      body: {},
    });
  }

  async *chart(_: ChartRequestParams): AsyncIterable<ChartResponse> {
    return yield {
      service: "chart",
      symbol: "",
      candles: [],
    };
  }

  createAlert(_: CreateAlertRequestParams): Promise<CreateAlertResponse> {
    return Promise.resolve({
      service: "alerts/create",
      alerts: [],
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ensureConnected(): void {}

  isConnected(): boolean {
    return true;
  }

  isConnecting(): boolean {
    return false;
  }

  async *lookupAlerts(): AsyncIterable<LookupAlertsResponse> {
    return yield {
      service: "alerts/lookup",
      alerts: [],
    };
  }

  optionChain(_: string): Promise<OptionChainResponse> {
    return Promise.resolve({
      series: [],
      service: "optionSeries",
    });
  }

  optionChainDetails(
    _: OptionChainDetailsRequest
  ): Promise<OptionChainDetailsResponse> {
    return Promise.resolve({
      service: "option_chain/get",
      seriesDetails: [],
    });
  }

  async *optionChainQuotes(
    _: string
  ): AsyncIterable<OptionSeriesQuotesResponse> {
    return yield {
      series: [],
      service: "optionSeries/quotes",
    };
  }

  async *optionQuotes(
    _: OptionQuotesRequestParams
  ): AsyncIterable<OptionQuotesResponse> {
    return yield {
      items: [],
      service: "quotes/options",
    };
  }

  placeOrder(
    _: PlaceLimitOrderRequestParams
  ): Promise<PlaceOrderSnapshotResponse> {
    return Promise.resolve({
      service: "place_order",
      orders: [],
    });
  }

  async *quotes(_: string[]): AsyncIterable<QuotesResponse> {
    return yield {
      service: "quotes",
      quotes: [],
    };
  }

  replaceOrder(
    _: Required<PlaceLimitOrderRequestParams>
  ): Promise<OrderEventsResponse> {
    return Promise.resolve({
      service: "order_events",
      orders: [],
    });
  }

  searchInstruments(_: string): Promise<InstrumentSearchResponse> {
    return Promise.resolve({
      service: "instrument_search",
      instruments: [],
    });
  }

  userProperties(): Promise<UserPropertiesResponse> {
    return Promise.resolve({
      service: "user_properties",
      defaultAccountCode: "foo",
      nickname: "foo",
      plDisplayMethod: "foo",
      stocksOrderDefaultType: "foo",
      stocksOrderDefaultQuantity: 0,
      stocksOrderQuantityIncrement: 0,
      optionsOrderDefaultType: "foo",
      optionsOrderDefaultQuantity: 0,
      optionsOrderQuantityIncrement: 0,
      futuresOrderOrderDefaultType: "foo",
      futuresOrderDefaultType: "foo",
      futuresOrderDefaultQuantity: 0,
      futuresOrderQuantityIncrement: 0,
      futureOptionsOrderDefaultType: "foo",
      futureOptionsOrderDefaultQuantity: 0,
      futureOptionsOrderQuantityIncrement: 0,
      forexOrderDefaultType: "foo",
      forexOrderDefaultQuantity: 0,
      forexOrderQuantityIncrement: 0,
    });
  }

  async *workingOrders(_: string): AsyncIterable<OrderEventsResponse> {
    return yield {
      orders: [],
      service: "order_events",
    };
  }

  async *marketDepth(_: string): AsyncIterable<MarketDepthResponse> {
    return yield {
      bidQuotes: [],
      askQuotes: [],
      service: "market_depth",
    };
  }

  watchlist(watchlistId: number): Promise<GetWatchlistResponse> {
    return Promise.resolve({
      service: "watchlist/get",
      watchlist: {
        id: watchlistId,
        name: "foo",
        type: "STATIC",
        symbols: ["AAPL", "GOOG", "MSFT"],
      },
    });
  }
}
