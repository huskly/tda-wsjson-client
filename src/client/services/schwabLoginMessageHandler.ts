import WebSocketApiMessageHandler, {
  newPayload,
} from "../services/webSocketApiMessageHandler.js";
import {
  RawPayloadRequest,
  RawPayloadResponse,
} from "../tdaWsJsonTypes.js";
import { ApiService } from "../services/apiService.js";

export type SchwabLoginResponse = {
  service: "login/schwab";
  token: string;
  authenticated: boolean;
};

type RawSchwabLoginResponseBody = {
  authenticationStatus: string;
  accessTokenInfo: {
    refreshToken: string;
  };
  authenticated: boolean;
  forceLogout: boolean;
  stalePassword: boolean;
  userDomain: string;
  userSegment: string;
  userId: number;
  userCdi: string;
  userCode: string;
  token: string;
  schwabMarketDataPermissionValue: string;
  permissions: {
    isMandatoryAutoLockAllowed: boolean;
    isSchwabIntegrationHubLinkAllowed: boolean;
    isPlaceQuantityLinkOrdersAllowed: boolean;
    isTaxLotSelectionAllowed: boolean;
  };
};

export default class SchwabLoginMessageHandler
  implements WebSocketApiMessageHandler<string, SchwabLoginResponse>
{
  parseResponse(message: RawPayloadResponse): SchwabLoginResponse {
    const [{ body }] = message.payload;
    const { authenticated, token } = body as RawSchwabLoginResponseBody;
    return { authenticated, token, service: "login/schwab" };
  }

  buildRequest(accessToken: string): RawPayloadRequest {
    return newPayload({
      header: { service: "login/schwab", id: "login/schwab", ver: 0 },
      params: {
        authCode: accessToken,
        clientId: "TOSWeb",
        redirectUri: "https://trade.thinkorswim.com/oauth",
        tag: "TOSWeb",
      },
    });
  }

  service: ApiService = "login/schwab";
}
