import { OAuth2Client, OAuth2Token } from "@badgateway/oauth2-client";
import { WsJsonClient } from "./wsJsonClient.js";
import debug from "debug";

const logger = debug("wsJsonClientAuth");

export default class WsJsonClientAuth {
  private readonly oauthClient: OAuth2Client;

  constructor(
    private readonly wsJsonClientFactory: () => WsJsonClient,
    clientId: string,
    originalFetch: typeof fetch
  ) {
    this.oauthClient = new OAuth2Client({
      server: "https://trade.thinkorswim.com/",
      clientId,
      clientSecret: "",
      tokenEndpoint: "https://api.tdameritrade.com/v1/oauth2/token",
      authorizationEndpoint: "/auth",
      authenticationMethod: "client_secret_post",
      // https://github.com/badgateway/oauth2-client/issues/105
      fetch: (...args) => originalFetch(...args),
    });
  }

  async authenticateWithRetry(token: OAuth2Token): Promise<AuthResult> {
    const client = this.wsJsonClientFactory();
    try {
      await client.authenticate(token.accessToken);
      return { token, client };
    } catch (e) {
      return await this.refreshToken(token);
    }
  }

  async refreshToken(token: OAuth2Token): Promise<AuthResult> {
    logger("attempting token refresh");
    const { oauthClient } = this;
    try {
      const newToken = await oauthClient.refreshToken(token);
      const client = this.wsJsonClientFactory();
      await client.authenticate(newToken.accessToken);
      // oauthClient.refreshToken() doesn't return the refresh token so we need to re-add it
      const refreshedToken = { ...newToken, refreshToken: token.refreshToken };
      return { token: refreshedToken, client };
    } catch (e) {
      console.error(`Failed to refresh token`, e);
      throw e;
    }
  }
}

export type AuthResult = {
  token: OAuth2Token;
  client: WsJsonClient;
};
