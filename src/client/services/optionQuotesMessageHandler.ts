import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";
import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler.js";

export type OptionQuotesRequestParams = {
  underlyingSymbol: string;
  seriesNames: string[];
  minStrike: number;
  maxStrike: number;
};

export type OptionQuoteItem = {
  symbol: string;
  values: OptionQuoteItemValue;
};

export type OptionQuotesResponse =
  | OptionQuotesSnapshotResponse
  | OptionQuotesPatchResponse;

export type OptionQuotesSnapshotResponse = {
  items: OptionQuoteItem[];
  service: "quotes/options";
};

export type OptionQuotesPatchResponse = {
  patches: {
    op: string;
    path: string;
    value:
      | {
          exchanges: string[];
          items: OptionQuoteItem[];
        }
      | number;
  }[];
  service: "quotes/options";
};

export type OptionQuoteItemValue = {
  ASK?: number;
  BID?: number;
  DELTA?: number;
  OPEN_INT?: number;
  PROBABILITY_ITM?: number;
  VOLUME?: number;
};

export default class OptionQuotesMessageHandler
  implements WebSocketApiMessageHandler<OptionQuotesRequestParams>
{
  buildRequest({
    underlyingSymbol,
    seriesNames,
    minStrike,
    maxStrike,
  }: OptionQuotesRequestParams): RawPayloadRequest {
    return newPayload({
      header: { service: "quotes/options", id: "quotes/options", ver: 0 },
      params: {
        underlyingSymbol,
        exchange: "BEST",
        fields: [
          "BID",
          "ASK",
          "PROBABILITY_ITM",
          "DELTA",
          "OPEN_INT",
          "VOLUME",
        ],
        filter: { seriesNames, minStrike, maxStrike },
      },
    });
  }

  service: ApiService = "quotes/options";
}
