import WebSocket from "isomorphic-ws";
import {
  ChartRequestParams,
  CreateAlertRequestParams,
  newAccountPositionsRequest,
  newCancelAlertRequest,
  newCancelOrderRequest,
  newChartRequest,
  newConnectionRequest,
  newCreateAlertRequest,
  newInstrumentSearchRequest,
  newLoginRequest,
  newOptionChainRequest,
  newPlaceLimitOrderRequest,
  newQuotesRequest,
  newSubmitLimitOrderRequest,
  newUserPropertiesRequest,
  PlaceLimitOrderRequestParams,
} from "./messageBuilder";
import {
  LoginResponse,
  LoginResponseBody,
  ParsedWebSocketResponse,
  RawPayloadRequest,
  WsJsonRawMessage,
} from "./tdaWsJsonTypes";
import { debugLog } from "./util";
import ResponseParser, {
  MessageServiceToParserMapping,
} from "./responseParser";
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
  isSuccessful,
  isUserPropertiesResponse,
} from "./messageTypeHelpers";
import { deferredWrap } from "obgen";
import { parseQuotesResponse, QuotesResponse } from "./types/quoteTypes";
import Observable from "obgen/observable";
import {
  parsePositionsResponse,
  PositionsResponse,
} from "./types/positionsTypes";
import {
  parseUserPropertiesResponse,
  RawPayloadResponseUserProperties,
} from "./types/userPropertiesTypes";
import {
  OrderEventsPatchResponse,
  parseOrderEventsResponse,
} from "./types/orderEventTypes";
import debug from "debug";
import { CancelOrderResponse } from "./types/placeOrderTypes";
import {
  AlertsResponse,
  parseCancelAlertResponse,
  parseCreateAlertResponse,
  parseLookupAlertsResponse,
  parseSubscribeToAlertResponse,
} from "./types/alertTypes";
import {
  InstrumentSearchResponse,
  parseInstrumentSearchResponse,
} from "./types/instrumentSearchTypes";
import {
  OptionChainResponse,
  parseOptionChainResponse,
} from "./types/optionChainTypes";
import OptionChainDetailsService, {
  isOptionChainDetailsResponse,
  OptionChainDetailsResponse,
} from "./services/optionChainDetailsService";
import MessageServiceDefinition from "./services/messageServiceDefinition";
import CancelAlertService from "./services/cancelAlertService";
import CreateAlertService from "./services/createAlertService";
import AlertLookupService from "./services/alertLookupService";
import SubscribeToAlertService from "./services/subscribeToAlertService";
import OptionQuotesService from "./services/optionQuotesService";
import ChartService from "./services/chartService";
import InstrumentSearchService from "./services/instrumentSearchService";
import CancelOrderService from "./services/cancelOrderService";
import OptionSeriesService from "./services/optionSeriesService";
import OrderEventsService from "./services/orderEventsService";
import PositionsService from "./services/positionsService";
import QuotesService from "./services/quotesService";
import UserPropertiesService from "./services/userPropertiesService";
import PlaceOrderService from "./services/placeOrderService";

enum ChannelState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  ERROR,
}

const logger = debug("ws");
type ApiService =
  | "cancel_order"
  | "chart"
  | "order_events"
  | "instrument_search"
  | "optionSeries"
  | "option_chain/get"
  | "positions"
  | "place_order"
  | "quotes"
  | "quotes/options"
  | "user_properties"
  | "alerts/create"
  | "alerts/cancel"
  | "alerts/subscribe"
  | "alerts/lookup";

const RESPONSE_MESSAGE_PARSERS: MessageServiceToParserMapping = {
  order_events: parseOrderEventsResponse,
  instrument_search: parseInstrumentSearchResponse,
  optionSeries: parseOptionChainResponse,
  positions: parsePositionsResponse,
  quotes: parseQuotesResponse,
  // "quotes/options": parseOptionQuotesResponse,
  user_properties: parseUserPropertiesResponse,
  "alerts/create": parseCreateAlertResponse,
  "alerts/cancel": parseCancelAlertResponse,
  "alerts/subscribe": parseSubscribeToAlertResponse,
  "alerts/lookup": parseLookupAlertsResponse,
};

