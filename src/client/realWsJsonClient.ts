import WebSocket from "isomorphic-ws";
import {
  MessageHandlerBaseResponse,
  ParsedWebSocketResponse,
  RawPayloadResponse,
  WsJsonRawMessage,
} from "./tdaWsJsonTypes";
import { Constructor, debugLog, findByTypeOrThrow, throwError } from "./util";
import MulticastIterator from "obgen/multicastIterator";
import BufferedIterator from "obgen/bufferedIterator";
import { isConnectionResponse, isLoginResponse } from "./messageTypeHelpers";
import { deferredWrap } from "obgen";
import debug from "debug";
import Observable from "obgen/observable";
import OptionChainDetailsMessageHandler, {
  OptionChainDetailsRequest,
  OptionChainDetailsResponse,
} from "./services/optionChainDetailsMessageHandler";
import CancelAlertMessageHandler from "./services/cancelAlertMessageHandler";
import CreateAlertMessageHandler, {
  CreateAlertRequestParams,
} from "./services/createAlertMessageHandler";
import AlertLookupMessageHandler from "./services/alertLookupMessageHandler";
import SubscribeToAlertMessageHandler from "./services/subscribeToAlertMessageHandler";
import OptionQuotesMessageHandler, {
  OptionQuotesRequestParams,
  OptionQuotesResponse,
} from "./services/optionQuotesMessageHandler";
import ChartMessageHandler, {
  ChartRequestParams,
  ChartResponse,
} from "./services/chartMessageHandler";
import InstrumentSearchMessageHandler, {
  InstrumentSearchResponse,
} from "./services/instrumentSearchMessageHandler";
import CancelOrderMessageHandler, {
  CancelOrderResponse,
} from "./services/cancelOrderMessageHandler";
import OptionSeriesMessageHandler, {
  OptionChainResponse,
} from "./services/optionSeriesMessageHandler";
import OrderEventsMessageHandler, {
  OrderEventsResponse,
} from "./services/orderEventsMessageHandler";
import PositionsMessageHandler, {
  PositionsResponse,
} from "./services/positionsMessageHandler";
import QuotesMessageHandler, {
  QuotesResponse,
} from "./services/quotesMessageHandler";
import UserPropertiesMessageHandler, {
  UserPropertiesResponse,
} from "./services/userPropertiesMessageHandler";
import PlaceOrderMessageHandler, {
  PlaceLimitOrderRequestParams,
  PlaceOrderSnapshotResponse,
} from "./services/placeOrderMessageHandler";
import WebSocketApiMessageHandler from "./services/webSocketApiMessageHandler";
import ResponseParser from "./responseParser";
import LoginMessageHandler, {
  RawLoginResponse,
  RawLoginResponseBody,
} from "./services/loginMessageHandler";
import SubmitOrderMessageHandler from "./services/submitOrderMessageHandler";
import WorkingOrdersMessageHandler from "./services/workingOrdersMessageHandler";
import OptionSeriesQuotesMessageHandler, {
  OptionSeriesQuotesResponse,
} from "./services/optionSeriesQuotesMessageHandler";
import { WsJsonClient } from "./wsJsonClient";
import MarketDepthMessageHandler, {
  MarketDepthResponse,
} from "./services/marketDepthMessageHandler";
import {
  CancelAlertResponse,
  CreateAlertResponse,
  LookupAlertsResponse,
} from "./types/alertTypes";
import GetWatchlistMessageHandler, {
  GetWatchlistResponse,
} from "./services/getWatchlistMessageHandler";

export const CONNECTION_REQUEST_MESSAGE = {
  ver: "27.*.*",
  fmt: "json-patches-structured",
  heartbeat: "2s",
};

export enum ChannelState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  ERROR,
}

const logger = debug("realWsJsonClient");

const messageHandlers: WebSocketApiMessageHandler<never, any>[] = [
  new CancelAlertMessageHandler(),
  new CreateAlertMessageHandler(),
  new AlertLookupMessageHandler(),
  new SubscribeToAlertMessageHandler(),
  new OptionQuotesMessageHandler(),
  new CancelOrderMessageHandler(),
  new ChartMessageHandler(),
  new InstrumentSearchMessageHandler(),
  new OptionSeriesMessageHandler(),
  new OptionSeriesQuotesMessageHandler(),
  new OrderEventsMessageHandler(),
  new PlaceOrderMessageHandler(),
  new PositionsMessageHandler(),
  new QuotesMessageHandler(),
  new UserPropertiesMessageHandler(),
  new OptionChainDetailsMessageHandler(),
  new LoginMessageHandler(),
  new SubmitOrderMessageHandler(),
  new MarketDepthMessageHandler(),
  new GetWatchlistMessageHandler(),
];

