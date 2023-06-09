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

export function parseInstrumentSearchResponse({
  instruments,
}: RawPayloadResponseInstrumentSearch): InstrumentSearchResponse {
  return { instruments };
}
