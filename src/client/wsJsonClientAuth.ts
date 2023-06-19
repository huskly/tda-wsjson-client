import { OAuth2Client, OAuth2Token } from "@badgateway/oauth2-client";
import WsJsonClient from "./wsJsonClient";
import debug from "debug";

const logger = debug("wsJsonClientAuth");

export default class WsJsonClientAuth {
  private readonly oauthClient: OAuth2Client;

  constructor(clientId: string, fetchFn: typeof fetch) {
    this.oauthClient = new OAuth2Client({
      server: "https://auth.tdameritrade.com/",
      clientId,
      clientSecret: "",
      tokenEndpoint: "https://api.tdameritrade.com/v1/oauth2/token",
      authorizationEndpoint: "/auth",
      authenticationMethod: "client_secret_post",
      // https://github.com/badgateway/oauth2-client/issues/105
      fetch: fetchFn,
    });
  }

  async authenticateWithRetry(token: OAuth2Token): Promise<AuthResult> {
    const { oauthClient } = this;
    let client = new WsJsonClient(token.accessToken);
    try {
      await client.authenticate();
      return { token, client };
    } catch (e) {
      // refresh token and retry
      try {
        const newToken = await oauthClient.refreshToken(token);
        client = new WsJsonClient(newToken.accessToken);
        await client.authenticate();
        logger(`Successfully refreshed token: ${JSON.stringify(newToken)}`);
        return { token: newToken, client };
      } catch (e) {
        console.error(`Failed to refresh token`, e);
        throw e;
      }
    }
  }
}

export type AuthResult = {
  token: OAuth2Token;
  client: WsJsonClient;
}
