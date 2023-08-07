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
  items: { symbol: string; values: any[] }[];
};

type RawOptionQuotesPatchBodyResponse = {
  patches: {
    op: string;
    path: string;
    value: any;
  }[];
};

export type OptionQuotesResponse =
  | OptionQuotesSnapshotResponse
  | OptionQuotesPatchResponse;

export type OptionQuotesSnapshotResponse = {
  items: { symbol: string; values: any[] }[];
  service: "quotes/options";
};

export type OptionQuotesPatchResponse = {
  patches: {
    op: string;
    path: string;
    value: any;
  }[];
  service: "quotes/options";
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
