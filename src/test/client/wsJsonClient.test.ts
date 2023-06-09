import WsJsonClient from "../../client/wsJsonClient";
import "dotenv/config";

describe("wsJsonClientTest", () => {
  it("should connect and log in successfully", async () => {
    const accessToken = process.env.ACCESS_TOKEN as string;
    const client = new WsJsonClient(accessToken);
    const {
      authenticationStatus,
      authenticated,
      userId,
      userCdi,
      forceLogout,
      userDomain,
      userSegment,
      token,
    } = await client.connect();
    expect(client.isConnected()).toBeTruthy();
    expect(authenticationStatus).toEqual("OK");
    expect(authenticated).toBeTruthy();
    expect(userId).toBeTruthy();
    expect(userCdi).toBeTruthy();
    expect(forceLogout).toBeFalsy();
    expect(userDomain).toEqual("TDA");
    expect(userSegment).toEqual("ADVNCED");
    expect(token).toBeTruthy();
    client.disconnect();
    expect(client.isConnected()).toBeFalsy();
  });
});
