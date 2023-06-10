import WebSocket from "isomorphic-ws";
import {
  ChartRequestParams,
  newAccountPositionsRequest,
  newChartRequest,
  newConnectionRequest,
  newLoginRequest,
  newQuotesRequest,
  newUserPropertiesRequest,
} from "./messageBuilder";
import {
  LoginResponse,
  LoginResponseBody,
  ParsedWebSocketResponse,
  RawPayloadRequest,
  WsJsonRawMessage,
} from "./tdaWsJsonTypes";
import { debugLog } from "./util";
import ResponseParser from "./responseParser";
import MulticastIterator from "obgen/multicastIterator";
import BufferedIterator from "obgen/bufferedIterator";
import {
  isChartResponse,
  isConnectionResponse,
  isLoginResponse,
  isPositionsResponse,
  isQuotesResponse,
  isSuccessful,
  isUserPropertiesResponse,
} from "./messageTypeHelpers";
import { deferredWrap } from "obgen";
import { QuotesResponse } from "./types/quoteTypes";
import { ChartResponse } from "./types/chartTypes";
import Observable from "obgen/observable";
import { PositionsResponse } from "./types/positionsTypes";
import { RawPayloadResponseUserProperties } from "./types/userPropertiesTypes";

enum ChannelState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  ERROR,
}

export default class WsJsonClient {
  private buffer = new BufferedIterator<ParsedWebSocketResponse>();
  private iterator = new MulticastIterator(this.buffer);
  private state = ChannelState.DISCONNECTED;

  constructor(
    private readonly accessToken: string,
    private readonly socket = new WebSocket(
      "wss://services.thinkorswim.com/Services/WsJson"
    ),
    private readonly responseParser = new ResponseParser()
  ) {}

  authenticate(): Promise<LoginResponseBody | null> {
    const { state } = this;
    switch (state) {
      case ChannelState.DISCONNECTED:
        this.buffer = new BufferedIterator<ParsedWebSocketResponse>();
        this.iterator = new MulticastIterator(this.buffer);
        this.state = ChannelState.CONNECTING;
        return this.doConnect();
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
      socket.onmessage = ({ data }) => this.onMessage(data, resolve, reject);
    });
  }

  private onMessage(
    data: any,
    resolve: (value: LoginResponseBody) => void,
    reject: (reason?: any) => void
  ) {
    const { responseParser, buffer, accessToken } = this;
    const message = JSON.parse(data) as WsJsonRawMessage;
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

  userProperties(): Promise<RawPayloadResponseUserProperties> {
    const iterator = this.dispatch(() => newUserPropertiesRequest())
      .filter(isUserPropertiesResponse)
      .iterator() as AsyncIterator<RawPayloadResponseUserProperties>;
    return iterator.next().then((r) => r.value);
  }

  private dispatch(
    fn: () => RawPayloadRequest
  ): Observable<ParsedWebSocketResponse> {
    this.ensureConnected();
    this.sendMessage(fn());
    return deferredWrap(() => this.iterator);
  }

  private sendMessage(data: any) {
    this.socket?.send(JSON.stringify(data));
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
