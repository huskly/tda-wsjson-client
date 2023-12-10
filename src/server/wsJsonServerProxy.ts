import ws from "ws";
import debug from "debug";
import { ProxiedRequest, ProxiedResponse } from "../client/wsJsonClientProxy";
import { WsJsonClient } from "../client/wsJsonClient";
import { Disposable } from "./disposable";

const logger = debug("wsJsonServerProxy");

export default class WsJsonServerProxy implements Disposable {
  private client?: WsJsonClient;

  constructor(
    private readonly ws: ws,
    private readonly clientFactory: () => WsJsonClient
  ) {
    ws.on("error", console.error);
    ws.on("message", (data: string) => this.onClientMessage(data));
    logger("connected and ready to accept messages");
  }

  disconnect() {
    this.client?.disconnect();
    this.ws.close();
  }

  private onClientMessage = async (data: string) => {
    const msg = JSON.parse(data) as ProxiedRequest;
    logger("⬅️\treceived %O", msg);
    const { request, args } = msg;
    switch (request) {
      case "authenticate": {
        this.client = this.clientFactory();
        try {
          const authResult = await this.client.authenticate(args![0]);
          this.proxyResponse({ ...msg, response: authResult });
        } catch (e) {
          this.proxyResponse({ ...msg, response: e });
        }
        break;
      }
      case "optionChainQuotes": {
        for await (const quote of this.client!.optionChainQuotes(args![0])) {
          this.proxyResponse({ ...msg, response: quote });
        }
        break;
      }
    }
  };

  private proxyResponse(msg: ProxiedResponse) {
    this.ws.send(JSON.stringify(msg));
  }
}
