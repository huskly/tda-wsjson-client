import ws from "ws";
import { createServer, Server } from "https";
import { IncomingMessage, ServerResponse } from "http";
import { readFileSync } from "fs";
import { WsJsonClient } from "../client/wsJsonClient";
import debug from "debug";

const logger = debug("wsServerProxy");

// A WebSocket server that proxies requests to a WsJsonClient client. Incoming messages must be in JSON format and have
// a "request" property that matches a method on the WsJsonClient interface and an "args" property that is an array of
// arguments to pass to the method. The response is then forwarded back to the client as a JSON string.
export default class WsJsonServerProxy {
  private readonly server: Server<
    typeof IncomingMessage,
    typeof ServerResponse
  >;
  private readonly wss: ws.Server<typeof ws, typeof IncomingMessage>;

  constructor(
    private readonly client: WsJsonClient,
    private readonly port = 8080
  ) {
    this.server = createServer({
      cert: readFileSync("./cert.pem"),
      key: readFileSync("./key.pem"),
    });
    this.wss = new ws.WebSocketServer({ server: this.server });
  }

  start() {
    const { wss, server, client } = this;
    wss.on("connection", (ws) => {
      ws.on("error", console.error);
      ws.on("message", async (data: string) => {
        const msg = JSON.parse(data);
        logger("⬅️\treceived %O", msg);
        const { request, args } = msg;
        if (request === "authenticate") {
          const authResult = await client.authenticate(args[0]);
          ws.send(JSON.stringify({ ...msg, response: authResult }));
        } else if (request === "optionChainQuotes") {
          for await (const quote of client.optionChainQuotes(args[0])) {
            ws.send(JSON.stringify({ ...msg, response: quote }));
          }
        }
      });
      logger("connected and ready to accept messages");
    });

    server.listen(this.port);
  }
}
