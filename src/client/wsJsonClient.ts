import WebSocket from "isomorphic-ws";
import {
  ParsedWebSocketResponse,
  RawPayloadResponse,
  WsJsonRawMessage,
} from "./tdaWsJsonTypes";
import { Constructor, debugLog, findByTypeOrThrow } from "./util";
import MulticastIterator from "obgen/multicastIterator";
import BufferedIterator from "obgen/bufferedIterator";
import {
  isAlertsResponse,
  isCancelOrderResponse,
  isChartResponse,
  isConnectionResponse,
  isInstrumentsResponse,
  isLoginResponse,
  isOptionChainResponse,
  isOptionQuotesResponse,
  isOrderEventsPatchResponse,
  isOrderEventsSnapshotResponse,
  isPlaceOrderResponse,
  isPositionsResponse,
  isQuotesResponse,
  isUserPropertiesResponse,
} from "./messageTypeHelpers";
import { deferredWrap } from "obgen";
import debug from "debug";
import Observable from "obgen/observable";
import OptionChainDetailsMessageHandler, {
  isOptionChainDetailsResponse,
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
import CancelOrderMessageHandler from "./services/cancelOrderMessageHandler";
import OptionSeriesMessageHandler, {
  OptionChainResponse,
} from "./services/optionSeriesMessageHandler";
import OrderEventsMessageHandler, {
  OrderEventsPatchResponse,
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
} from "./services/placeOrderMessageHandler";
import WebSocketApiMessageHandler from "./services/webSocketApiMessageHandler";
import ResponseParser from "./responseParser";
import { AlertsResponse } from "./types/alertTypes";
import { CancelOrderResponse } from "./types/placeOrderTypes";
import LoginMessageHandler, {
  RawLoginResponse,
  RawLoginResponseBody,
} from "./services/loginMessageHandler";
import SubmitOrderMessageHandler from "./services/submitOrderMessageHandler";
import WorkingOrdersMessageHandler from "./services/workingOrdersMessageHandler";

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

const logger = debug("ws");

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
  new OrderEventsMessageHandler(),
  new PlaceOrderMessageHandler(),
  new PositionsMessageHandler(),
  new QuotesMessageHandler(),
  new UserPropertiesMessageHandler(),
  new OptionChainDetailsMessageHandler(),
  new LoginMessageHandler(),
];

export default class WsJsonClient {
  private buffer = new BufferedIterator<ParsedWebSocketResponse>();
  private iterator = new MulticastIterator(this.buffer);
  private state = ChannelState.DISCONNECTED;

  constructor(
    private readonly accessToken: string,
    private readonly socket = new WebSocket(
      "wss://services.thinkorswim.com/Services/WsJson"
    ),
    private readonly responseParser = new ResponseParser(
      messageHandlers as WebSocketApiMessageHandler<any, any>[]
    )
  ) {}