export default class RealWsJsonClient implements WsJsonClient {
  private buffer = new BufferedIterator<ParsedWebSocketResponse>();
  private iterator = new MulticastIterator(this.buffer);
  private state = ChannelState.DISCONNECTED;
  private accessToken?: string;

  constructor(
    private readonly socket = new WebSocket(
      "wss://services.thinkorswim.com/Services/WsJson",
      {
        headers: {
          Pragma: "no-cache",
          Origin: "https://trade.thinkorswim.com",
          "Accept-Language": "en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7,es;q=0.6",
          "Sec-WebSocket-Key": "MlZmMN1jaOpKsmb/eJSHCg==",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
          Upgrade: "websocket",
          "Cache-Control": "no-cache",
          Connection: "Upgrade",
          "Sec-WebSocket-Version": "13",
          "Sec-WebSocket-Extensions":
            "permessage-deflate; client_max_window_bits",
        },
      }
    ),
    private readonly responseParser = new ResponseParser(
      messageHandlers as WebSocketApiMessageHandler<any, any>[]
    )
  ) {}

  async authenticate(
    accessToken: string
  ): Promise<RawLoginResponseBody | null> {
    this.accessToken = accessToken;
    const { state } = this;
    switch (state) {
      case ChannelState.DISCONNECTED:
        this.buffer = new BufferedIterator<ParsedWebSocketResponse>();
        this.iterator = new MulticastIterator(this.buffer);
        this.state = ChannelState.CONNECTING;
        return await this.doConnect();
      case ChannelState.CONNECTING: // no-op
        return Promise.reject("Already connecting");
      case ChannelState.CONNECTED: // no-op
        return Promise.reject("Already connected");
      case ChannelState.ERROR:
        return Promise.reject("Illegal state, ws connection failed previously");
    }
  }

  private doConnect(): Promise<RawLoginResponseBody> {
    const { socket } = this;
    return new Promise((resolve, reject) => {
      if (socket.readyState === WebSocket.OPEN) {
        this.sendMessage(CONNECTION_REQUEST_MESSAGE);
      }
      socket.onopen = () => this.sendMessage(CONNECTION_REQUEST_MESSAGE);
      socket.onclose = (event) =>
        debugLog("connection closed: ", event?.reason);
      socket.onmessage = ({ data }) =>
        this.onMessage(data as string, resolve, reject);
    });
  }

  private onMessage(
    data: string,
    resolve: (value: RawLoginResponseBody) => void,
    reject: (reason?: string) => void
  ) {
    const { responseParser, buffer, accessToken } = this;
    const message = JSON.parse(data) as WsJsonRawMessage;
    logger("⬅️\treceived %O", message);
    if (isConnectionResponse(message)) {
      const handler = findByTypeOrThrow(messageHandlers, LoginMessageHandler);
      if (!accessToken) {
        throwError("access token is required, cannot authenticate");
      }
      this.sendMessage(handler.buildRequest(accessToken));
    } else if (isLoginResponse(message)) {
      this.handleLoginResponse(message, resolve, reject);
    } else {
      const parsedResponse = responseParser.parseResponse(message);
      if (parsedResponse) {
        buffer.emit(parsedResponse);
      }
    }
  }

  isConnected(): boolean {
    const { socket, state } = this;
    return socket !== null && state === ChannelState.CONNECTED;
  }

  isConnecting(): boolean {
    const { socket, state } = this;
    return socket !== null && state === ChannelState.CONNECTING;
  }

  ensureConnected() {
    if (this.state !== ChannelState.CONNECTED) {
      throw new Error("Please call connect() first");
    }
  }

  quotes(symbols: string[]): AsyncIterable<QuotesResponse> {
    return this.dispatchHandler(QuotesMessageHandler, symbols).iterable();
  }

  accountPositions(accountNumber: string): AsyncIterable<PositionsResponse> {
    return this.dispatchHandler(
      PositionsMessageHandler,
      accountNumber
    ).iterable();
  }

  chart(request: ChartRequestParams): AsyncIterable<ChartResponse> {
    return this.dispatchHandler(ChartMessageHandler, request).iterable();
  }

  searchInstruments(query: string): Promise<InstrumentSearchResponse> {
    return this.dispatchHandler(InstrumentSearchMessageHandler, {
      query,
    }).promise();
  }

  lookupAlerts(): AsyncIterable<LookupAlertsResponse> {
    return this.dispatchHandler(
      AlertLookupMessageHandler,
      null as never
    ).iterable();
  }

