import ws from "ws";
import debug from "debug";
import { ProxiedRequest, ProxiedResponse } from "../client/wsJsonClientProxy";
import { WsJsonClient } from "../client/wsJsonClient";
import { Disposable } from "./disposable";

const logger = debug("wsJsonServerProxy");

/**
 * Sits in between two WebSocket connections and proxies messages between them. The client `downstream` connection is
 * expected to send ProxiedRequest JSON messages with a "request" property that matches a method on the WsJsonClient interface and an
 * "args" property that is an array of arguments to pass to the method. The response from the `upstream`
 * connection is then forwarded back to the `downstream` as a JSON string.
 */
export default class WsJsonServerProxy implements Disposable {
  private upstream?: WsJsonClient;

  constructor(
    private readonly downstream: ws,
    private readonly wsJsonClientFactory: () => WsJsonClient
  ) {
    downstream.on("error", console.error);
    downstream.on("message", (data: string) => this.onClientMessage(data));
    logger("connected and ready to accept messages");
  }

  disconnect() {
    this.upstream?.disconnect();
    this.downstream.close();
  }

  private onClientMessage = async (data: string) => {
    const msg = JSON.parse(data) as ProxiedRequest;
    logger("⬅️\treceived %O", msg);
    const { request, args } = msg;
    switch (request) {
      case "authenticate": {
        this.upstream = this.wsJsonClientFactory();
        try {
          const authResult = await this.upstream.authenticate(args![0]);
          this.proxyResponse({ ...msg, response: authResult });
        } catch (e) {
          this.proxyResponse({ ...msg, response: e });
        }
        break;
      }
      case "optionChainQuotes": {
        for await (const quote of this.upstream!.optionChainQuotes(args![0])) {
          this.proxyResponse({ ...msg, response: quote });
        }
        break;
      }
    }
  };

  private proxyResponse(msg: ProxiedResponse) {
    this.downstream.send(JSON.stringify(msg));
  }
}
