import WebSocketApiMessageHandler from "./webSocketApiMessageHandler.js";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes.js";
import { newRandomId } from "../util.js";
import { ApiService } from "./apiService.js";

export type RawOptionSeriesResponse = {
  series: {
    // symbol
    underlying: string;
    // "19 JAN 24 100"
    name: string;
    spc: number;
    multiplier: number;
    // eg "REGULAR"
    expirationStyle: string;
    isEuropean: boolean;
    // eg "2024-01-20T12:00:00Z"
    expiration: string;
    lastTradeDate: string;
    settlementType: string; // likely AM or PM
  }[];
};

export type OptionChainResponse = {
  series: OptionChainItem[];
  service: "optionSeries";
};

export type OptionChainItem = {
  underlying: string;
  name: string;
  multiplier: number;
  isEuropean: boolean;
  lastTradeDate: Date;
  expiration: Date;
  settlementType: string;
};

export default class OptionSeriesMessageHandler
  implements WebSocketApiMessageHandler<string, OptionChainResponse>
{
  parseResponse(message: RawPayloadResponse): OptionChainResponse {
    const [{ body }] = message.payload;
    const { series } = body as RawOptionSeriesResponse;
    if (series) {
      return {
        service: "optionSeries",
        series: series.map((s) => ({
          underlying: s.underlying,
          name: s.name,
          multiplier: s.multiplier,
          isEuropean: s.isEuropean,
          lastTradeDate: new Date(s.lastTradeDate),
          expiration: new Date(s.expiration),
          settlementType: s.settlementType,
        })),
      };
    } else {
      return { series: [], service: "optionSeries" };
    }
  }

  buildRequest(symbol: string): RawPayloadRequest {
    const id = newRandomId();
    return {
      payload: [
        {
          header: {
            id: `option-series-${id}`,
            service: "optionSeries",
            ver: 0,
          },
          params: { underlying: symbol },
        },
      ],
    };
  }

  service: ApiService = "optionSeries";
}