  optionChain(symbol: string): Promise<OptionChainResponse> {
    return this.dispatchHandler(OptionSeriesMessageHandler, symbol).promise();
  }

  optionChainQuotes(symbol: string): AsyncIterable<OptionSeriesQuotesResponse> {
    return this.dispatchHandler(
      OptionSeriesQuotesMessageHandler,
      symbol
    ).iterable();
  }

  optionChainDetails(
    request: OptionChainDetailsRequest
  ): Promise<OptionChainDetailsResponse> {
    return this.dispatchHandler(
      OptionChainDetailsMessageHandler,
      request
    ).promise();
  }

  optionQuotes(
    request: OptionQuotesRequestParams
  ): AsyncIterable<OptionQuotesResponse> {
    return this.dispatchHandler(OptionQuotesMessageHandler, request).iterable();
  }

  async placeOrder(
    request: PlaceLimitOrderRequestParams
  ): Promise<PlaceOrderSnapshotResponse> {
    // 1. place order
    await this.dispatchHandler(PlaceOrderMessageHandler, request).promise();
    // 2. submit order
    // noinspection ES6MissingAwait
    return this.dispatchHandler(SubmitOrderMessageHandler, request).promise();
  }

  replaceOrder(
    request: Required<PlaceLimitOrderRequestParams>
  ): Promise<OrderEventsResponse> {
    return this.dispatchHandler(SubmitOrderMessageHandler, request).promise();
  }

  workingOrders(accountNumber: string): AsyncIterable<OrderEventsResponse> {
    const handler = new WorkingOrdersMessageHandler();
    return this.dispatch(handler, accountNumber).iterable();
  }

  createAlert(request: CreateAlertRequestParams): Promise<CreateAlertResponse> {
    return this.dispatchHandler(CreateAlertMessageHandler, request).promise();
  }

  cancelAlert(alertId: number): Promise<CancelAlertResponse> {
    return this.dispatchHandler(CancelAlertMessageHandler, alertId).promise();
  }

  cancelOrder(orderId: number): Promise<CancelOrderResponse> {
    return this.dispatchHandler(CancelOrderMessageHandler, orderId).promise();
  }

  watchlist(watchlistId: number): Promise<GetWatchlistResponse> {
    return this.dispatchHandler(
      GetWatchlistMessageHandler,
      watchlistId
    ).promise();
  }

  userProperties(): Promise<UserPropertiesResponse> {
    return this.dispatchHandler(
      UserPropertiesMessageHandler,
      null as never
    ).promise();
  }

  marketDepth(symbol: string): AsyncIterable<MarketDepthResponse> {
    return this.dispatchHandler(
      MarketDepthMessageHandler,
      symbol
    ).iterable() as AsyncIterable<MarketDepthResponse>;
  }

  private dispatch<Req, Res extends MessageHandlerBaseResponse | null>(
    handler: WebSocketApiMessageHandler<Req, Res>,
    args: Req
  ): Observable<NonNullable<Res>> {
    this.ensureConnected();
    this.sendMessage(handler.buildRequest(args));
    return deferredWrap(() => this.iterator).filter(
      ({ service }) => service === handler.service
    ) as Observable<NonNullable<Res>>;
  }

  // eslint-disable-line @typescript-eslint/no-explicit-any
  private sendMessage(data: any) {
    logger("➡️\tsending %O", data);
    const msg = JSON.stringify(data);
    this.socket?.send(msg);
  }

  private handleLoginResponse(
    message: RawLoginResponse,
    resolve: (value: RawLoginResponseBody) => void,
    reject: (reason?: string) => void
  ) {
    const handler = findByTypeOrThrow(messageHandlers, LoginMessageHandler);
    const loginResponse = handler.parseResponse(message as RawPayloadResponse);
    const [{ body }] = message.payload;
    if (loginResponse.successful) {
      this.state = ChannelState.CONNECTED;
      resolve(body);
    } else {
      this.state = ChannelState.ERROR;
      reject(`Login failed: ${body.message}`);
      this.disconnect();
    }
  }

  private dispatchHandler<Req, Res extends MessageHandlerBaseResponse | null>(
    handlerCtor: Constructor<WebSocketApiMessageHandler<Req, Res>>,
    arg: Req
  ): Observable<NonNullable<Res>> {
    const handler = findByTypeOrThrow(messageHandlers, handlerCtor);
    return this.dispatch(handler, arg);
  }

  disconnect() {
    this.socket?.close();
    this.state = ChannelState.DISCONNECTED;
    // This ensures that listeners will resolve the promise cleanly from any `for await` loops
    this.buffer.end();
  }
}