  async authenticate(): Promise<RawLoginResponseBody | null> {
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
      socket.onclose = () => debugLog("connection closed");
      socket.onmessage = ({ data }) =>
        this.onMessage(data as string, resolve, reject);
    });
  }

  private onMessage(
    data: string,
    resolve: (value: RawLoginResponseBody) => void,
    // eslint-disable-line @typescript-eslint/no-explicit-any
    reject: (reason?: any) => void
  ) {
    const { responseParser, buffer, accessToken } = this;
    const message = JSON.parse(data) as WsJsonRawMessage;
    logger("⬅️\treceived %O", message);
    if (isConnectionResponse(message)) {
      const handler = findByTypeOrThrow(messageHandlers, LoginMessageHandler);
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

  private ensureConnected() {
    if (this.state !== ChannelState.CONNECTED) {
      throw new Error("Please call connect() first");
    }
  }

  quotes(symbols: string[]): AsyncIterable<QuotesResponse> {
    return this.dispatchHandler(QuotesMessageHandler, symbols)
      .filter(isQuotesResponse)
      .iterable() as AsyncIterable<QuotesResponse>;
  }

  accountPositions(accountNumber: string): AsyncIterable<PositionsResponse> {
    return this.dispatchHandler(PositionsMessageHandler, accountNumber)
      .filter(isPositionsResponse)
      .iterable() as AsyncIterable<PositionsResponse>;
  }

  chart(request: ChartRequestParams): AsyncIterable<ChartResponse> {
    return this.dispatchHandler(ChartMessageHandler, request)
      .filter(isChartResponse)
      .iterable() as AsyncIterable<ChartResponse>;
  }

  searchInstruments(query: string): Promise<InstrumentSearchResponse> {
    return this.dispatchHandler(InstrumentSearchMessageHandler, { query })
      .filter(isInstrumentsResponse)
      .promise() as Promise<InstrumentSearchResponse>;
  }

  lookupAlerts(): AsyncIterable<AlertsResponse> {
    return this.dispatchHandler(AlertLookupMessageHandler, null as never)
      .filter(isAlertsResponse)
      .iterable() as AsyncIterable<AlertsResponse>;
  }

  optionChain(symbol: string): Promise<OptionChainResponse> {
    return this.dispatchHandler(OptionSeriesMessageHandler, symbol)
      .filter(isOptionChainResponse)
      .promise() as Promise<OptionChainResponse>;
  }

  optionChainDetails(
    request: OptionChainDetailsRequest
  ): Promise<OptionChainDetailsResponse> {
    return this.dispatchHandler(OptionChainDetailsMessageHandler, request)
      .filter(isOptionChainDetailsResponse)
      .promise() as Promise<OptionChainDetailsResponse>;
  }

  optionQuotes(
    request: OptionQuotesRequestParams
  ): AsyncIterable<OptionQuotesResponse> {
    return this.dispatchHandler(OptionQuotesMessageHandler, request)
      .filter(isOptionQuotesResponse)
      .iterable() as AsyncIterable<OptionQuotesResponse>;
  }

  async placeOrder(
    request: PlaceLimitOrderRequestParams
  ): Promise<AsyncIterable<OrderEventsPatchResponse>> {
    // 1. place order
    await this.dispatchHandler(PlaceOrderMessageHandler, request)
      .filter(isPlaceOrderResponse)
      .promise();
    // 2. submit order
    return this.dispatchHandler(SubmitOrderMessageHandler, request)
      .filter(isOrderEventsPatchResponse)
      .iterable() as AsyncIterable<OrderEventsPatchResponse>;
  }

  workingOrders(accountNumber: string): AsyncIterable<OrderEventsResponse> {
    const handler = new WorkingOrdersMessageHandler();
    const isOrderEventsResponse = (r: ParsedWebSocketResponse) =>
      isOrderEventsSnapshotResponse(r) || isOrderEventsPatchResponse(r);
    return this.dispatch(handler, accountNumber)
      .filter(isOrderEventsResponse)
      .iterable() as AsyncIterable<OrderEventsResponse>;
  }

  createAlert(request: CreateAlertRequestParams): Promise<AlertsResponse> {
    return this.dispatchHandler(CreateAlertMessageHandler, request)
      .filter(isAlertsResponse)
      .promise() as Promise<AlertsResponse>;
  }

  cancelAlert(alertId: number): Promise<AlertsResponse> {
    return this.dispatchHandler(CancelAlertMessageHandler, alertId)
      .filter(isAlertsResponse)
      .promise() as Promise<AlertsResponse>;
  }

  cancelOrder(orderId: number): Promise<CancelOrderResponse> {
    return this.dispatchHandler(CancelOrderMessageHandler, orderId)
      .filter(isCancelOrderResponse)
      .promise() as Promise<CancelOrderResponse>;
  }

  userProperties(): Promise<UserPropertiesResponse> {
    return this.dispatchHandler(UserPropertiesMessageHandler, null as never)
      .filter(isUserPropertiesResponse)
      .promise() as Promise<UserPropertiesResponse>;
  }

  // This method should probably be kept private but is called in tests. There's no real reason for anyone to call this
  // directly, except maybe if there's a new service that's not yet implemented by one of the existing MessageHandlers
  // that you want to create and instantiate yourself. Use at your own risk.
  dispatch<Req, Res>(
    handler: WebSocketApiMessageHandler<Req, Res>,
    args: Req
  ): Observable<ParsedWebSocketResponse> {
    this.ensureConnected();
    this.sendMessage(handler.buildRequest(args));
    return deferredWrap(() => this.iterator);
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
    // eslint-disable-line @typescript-eslint/no-explicit-any
    reject: (reason?: any) => void
  ) {
    const handler = findByTypeOrThrow(messageHandlers, LoginMessageHandler);
    const successful = handler.parseResponse(message as RawPayloadResponse);
    const [{ body }] = message.payload;
    if (successful) {
      this.state = ChannelState.CONNECTED;
      resolve(body);
    } else {
      this.state = ChannelState.ERROR;
      reject(`Login failed: ${body.message}`);
    }
  }

  private dispatchHandler<Req, Res>(
    handler: Constructor<WebSocketApiMessageHandler<Req, Res>>,
    arg: Req
  ): Observable<ParsedWebSocketResponse> {
    const service = findByTypeOrThrow(messageHandlers, handler);
    return this.dispatch(service, arg);
  }

  disconnect() {
    this.socket?.close();
    this.state = ChannelState.DISCONNECTED;
    // This ensures that listeners will resolve the promise cleanly from any `for await` loops
    this.buffer.end();
  }
}
