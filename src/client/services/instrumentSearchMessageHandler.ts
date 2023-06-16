import WebSocketApiMessageHandler from "./webSocketApiMessageHandler";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";
import { newRandomId } from "../messageBuilder";
import { ApiService } from "./apiService";

export type RawPayloadResponseInstrumentSearch = {
  instruments: {
    symbol: string;
    displaySymbol: string;
    description: string;
  }[];
};

type InstrumentSearchMatch = {
  symbol: string;
  description: string;
};

type InstrumentSearchRequest = {
  query: string;
  limit: number;
};

export type InstrumentSearchResponse = {
  instruments: InstrumentSearchMatch[];
};

export default class InstrumentSearchMessageHandler
  implements
    WebSocketApiMessageHandler<
      InstrumentSearchRequest,
      InstrumentSearchResponse
    >
{
  parseResponse(message: RawPayloadResponse): InstrumentSearchResponse {
    const [{ body }] = message.payload;
    const { instruments } = body as RawPayloadResponseInstrumentSearch;
    return { instruments };
  }

  buildRequest({ query, limit }: InstrumentSearchRequest): RawPayloadRequest {
    const id = newRandomId();
    return {
      payload: [
        {
          header: {
            service: "instrument_search",
            ver: 0,
            id: `searchForSymbol-${id}`,
          },
          params: { limit, pattern: query },
        },
      ],
    };
  }

  service: ApiService = "instrument_search";
}