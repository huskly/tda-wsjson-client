import WsJsonServer from "../server/wsJsonServer";
import RealWsJsonClient from "../client/realWsJsonClient";
import { createServer } from "http";

const proxy = new WsJsonServer(() => new RealWsJsonClient(), createServer());
proxy.start();
