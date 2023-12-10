import ws from "ws";
import { createServer, Server } from "https";
import { IncomingMessage, ServerResponse } from "http";
import { readFileSync } from "fs";
import { WsJsonClient } from "../client/wsJsonClient";
import debug from "debug";
import { ProxiedRequest, ProxiedResponse } from "../client/wsJsonClientProxy";

const logger = debug("wsServerProxy");

// A WebSocket server that proxies requests to a WsJsonClient client. Incoming messages must be in JSON format and have
// a "request" property that matches a method on the WsJsonClient interface and an "args" property that is an array of
// arguments to pass to the method. The response is then forwarded back to the client as a JSON string.
export default class WsJsonServer {
  private readonly server: Server<
    typeof IncomingMessage,
    typeof ServerResponse
  >;
  private readonly wss: ws.Server<typeof ws, typeof IncomingMessage>;
  private client?: WsJsonClient;

  constructor(
    private readonly clientFactory: () => WsJsonClient,
    private readonly port = 8080
  ) {
    this.server = createServer({
      cert: readFileSync("./cert.pem"),
      key: readFileSync("./key.pem"),
    });
    this.wss = new ws.WebSocketServer({ server: this.server });
  }

  start() {
    const { wss, server, port } = this;
    wss.on("connection", (ws) => this.onClientConnected(ws));
    server.listen(port);
  }

  private onClientConnected(ws: ws) {
    ws.on("error", console.error);
    ws.on("message", (data: string) => this.onClientMessage(ws, data));
    logger("connected and ready to accept messages");
  }

  private onClientMessage = async (ws: ws, data: string) => {
    const msg = JSON.parse(data) as ProxiedRequest;
    logger("⬅️\treceived %O", msg);
    const { request, args } = msg;
    switch (request) {
      case "authenticate": {
        this.client = this.clientFactory();
        try {
          const authResult = await this.client.authenticate(args[0]);
          this.proxyResponse(ws, { ...msg, response: authResult });
        } catch (e) {
          this.proxyResponse(ws, { ...msg, response: e });
        }
        break;
      }
      case "optionChainQuotes": {
        for await (const quote of this.client!.optionChainQuotes(args[0])) {
          this.proxyResponse(ws, { ...msg, response: quote });
        }
        break;
      }
    }
  };

  private proxyResponse(ws: ws, msg: ProxiedResponse) {
    ws.send(JSON.stringify(msg));
  }
}
