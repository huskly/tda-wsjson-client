import { WsJsonClient } from "./wsJsonClient.js";
import { PositionsResponse } from "./services/positionsMessageHandler.js";
import { RawLoginResponseBody } from "./services/loginMessageHandler.js";
import {
  CancelAlertResponse,
  CreateAlertResponse,
  LookupAlertsResponse,
} from "./types/alertTypes.js";
import { CancelOrderResponse } from "./services/cancelOrderMessageHandler.js";
import {
  ChartRequestParams,
  ChartResponse,
} from "./services/chartMessageHandler.js";
import { CreateAlertRequestParams } from "./services/createAlertMessageHandler.js";
import { MarketDepthResponse } from "./services/marketDepthMessageHandler.js";
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
import { QuotesResponse } from "./services/quotesMessageHandler.js";
import { OrderEventsResponse } from "./services/orderEventsMessageHandler.js";
import { InstrumentSearchResponse } from "./services/instrumentSearchMessageHandler.js";
import { UserPropertiesResponse } from "./services/userPropertiesMessageHandler.js";
import { GetWatchlistResponse } from "./services/getWatchlistMessageHandler.js";
import WebSocket from "isomorphic-ws";
import { deferredWrap } from "obgen";
import debug from "debug";
import { ChannelState } from "./realWsJsonClient.js";
import { isString } from "lodash-es";
import { Observable, BufferedIterator, MulticastIterator } from "obgen";

const logger = debug("wsClientProxy");

export const ALL_REQUESTS = [
  "authenticate",
  "optionChainQuotes",
  "disconnect",
  "quotes",
  "accountPositions",
  "chart",
  "searchInstruments",
  "lookupAlerts",
  "optionChain",
  "optionChainQuotes",
  "optionChainDetails",
  "optionQuotes",
  "placeOrder",
  "replaceOrder",
  "workingOrders",
  "createAlert",
  "cancelAlert",
  "cancelOrder",
  "userProperties",
  "marketDepth",
  "watchlist",
] as const;
type RequestType = typeof ALL_REQUESTS;
export type Request = RequestType[number];

export type ProxiedRequest = {
  request: Request;
  args?: any;
};

export type ProxiedResponse = ProxiedRequest & { response: unknown };

// A WsJsonClient proxy implementation that proxies requests to a WebSocket server using the provided `proxyUrl`.
export default class WsJsonClientProxy implements WsJsonClient {
  private state = ChannelState.DISCONNECTED;
  private buffer = new BufferedIterator<ProxiedResponse>();
  private iterator = new MulticastIterator(this.buffer);
  private socket?: WebSocket;

  constructor(
    private readonly proxyUrl: string,
    private readonly options?: any
  ) {}

  async authenticate(
    accessToken: string
  ): Promise<RawLoginResponseBody | null> {
    this.socket = new WebSocket(this.proxyUrl, this.options);
    this.state = ChannelState.CONNECTING;
    this.buffer = new BufferedIterator<ProxiedResponse>();
    this.iterator = new MulticastIterator(this.buffer);
    const { buffer, socket } = this;
    return new Promise((resolve, reject) => {
      socket.onmessage = ({ data }) => {
        // make sure date objects are reconstructed across the wire
        const parsedMsg = JSON.parse(data as string, dateReviver);
        buffer.emit(parsedMsg as ProxiedResponse);
      };
      socket.onopen = () => {
        logger("proxy ws connection opened");
        this.state = ChannelState.CONNECTED;
        this.doAuthenticate(accessToken).then((res) => {
          logger("proxy ws authentication response: %O", res);
          if (isString(res) && res.includes("NOT_AUTHORIZED")) {
            reject(res);
          } else {
            resolve(res);
          }
        });
      };
      socket.onclose = (event) => {
        this.state = ChannelState.DISCONNECTED;
        logger("proxy ws connection closed: ", event?.reason);
        reject(event?.reason);
      };
      socket.onerror = (err) => {
        this.state = ChannelState.ERROR;
        logger("proxy ws socket error: %O", err);
        reject(err);
      };
    });
  }

  private doAuthenticate(
    accessToken: string
  ): Promise<RawLoginResponseBody | null> {
    return this.dispatch<RawLoginResponseBody | null>(
      "authenticate",
      accessToken
    ).promise();
  }

  accountPositions(accountNumber: string): AsyncIterable<PositionsResponse> {
    return this.dispatch<PositionsResponse>(
      "accountPositions",
      accountNumber
    ).iterable();
  }

