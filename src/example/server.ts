import WsJsonServerProxy from "../server/wsJsonServerProxy";
import RealWsJsonClient from "../client/realWsJsonClient";

const proxy = new WsJsonServerProxy(new RealWsJsonClient());
proxy.start();
