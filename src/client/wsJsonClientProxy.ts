import { WsJsonClient } from "./wsJsonClient";
import { PositionsResponse } from "./services/positionsMessageHandler";
import { RawLoginResponseBody } from "./services/loginMessageHandler";
import {
  CancelAlertResponse,
  CreateAlertResponse,
  LookupAlertsResponse,
} from "./types/alertTypes";
import { CancelOrderResponse } from "./services/cancelOrderMessageHandler";
import {
  ChartRequestParams,
  ChartResponse,
} from "./services/chartMessageHandler";
import { CreateAlertRequestParams } from "./services/createAlertMessageHandler";
import { MarketDepthResponse } from "./services/marketDepthMessageHandler";
import { OptionChainResponse } from "./services/optionSeriesMessageHandler";
import {
  OptionChainDetailsRequest,
  OptionChainDetailsResponse,
} from "./services/optionChainDetailsMessageHandler";
import { OptionSeriesQuotesResponse } from "./services/optionSeriesQuotesMessageHandler";
import {
  OptionQuotesRequestParams,
  OptionQuotesResponse,
} from "./services/optionQuotesMessageHandler";
import {
  PlaceLimitOrderRequestParams,
  PlaceOrderSnapshotResponse,
} from "./services/placeOrderMessageHandler";
import { QuotesResponse } from "./services/quotesMessageHandler";
import { OrderEventsResponse } from "./services/orderEventsMessageHandler";
import { InstrumentSearchResponse } from "./services/instrumentSearchMessageHandler";
import { UserPropertiesResponse } from "./services/userPropertiesMessageHandler";
import { GetWatchlistResponse } from "./services/getWatchlistMessageHandler";
import WebSocket from "isomorphic-ws";
import MulticastIterator from "obgen/multicastIterator";
import BufferedIterator from "obgen/bufferedIterator";
import { deferredWrap } from "obgen";
import { throwError } from "./util";
import debug from "debug";
import { ChannelState } from "./realWsJsonClient";

const logger = debug("wsClientProxy");

type ProxiedResponse = { request: string; args: any[]; response: unknown };

export default class WsJsonClientProxy implements WsJsonClient {
  private state = ChannelState.DISCONNECTED;
  private buffer = new BufferedIterator<ProxiedResponse>();
  private iterator = new MulticastIterator(this.buffer);
  private socket?: WebSocket;

  constructor(
    private readonly proxyUrl: string,
    private readonly options?: any
  ) {}

  accountPositions(_: string): AsyncIterable<PositionsResponse> {
    throwError("not implemented");
  }

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
        buffer.emit(JSON.parse(data as string) as ProxiedResponse);
      };
      socket.onopen = () => {
        logger("proxy ws connection opened");
        this.state = ChannelState.CONNECTED;
        resolve(this.doAuthenticate(accessToken));
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
    const msg = JSON.stringify({
      request: "authenticate",
      args: [accessToken],
    });
    this.ensureConnected();
    this.socket!.send(msg);
    return deferredWrap(() => this.iterator)
      .filter(({ request }) => {
        logger("filtering deferredWrap %s", request);
        return request === "authenticate";
      })
      .map(({ response }) => response)
      .promise() as Promise<RawLoginResponseBody | null>;
  }

  cancelAlert(_: number): Promise<CancelAlertResponse> {
    throwError("not implemented");
  }

  cancelOrder(_: number): Promise<CancelOrderResponse> {
    throwError("not implemented");
  }

  chart(_: ChartRequestParams): AsyncIterable<ChartResponse> {
    throwError("not implemented");
  }

  createAlert(_: CreateAlertRequestParams): Promise<CreateAlertResponse> {
    throwError("not implemented");
  }

  disconnect(): void {}

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
    throwError("not implemented");
  }

  marketDepth(_: string): AsyncIterable<MarketDepthResponse> {
    throwError("not implemented");
  }

  optionChain(_: string): Promise<OptionChainResponse> {
    throwError("not implemented");
  }

  optionChainDetails(
    _: OptionChainDetailsRequest
  ): Promise<OptionChainDetailsResponse> {
    throwError("not implemented");
  }

  optionChainQuotes(symbol: string): AsyncIterable<OptionSeriesQuotesResponse> {
    const msg = JSON.stringify({
      request: "optionChainQuotes",
      args: [symbol],
    });
    this.ensureConnected();
    this.socket!.send(msg);
    return deferredWrap(() => this.iterator)
      .filter(({ request }) => request === "optionChainQuotes")
      .map(({ response }) => response)
      .iterable() as AsyncIterable<OptionSeriesQuotesResponse>;
  }

  optionQuotes(
    _: OptionQuotesRequestParams
  ): AsyncIterable<OptionQuotesResponse> {
    throwError("not implemented");
  }

  placeOrder(
    _: PlaceLimitOrderRequestParams
  ): Promise<PlaceOrderSnapshotResponse> {
    throwError("not implemented");
  }

  quotes(_: string[]): AsyncIterable<QuotesResponse> {
    throwError("not implemented");
  }

  replaceOrder(
    _: Required<PlaceLimitOrderRequestParams>
  ): Promise<OrderEventsResponse> {
    throwError("not implemented");
  }

  searchInstruments(_: string): Promise<InstrumentSearchResponse> {
    throwError("not implemented");
  }

  userProperties(): Promise<UserPropertiesResponse> {
    throwError("not implemented");
  }

  watchlist(_: number): Promise<GetWatchlistResponse> {
    throwError("not implemented");
  }

  workingOrders(_: string): AsyncIterable<OrderEventsResponse> {
    throwError("not implemented");
  }
}
