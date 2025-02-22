import { WsJsonServer } from "../server/wsJsonServer.js";
import { RealWsJsonClient } from "../client/realWsJsonClient.js";
import { createServer } from "http";

const proxy = new WsJsonServer(() => new RealWsJsonClient(), createServer());
proxy.start();
