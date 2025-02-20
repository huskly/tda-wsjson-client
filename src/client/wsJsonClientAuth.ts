import debug from "debug";
import { WsJsonClient } from "./wsJsonClient.js";

// @ts-expect-error
const logger = debug("wsJsonClientAuth");

export default class WsJsonClientAuth {
  constructor(private readonly wsJsonClientFactory: () => WsJsonClient) {}

  async authenticateWithRetry(authCode: string): Promise<WsJsonClient> {
    const client = this.wsJsonClientFactory();
    await client.authenticate(authCode);
    return client;
  }

  // async refreshToken(token: OAuth2Token): Promise<AuthResult> {
  //   logger("attempting token refresh");
  //   const { oauthClient } = this;
  //   try {
  //     const newToken = await oauthClient.refreshToken(token);
  //     const client = this.wsJsonClientFactory();
  //     await client.authenticate(newToken.accessToken);
  //     // oauthClient.refreshToken() doesn't return the refresh token so we need to re-add it
  //     const refreshedToken = { ...newToken, refreshToken: token.refreshToken };
  //     return { token: refreshedToken, client };
  //   } catch (e) {
  //     console.error(`Failed to refresh token`, e);
  //     throw e;
  //   }
  // }
}
