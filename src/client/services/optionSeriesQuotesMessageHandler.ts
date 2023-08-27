import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";
import { ApiService } from "./apiService";

export type OptionSeriesQuote = {
  name: string;
  values: {
    IMPLIED_VOLATILITY: number;
    SERIES_EXPECTED_MOVE: number;
  };
};

export type OptionSeriesQuotesPatchResponse = {
  patches: {
    op: string;
    path: string;
    value: number | { series: OptionSeriesQuote[] };
  }[];
  service: "optionSeries/quotes";
};

export type OptionSeriesQuotesSnapshotResponse = {
  series: OptionSeriesQuote[];
  service: "optionSeries/quotes";
};

export type OptionSeriesQuotesResponse =
  | OptionSeriesQuotesSnapshotResponse
  | OptionSeriesQuotesPatchResponse;

export default class OptionSeriesQuotesMessageHandler
  implements WebSocketApiMessageHandler<string, OptionSeriesQuotesResponse>
{
  buildRequest(symbol: string): RawPayloadRequest {
    return newPayload({
      header: {
        service: "optionSeries/quotes",
        id: "optionSeriesQuotes",
        ver: 0,
      },
      params: {
        underlying: symbol,
        exchange: "BEST",
        fields: ["IMPLIED_VOLATILITY", "SERIES_EXPECTED_MOVE"],
      },
    });
  }

  parseResponse(message: RawPayloadResponse): OptionSeriesQuotesResponse {
    const { payload } = message;
    const [{ body }] = payload;
    if ("series" in body) {
      // snapshot response
      const { series } = body as unknown as { series: OptionSeriesQuote[] };
      return { series, service: "optionSeries/quotes" };
    } else {
      // patch response
      const { patches } = body as unknown as {
        patches: OptionSeriesQuotesPatchResponse["patches"];
      };
      return { patches, service: "optionSeries/quotes" };
    }
  }

  service: ApiService = "optionSeries/quotes";
}
