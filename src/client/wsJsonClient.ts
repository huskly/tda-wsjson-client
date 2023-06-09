import WebSocket from "ws";
import MessageBuilder from "./messageBuilder";
import {
  LoginResponse,
  LoginResponseBody,
  WsJsonRawMessage,
} from "./tdaWsJsonTypes";
import {
  isConnectionResponse,
  isLoginResponse,
  isSuccessfulLoginResponse,
} from "./responseParser";
import { debugLog } from "./util";

export default class WsJsonClient {
  private readonly headers = {
    Host: "services.thinkorswim.com",
    Origin: "https://trade.thinkorswim.com",
  };
  private socket: WebSocket | null = null;

  constructor(
    private readonly accessToken: string,
    private readonly wsUrl = "wss://services.thinkorswim.com/Services/WsJson",
    private readonly messageBuilder = new MessageBuilder()
  ) {}

  connect(): Promise<LoginResponseBody> {
    const { messageBuilder } = this;
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.wsUrl, { headers: this.headers });
      this.socket.addEventListener("open", () => {
        this.sendMessage(messageBuilder.connectionRequest());
      });
      this.socket.on("connection", function connection(ws) {
        ws.on("error", console.error);
      });
      this.socket.on("close", function close() {
        debugLog("disconnected");
      });
      this.socket.addEventListener("message", ({ data }) => {
        const message = JSON.parse(data as any) as WsJsonRawMessage;
        if (isConnectionResponse(message)) {
          const { accessToken } = this;
          const loginMessage = messageBuilder.loginRequest(accessToken);
          this.sendMessage(loginMessage);
        } else if (isLoginResponse(message)) {
          this.handleLoginResponse(message, resolve, reject);
        }
      });
    });
  }

  private sendMessage(data: any) {
    this.socket?.send(JSON.stringify(data));
  }

  private handleLoginResponse(
    message: LoginResponse,
    resolve: (value: LoginResponseBody) => void,
    reject: (reason?: any) => void
  ) {
    if (isSuccessfulLoginResponse(message)) {
      const body = message?.payload?.[0]?.body;
      resolve(body);
    } else {
      reject();
    }
  }

  disconnect() {
    this.socket?.close();
  }
}