const SERVICES: Record<ApiService, MessageServiceDefinition<any, any>> = {
  "alerts/cancel": new CancelAlertService(),
  "alerts/create": new CreateAlertService(),
  "alerts/lookup": new AlertLookupService(),
  "alerts/subscribe": new SubscribeToAlertService(),
  "quotes/options": new OptionQuotesService(),
  cancel_order: new CancelOrderService(),
  chart: new ChartService(),
  instrument_search: new InstrumentSearchService(),
  optionSeries: new OptionSeriesService(),
  order_events: new OrderEventsService(),
  place_order: new PlaceOrderService(),
  positions: new PositionsService(),
  quotes: new QuotesService(),
  user_properties: new UserPropertiesService(),
  "option_chain/get": new OptionChainDetailsService(),
};

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
      Object.values(SERVICES)
    )
  ) {}

  async authenticate(): Promise<LoginResponseBody | null> {
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

  private doConnect(): Promise<LoginResponseBody> {
    const { socket } = this;
    return new Promise((resolve, reject) => {
      if (socket.readyState === WebSocket.OPEN) {
        this.sendMessage(newConnectionRequest());
      }
      socket.onopen = () => this.sendMessage(newConnectionRequest());
      socket.onclose = () => debugLog("connection closed");
      socket.onmessage = ({ data }) =>
        this.onMessage(data as string, resolve, reject);
    });
  }

  private onMessage(
    data: string,
    resolve: (value: LoginResponseBody) => void,
    reject: (reason?: any) => void
  ) {
    const { responseParser, buffer, accessToken } = this;
    const message = JSON.parse(data) as WsJsonRawMessage;
    logger("⬅️\treceived %O", message);
    if (isConnectionResponse(message)) {
      const loginMessage = newLoginRequest(accessToken);
      this.sendMessage(loginMessage);
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
    return this.dispatch(() => newQuotesRequest(symbols))
      .filter(isQuotesResponse)
      .iterable() as AsyncIterable<QuotesResponse>;
  }

  accountPositions(accountNumber: string): AsyncIterable<PositionsResponse> {
    return this.dispatch(() => newAccountPositionsRequest(accountNumber))
      .filter(isPositionsResponse)
      .iterable() as AsyncIterable<PositionsResponse>;
  }

  chart(request: ChartRequestParams): AsyncIterable<ChartResponse> {
    return this.dispatch(() => newChartRequest(request))
      .filter(isChartResponse)
      .iterable() as AsyncIterable<ChartResponse>;
  }

  searchInstruments(query: string): AsyncIterable<InstrumentSearchResponse> {
    return this.dispatch(() => newInstrumentSearchRequest(query))
      .filter(isInstrumentsResponse)
      .iterable() as AsyncIterable<InstrumentSearchResponse>;
  }

  optionChain(symbol: string): Promise<OptionChainResponse> {
    return this.dispatch(() => newOptionChainRequest(symbol))
      .filter(isOptionChainResponse)
      .promise() as Promise<OptionChainResponse>;
  }

  optionChainDetails(
    symbol: string,
    seriesNames: string[]
  ): Promise<OptionChainDetailsResponse> {
    const service = SERVICES["option_chain/get"];
    const fn = () => service.sendRequest({ symbol, seriesNames });
    return this.dispatch(fn)
      .filter(isOptionChainDetailsResponse)
      .promise() as Promise<OptionChainDetailsResponse>;
  }

  async placeOrder(
    request: PlaceLimitOrderRequestParams
  ): Promise<AsyncIterable<OrderEventsPatchResponse>> {
    // 1. place order
    await this.dispatch(() => newPlaceLimitOrderRequest(request))
      .filter(isPlaceOrderResponse)
      .promise();
    // 2. submit order
    return this.dispatch(() => newSubmitLimitOrderRequest(request))
      .filter(isOrderEventsPatchResponse)
      .iterable() as AsyncIterable<OrderEventsPatchResponse>;
  }

  createAlert(request: CreateAlertRequestParams): Promise<AlertsResponse> {
    return this.dispatch(() => newCreateAlertRequest(request))
      .filter(isAlertsResponse)
      .promise() as Promise<AlertsResponse>;
  }

  cancelAlert(alertId: number): Promise<AlertsResponse> {
    return this.dispatch(() => newCancelAlertRequest(alertId))
      .filter(isAlertsResponse)
      .promise() as Promise<AlertsResponse>;
  }

  cancelOrder(orderId: number): Promise<CancelOrderResponse> {
    return this.dispatch(() => newCancelOrderRequest(orderId))
      .filter(isCancelOrderResponse)
      .promise() as Promise<CancelOrderResponse>;
  }

  userProperties(): Promise<RawPayloadResponseUserProperties> {
    return this.dispatch(() => newUserPropertiesRequest())
      .filter(isUserPropertiesResponse)
      .promise() as Promise<RawPayloadResponseUserProperties>;
  }

  private dispatch(
    fn: () => RawPayloadRequest
  ): Observable<ParsedWebSocketResponse> {
    this.ensureConnected();
    this.sendMessage(fn());
    return deferredWrap(() => this.iterator);
  }

  private sendMessage(data: any) {
    logger("➡️\tsending %O", data);
    const msg = JSON.stringify(data);
    this.socket?.send(msg);
  }

  private handleLoginResponse(
    message: LoginResponse,
    resolve: (value: LoginResponseBody) => void,
    reject: (reason?: any) => void
  ) {
    const body = message?.payload?.[0]?.body;
    if (isSuccessful(message)) {
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