  cancelAlert(alertId: number): Promise<CancelAlertResponse> {
    return this.dispatch<CancelAlertResponse>("cancelAlert", alertId).promise();
  }

  cancelOrder(orderId: number): Promise<CancelOrderResponse> {
    return this.dispatch<CancelOrderResponse>("cancelOrder", orderId).promise();
  }

  chart(request: ChartRequestParams): AsyncIterable<ChartResponse> {
    return this.dispatch<ChartResponse>("chart", request).iterable();
  }

  createAlert(request: CreateAlertRequestParams): Promise<CreateAlertResponse> {
    return this.dispatch<CreateAlertResponse>("createAlert", request).promise();
  }

  disconnect(): void {
    this.sendMessage({ request: "disconnect" });
  }

  ensureConnected(): void {
    if (this.state !== ChannelState.CONNECTED) {
      throw new Error("Not connected");
    }
  }

  isConnected(): boolean {
    return this.state === ChannelState.CONNECTED;
  }

  isConnecting(): boolean {
    return this.state === ChannelState.CONNECTING;
  }

  lookupAlerts(): AsyncIterable<LookupAlertsResponse> {
    return this.dispatch<LookupAlertsResponse>("lookupAlerts").iterable();
  }

  marketDepth(symbol: string): AsyncIterable<MarketDepthResponse> {
    return this.dispatch<MarketDepthResponse>("marketDepth", symbol).iterable();
  }

  optionChain(symbol: string): Promise<OptionChainResponse> {
    return this.dispatch<OptionChainResponse>("optionChain", symbol).promise();
  }

  optionChainDetails(
    request: OptionChainDetailsRequest
  ): Promise<OptionChainDetailsResponse> {
    return this.dispatch<OptionChainDetailsResponse>(
      "optionChainDetails",
      request
    ).promise();
  }

  optionChainQuotes(symbol: string): AsyncIterable<OptionSeriesQuotesResponse> {
    return this.dispatch<OptionSeriesQuotesResponse>(
      "optionChainQuotes",
      symbol
    ).iterable();
  }

  optionQuotes(
    request: OptionQuotesRequestParams
  ): AsyncIterable<OptionQuotesResponse> {
    return this.dispatch<OptionQuotesResponse>(
      "optionQuotes",
      request
    ).iterable();
  }

  placeOrder(
    request: PlaceLimitOrderRequestParams
  ): Promise<PlaceOrderSnapshotResponse> {
    return this.dispatch<PlaceOrderSnapshotResponse>(
      "placeOrder",
      request
    ).promise();
  }

  quotes(symbols: string[]): AsyncIterable<QuotesResponse> {
    return this.dispatch<QuotesResponse>("quotes", symbols).iterable();
  }

  replaceOrder(
    request: Required<PlaceLimitOrderRequestParams>
  ): Promise<OrderEventsResponse> {
    return this.dispatch<OrderEventsResponse>(
      "replaceOrder",
      request
    ).promise();
  }

  searchInstruments(query: string): Promise<InstrumentSearchResponse> {
    return this.dispatch<InstrumentSearchResponse>(
      "searchInstruments",
      query
    ).promise();
  }

  userProperties(): Promise<UserPropertiesResponse> {
    return this.dispatch<UserPropertiesResponse>("userProperties").promise();
  }

  watchlist(watchlistId: number): Promise<GetWatchlistResponse> {
    return this.dispatch<GetWatchlistResponse>(
      "watchlist",
      watchlistId
    ).promise();
  }

  workingOrders(accountNumber: string): AsyncIterable<OrderEventsResponse> {
    return this.dispatch<OrderEventsResponse>(
      "workingOrders",
      accountNumber
    ).iterable();
  }

  private sendMessage(request: ProxiedRequest) {
    this.ensureConnected();
    this.socket!.send(JSON.stringify(request));
  }

  private dispatch<T>(req: Request, args?: any): Observable<T> {
    this.sendMessage({ request: req, args });
    return deferredWrap<ProxiedResponse>(() => this.iterator)
      .filter(({ request }) => request === req)
      .map(({ response }) => response as T);
  }
}

function dateReviver(_: string, value: any): any {
  if (typeof value === "string") {
    // Regular expression to check if the string matches ISO 8601 date format
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    if (isoDateRegex.test(value)) {
      return new Date(value);
    }
  }
  return value; // return the value unchanged if not a date string
}
