import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";
import { debugLog, DeepPartial, positionNetQuantity } from "../util";
import { ApiService } from "./apiService";

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
};

export default class PositionsMessageHandler
  implements WebSocketApiMessageHandler<string, PositionsResponse>
{
  parseResponse(message: RawPayloadResponse): PositionsResponse | null {
    const [{ header, body }] = message.payload;
    switch (header.type) {
      case "snapshot": {
        const { items } = body as RawPositionsResponse;
        const positions = items.map(({ values, instrument }) => {
          const averagePrice = values.OPEN_PRICE;
          const quantity = values.QUANTITY || 0;
          const lastPrice = values.MARK;
          const longQuantity = quantity > 0 ? quantity : 0;
          const shortQuantity = quantity < 0 ? quantity : 0;
          const marketValue = values.NET_LIQ || 0;
          const currentDayProfitLoss = values.PL_DAY;
          return {
            averagePrice,
            lastPrice,
            currentDayProfitLoss,
            marketValue,
            longQuantity,
            shortQuantity,
            instrument: {
              symbol: instrument.symbol,
              underlyingSymbol: instrument.rootSymbol,
              assetType: instrument.instrumentType,
            },
          } as AccountPosition;
        });
        return {
          // Ignore positions with zero quantity (we don't care about it since
          // it's already been closed)
          positions: positions.filter((p) => positionNetQuantity(p) > 0),
        };
      }
      case "patch":
        // TODO: not yet implemented
        debugLog(
          "Not implemented positions patch message received, ignoring",
          body
        );
        return null;
      default:
        console.warn("Unexpected positions response", message);
        return null;
    }
  }

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
