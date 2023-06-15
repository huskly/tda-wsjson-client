import { RawPayloadResponse } from "../tdaWsJsonTypes";

export type RawPayloadResponseInstrumentSearch = {
  instruments: {
    symbol: string;
    displaySymbol: string;
    description: string;
  }[];
};

export type InstrumentSearchMatch = {
  symbol: string;
  description: string;
};

export type InstrumentSearchResponse = {
  instruments: InstrumentSearchMatch[];
};

export function parseInstrumentSearchResponse(
  message: RawPayloadResponse
): InstrumentSearchResponse {
  const [{ body }] = message.payload;
  const { instruments } = body as RawPayloadResponseInstrumentSearch;
  return { instruments };
}
