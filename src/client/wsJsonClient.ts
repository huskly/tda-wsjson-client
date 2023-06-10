import WebSocket from "isomorphic-ws";
import MessageBuilder from "./messageBuilder";
import {
  isSuccessfulLogin,
  LoginResponse,
  LoginResponseBody,
  ParsedWebSocketResponse,
  WsJsonRawMessage,
} from "./tdaWsJsonTypes";
import { debugLog } from "./util";
import ResponseParser from "./responseParser";
import MulticastIterator from "obgen/multicastIterator";
import BufferedIterator from "obgen/bufferedIterator";

enum ChannelState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  ERROR,
}

export default class WsJsonClient {
  // private readonly headers = {
  //   Host: "services.thinkorswim.com",
  //   Origin: "https://trade.thinkorswim.com",
  // };
  private socket: WebSocket | null = null;
  private buffer = new BufferedIterator<ParsedWebSocketResponse>();
  private iterator = new MulticastIterator(this.buffer);
  private state = ChannelState.DISCONNECTED;

  constructor(
    private readonly accessToken: string,
    private readonly wsUrl = "wss://services.thinkorswim.com/Services/WsJson",
    private readonly messageBuilder = new MessageBuilder(),
    private readonly responseParser = new ResponseParser()
  ) {}

  connect(): Promise<LoginResponseBody | null> {
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
        return Promise.resolve(null);
      case ChannelState.ERROR:
        return Promise.reject("Illegal state, ws connection failed previously");
    }
  }

  private doConnect(): Promise<LoginResponseBody> {
    const { messageBuilder } = this;
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.wsUrl /*{ headers: this.headers }*/);
      this.socket.onopen = () => {
        this.sendMessage(messageBuilder.connectionRequest());
      };
      this.socket.onclose = () => {
        debugLog("disconnected");
      };
      this.socket.onmessage = ({ data }) => {
        this.onMessage(data, resolve, reject);
      };
    });
  }

  private onMessage(
    data: any,
    resolve: (value: LoginResponseBody) => void,
    reject: (reason?: any) => void
  ) {
    const { responseParser, messageBuilder, buffer, accessToken } = this;
    const message = JSON.parse(data) as WsJsonRawMessage;
    if (responseParser.isConnectionResponse(message)) {
      const loginMessage = messageBuilder.loginRequest(accessToken);
      this.sendMessage(loginMessage);
    } else if (responseParser.isLoginResponse(message)) {
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

  quotes(symbols: string[]): AsyncIterableIterator<ParsedWebSocketResponse> {
    this.ensureConnected();
    if (this.state !== ChannelState.CONNECTED) {
      throw new Error("Please call connectIfNeeded() first");
    }
    const { messageBuilder, iterator } = this;
    const message = messageBuilder.quotesRequest(symbols);
    this.sendMessage(message);
    return iterator;
  }

  private sendMessage(data: any) {
    this.socket?.send(JSON.stringify(data));
  }

  private handleLoginResponse(
    message: LoginResponse,
    resolve: (value: LoginResponseBody) => void,
    reject: (reason?: any) => void
  ) {
    if (isSuccessfulLogin(message)) {
      this.state = ChannelState.CONNECTED;
      const body = message?.payload?.[0]?.body;
      resolve(body);
    } else {
      this.state = ChannelState.ERROR;
      reject();
    }
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
    this.state = ChannelState.DISCONNECTED;
    // This ensures that listeners will resolve the promise cleanly from any `for await` loops
    this.buffer.end();
  }
}
