import WsJsonClient, {
  CONNECTION_REQUEST_MESSAGE,
} from "../../client/wsJsonClient";
import "dotenv/config";
import WS from "jest-websocket-mock";
import LoginMessageHandler from "../../client/services/loginMessageHandler";

describe("wsJsonClientTest", () => {
  it("should connect and log in successfully", async () => {
    const connectionResponse = {
      session: "17a7_7115011e1b4a8c9c",
      build: "27.2323.3-B0",
      ver: "27.*.*",
    };
    const loginResponse = {
      payload: [
        {
          header: { service: "login", id: "login", ver: 0, type: "snapshot" },
          body: {
            authenticationStatus: "OK",
            authenticated: true,
            forceLogout: false,
            stalePassword: true,
            userDomain: "TDA",
            userSegment: "ADVNCED",
            userId: 123345566,
            userCdi: "A00000000000",
            userCode: "foobar",
            token: "something-random",
            schwabAccountMigrationValue: "REMAIN_ON_TDA",
            permissions: {
              isCryptoAllowed: false,
              isFractionalQuantityAllowed: false,
              isMandatoryAutoLockAllowed: false,
              isSchwabIntegrationHubLinkAllowed: true,
              isPlaceQuantityLinkOrdersAllowed: true,
            },
            quotePermissions: [
              {
                name: "Level I",
                isAllowed: true,
                children: [
                  {
                    name: "Stock",
                    isAllowed: true,
                    children: [
                      { name: "AMEX", isAllowed: true },
                      { name: "NASDAQ", isAllowed: true },
                      { name: "NYSE", isAllowed: true },
                    ],
                  },
                  { name: "Equity options", isAllowed: true },
                  {
                    name: "Futures and futures options",
                    isAllowed: true,
                    children: [
                      { name: "CFE", isAllowed: true },
                      { name: "CME", isAllowed: true },
                      { name: "ICE EU", isAllowed: true },
                      { name: "ICE", isAllowed: true },
                      { name: "LIFFE", isAllowed: true },
                    ],
                  },
                  { name: "Forex", isAllowed: true },
                  { name: "Other", isAllowed: true },
                ],
              },
              { name: "Level II", isAllowed: true },
            ],
          },
        },
      ],
    };
    const url = "ws://localhost:1234";
    const accessToken = "something-secret";
    const server = new WS(url, { jsonProtocol: true });
    const client = new WsJsonClient(accessToken, new WebSocket(url));
    await server.connected;
    // explicitly do not await for this promise so that we can send the server replies below
    client.authenticate();
    server.send(connectionResponse);
    server.send(loginResponse);
    await expect(server).toReceiveMessage(CONNECTION_REQUEST_MESSAGE);
    const loginMessageHandler = new LoginMessageHandler();
    await expect(server).toReceiveMessage(
      loginMessageHandler.buildRequest(accessToken)
    );
    expect(client.isConnected()).toBeTruthy();
    client.disconnect();
    expect(client.isConnected()).toBeFalsy();
  });
});
