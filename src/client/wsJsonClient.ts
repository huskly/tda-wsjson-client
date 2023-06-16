import WebSocket from "isomorphic-ws";
import {
  ParsedWebSocketResponse,
  RawPayloadResponse,
  WsJsonRawMessage,
} from "./tdaWsJsonTypes";
import { debugLog } from "./util";
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
  isOrderEventsPatchResponse,
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
import OptionQuotesMessageHandler from "./services/optionQuotesMessageHandler";
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
import { ApiService } from "./services/apiService";
import { keyBy } from "lodash";
import ResponseParser from "./responseParser";
import {
  CONNECTION_REQUEST_MESSAGE,
  newSubmitLimitOrderRequest,
} from "./messageBuilder";
import { AlertsResponse } from "./types/alertTypes";
import { CancelOrderResponse } from "./types/placeOrderTypes";
import LoginMessageHandler, {
  RawLoginResponse,
  RawLoginResponseBody,
} from "./services/loginMessageHandler";

export enum ChannelState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  ERROR,
}

const logger = debug("ws");

const DEFAULT_MESSAGE_HANDLERS = keyBy(
  [
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
  ],
  (s) => s.service
) as Record<ApiService, WebSocketApiMessageHandler<any, any>>;

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
      DEFAULT_MESSAGE_HANDLERS
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
      const handler = DEFAULT_MESSAGE_HANDLERS["login"];
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

  private ensureConnected() {
    if (this.state !== ChannelState.CONNECTED) {
      throw new Error("Please call connect() first");
    }
  }

  quotes(symbols: string[]): AsyncIterable<QuotesResponse> {
    const handler = DEFAULT_MESSAGE_HANDLERS["quotes"];
    return this.dispatch(handler, symbols)
      .filter(isQuotesResponse)
      .iterable() as AsyncIterable<QuotesResponse>;
  }

  accountPositions(accountNumber: string): AsyncIterable<PositionsResponse> {
    const handler = DEFAULT_MESSAGE_HANDLERS["positions"];
    return this.dispatch(handler, accountNumber)
      .filter(isPositionsResponse)
      .iterable() as AsyncIterable<PositionsResponse>;
  }

  chart(request: ChartRequestParams): AsyncIterable<ChartResponse> {
    const handler = DEFAULT_MESSAGE_HANDLERS["chart"];
    return this.dispatch(handler, request)
      .filter(isChartResponse)
      .iterable() as AsyncIterable<ChartResponse>;
  }

  searchInstruments(query: string): AsyncIterable<InstrumentSearchResponse> {
    const handler = DEFAULT_MESSAGE_HANDLERS["instrument_search"];
    return this.dispatch(handler, query)
      .filter(isInstrumentsResponse)
      .iterable() as AsyncIterable<InstrumentSearchResponse>;
  }

  optionChain(symbol: string): Promise<OptionChainResponse> {
    const handler = DEFAULT_MESSAGE_HANDLERS["optionSeries"];
    return this.dispatch(handler, symbol)
      .filter(isOptionChainResponse)
      .promise() as Promise<OptionChainResponse>;
  }

  optionChainDetails(
    request: OptionChainDetailsRequest
  ): Promise<OptionChainDetailsResponse> {
    const service = DEFAULT_MESSAGE_HANDLERS["option_chain/get"];
    return this.dispatch(service, request)
      .filter(isOptionChainDetailsResponse)
      .promise() as Promise<OptionChainDetailsResponse>;
  }

  async placeOrder(
    request: PlaceLimitOrderRequestParams
  ): Promise<AsyncIterable<OrderEventsPatchResponse>> {
    // 1. place order
    const service = DEFAULT_MESSAGE_HANDLERS["place_order"];
    await this.dispatch(service, request)
      .filter(isPlaceOrderResponse)
      .promise();
    // 2. submit order
    return this.dispatch(() => newSubmitLimitOrderRequest(request))
      .filter(isOrderEventsPatchResponse)
      .iterable() as AsyncIterable<OrderEventsPatchResponse>;
  }

  createAlert(request: CreateAlertRequestParams): Promise<AlertsResponse> {
    const service = DEFAULT_MESSAGE_HANDLERS["alerts/create"];
    return this.dispatch(service, request)
      .filter(isAlertsResponse)
      .promise() as Promise<AlertsResponse>;
  }

  cancelAlert(alertId: number): Promise<AlertsResponse> {
    const service = DEFAULT_MESSAGE_HANDLERS["alerts/cancel"];
    return this.dispatch(service, alertId)
      .filter(isAlertsResponse)
      .promise() as Promise<AlertsResponse>;
  }

  cancelOrder(orderId: number): Promise<CancelOrderResponse> {
    const service = DEFAULT_MESSAGE_HANDLERS["cancel_order"];
    return this.dispatch(service, orderId)
      .filter(isCancelOrderResponse)
      .promise() as Promise<CancelOrderResponse>;
  }

  userProperties(): Promise<UserPropertiesResponse> {
    const service = DEFAULT_MESSAGE_HANDLERS["user_properties"];
    return this.dispatch(service, null)
      .filter(isUserPropertiesResponse)
      .promise() as Promise<UserPropertiesResponse>;
  }

  private dispatch<Req, Res>(
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
    const handler = DEFAULT_MESSAGE_HANDLERS["login"];
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

  disconnect() {
    this.socket?.close();
    this.state = ChannelState.DISCONNECTED;
    // This ensures that listeners will resolve the promise cleanly from any `for await` loops
    this.buffer.end();
  }
}
