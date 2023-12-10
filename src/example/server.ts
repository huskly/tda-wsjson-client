import WsJsonServer from "../server/wsJsonServer";
import RealWsJsonClient from "../client/realWsJsonClient";

const proxy = new WsJsonServer(() => new RealWsJsonClient());
proxy.start();
