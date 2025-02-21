import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { DeepPartial } from "../util.js";
import { ApiService } from "./apiService.js";
import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler.js";

export type RawPositionsResponse = {
  items: {
    account: string;
    instrument: {
      symbol: string;
      rootSymbol: string;
      description: string;
      instrumentType: "STOCK" | "OPTION" | "ETF" | "FUTURE" | "PRODUCT";
    };
    symbol: string;
    rootSymbol: string;
    values: {
      OPEN_PRICE?: number;
      BP_EFFECT?: number;
      DELTA?: number;
      GAMMA?: number;
      MARGIN?: number;
      MARK?: number;
      MARK_CHANGE?: number;
      NET_LIQ?: number;
      OPEN_COST?: number;
      PL_DAY?: number;
      PL_OPEN?: number;
      PL_YTD?: number;
      RHO?: number;
      THETA?: number;
      VEGA?: number;
      QUANTITY?: number;
    };
    betaWeightings: [{ symbol: string; deltaBetaWeighting: number }];
    aggregated: true;
    closable: false;
    exercisable: false;
    rollable: false;
  }[];
};

export interface Instrument {
  assetType: string;
  cusip: string;
  symbol: string;
  description?: string;
  putCall?: string;
  underlyingSymbol?: string;
  underlyingLastPrice?: number;
}

export interface AccountPosition {
  shortQuantity: number;
  averagePrice: number;
  currentDayProfitLoss: number;
  currentDayProfitLossPercentage: number;
  longQuantity: number;
  settledLongQuantity: number;
  settledShortQuantity: number;
  instrument: Instrument;
  marketValue: number;
  maintenanceRequirement?: number;
  lastPrice: number;
  // this is a purely presentation related field that was added here so we can keep track of the
  // previous last price and determine whether the price is going up or down. That way we can color
  // animate price updates similarly to how TOS works.
  previousPrice?: number;
}

export type PositionsResponse = {
  positions: DeepPartial<AccountPosition>[];
  service: "positions";
};

export default class PositionsMessageHandler
  implements WebSocketApiMessageHandler<string>
{
  buildRequest(accountNumber: string): RawPayloadRequest {
    return newPayload({
      header: { service: "positions", ver: 0, id: "positions" },
      params: {
        account: accountNumber,
        betaWeightingSymbols: [],
        //additional fields are: MARK DELTA GAMMA THETA VEGA RHO OPEN_COST BP_EFFECT MARK_CHANGE MARGIN
        fields: [
          "QUANTITY",
          "OPEN_PRICE",
          "NET_LIQ",
          "PL_OPEN",
          "PL_YTD",
          "PL_DAY",
        ],
      },
    });
  }

  service: ApiService = "positions";
}
