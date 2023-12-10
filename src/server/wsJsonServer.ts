import ws from "ws";
import { createServer, Server as HttpsServer } from "https";
import { IncomingMessage, Server as HttpServer, ServerResponse } from "http";
import { readFileSync } from "fs";
import { WsJsonClient } from "../client/wsJsonClient";
import debug from "debug";
import WsJsonServerProxy from "./wsJsonServerProxy";
import { isEmpty } from "lodash";
import { Disposable } from "./disposable";

const logger = debug("wsJsonServer");
const DEFAULT_HTTPS_SERVER = createServer({
  cert: readFileSync("./cert.pem"),
  key: readFileSync("./key.pem"),
});
const DEFAULT_PORT = 8080;
type DefaultHttpsServer = HttpsServer<
  typeof IncomingMessage,
  typeof ServerResponse
>;
type DefaultHttpServer = HttpServer<
  typeof IncomingMessage,
  typeof ServerResponse
>;

/**
 * A WebSocket server that proxies requests to a WsJsonClient client. Incoming messages must be in JSON format and have
 * a "request" property that matches a method on the WsJsonClient interface and an "args" property that is an array of
 * arguments to pass to the method. The response is then forwarded back to the client as a JSON string.
 */
export default class WsJsonServer implements Disposable {
  private readonly wss: ws.Server<typeof ws, typeof IncomingMessage>;
  private proxies: WsJsonServerProxy[] = [];

  constructor(
    private readonly wsJsonClientFactory: () => WsJsonClient,
    private readonly server:
      | DefaultHttpsServer
      | DefaultHttpServer = DEFAULT_HTTPS_SERVER,
    private readonly port = DEFAULT_PORT
  ) {
    this.wss = new ws.WebSocketServer({ server: this.server });
  }

  start() {
    const { wss, server, port, wsJsonClientFactory, proxies } = this;
    wss.on("connection", (ws) => {
      logger("client connected");
      proxies.push(new WsJsonServerProxy(ws, wsJsonClientFactory));
    });
    server.listen(port);
  }

  disconnect() {
    const { proxies } = this;
    while (!isEmpty(proxies)) {
      proxies.pop()?.disconnect();
    }
  }
}
