import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";
import { ApiService } from "./apiService";

export type OptionQuotesRequestParams = {
  underlyingSymbol: string;
  seriesNames: string[];
  minStrike: number;
  maxStrike: number;
};

type RawOptionQuotesSnapshotBodyResponse = {
  exchanges: string[];
  items: OptionQuoteItem[];
};

export type OptionQuoteItem = {
  symbol: string;
  values: OptionQuoteItemValue;
};

type RawOptionQuotesPatchBodyResponse = {
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
  implements
    WebSocketApiMessageHandler<
      OptionQuotesRequestParams,
      OptionQuotesResponse | null
    >
{
  parseResponse(message: RawPayloadResponse): OptionQuotesResponse | null {
    const [{ header, body }] = message.payload;
    switch (header.type) {
      case "snapshot": {
        const { items } = body as RawOptionQuotesSnapshotBodyResponse;
        return { items, service: "quotes/options" };
      }
      case "patch": {
        const { patches } = body as RawOptionQuotesPatchBodyResponse;
        return { patches, service: "quotes/options" };
      }
      default:
        console.warn("Unexpected quotes/options response", message);
        return null;
    }
  }

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
