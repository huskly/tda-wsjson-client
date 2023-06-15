import { RawPayloadResponse } from "../tdaWsJsonTypes";

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

export type RawOptionChainDetailsResponse = {
  optionSeries: OptionChainDetailsItem[];
};

export type OptionChainResponse = {
  series: OptionChainItem[];
};

export type OptionChainDetailsResponse = {
  seriesDetails: OptionChainDetailsItem[];
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

export type OptionChainDetailsItem = {
  expiration: string; // eg "16 JUN 23"
  expirationString: string; // eg "16 JUN 23 (100)"
  fractionalType: string; // eg X10
  optionPairs: {
    strike: number;
    callSymbol: string;
    putSymbol: string;
    callDisplaySymbol: string;
    putDisplaySymbol: string;
  }[];
  spc: number;
  name: string;
  contract: string;
  contractDisplay: string;
  daysToExpiration: number;
  settlementType: "AM" | "PM";
};

export function parseOptionChainResponse(
  message: RawPayloadResponse
): OptionChainResponse {
  const [{ body }] = message.payload;
  const { series } = body as RawOptionSeriesResponse;
  return {
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
}

export function parseOptionChainDetailsResponse(
  message: RawPayloadResponse
): OptionChainDetailsResponse {
  const [{ body }] = message.payload;
  const { optionSeries } = body as RawOptionChainDetailsResponse;
  return { seriesDetails: optionSeries };
}
