import WebSocketApiMessageHandler from "./webSocketApiMessageHandler";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";
import { ApiService } from "./apiService";

export type RawOptionChainDetailsResponse = {
  optionSeries: OptionChainDetailsItem[];
};

export type OptionChainDetailsResponse = {
  seriesDetails: OptionChainDetailsItem[];
  service: "option_chain/get";
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

export type OptionChainDetailsRequest = {
  symbol: string;
  seriesNames: string[];
};

export default class OptionChainDetailsMessageHandler
  implements
    WebSocketApiMessageHandler<
      OptionChainDetailsRequest,
      OptionChainDetailsResponse | null
    >
{
  parseResponse(
    message: RawPayloadResponse
  ): OptionChainDetailsResponse | null {
    const [{ body }] = message.payload;
    const { optionSeries } = body as RawOptionChainDetailsResponse;
    return { seriesDetails: optionSeries, service: "option_chain/get" };
  }

  // param `seriesNames` as returned from `newOptionChainRequest`, eg: "16 JUN 23 100"
  buildRequest({
    symbol,
    seriesNames,
  }: OptionChainDetailsRequest): RawPayloadRequest {
    return {
      payload: [
        {
          header: {
            service: "option_chain/get",
            id: "option_chain/get",
            ver: 0,
          },
          params: {
            underlyingSymbol: symbol,
            filter: { strikeQuantity: 2147483647, seriesNames },
          },
        },
      ],
    };
  }

  service: ApiService = "option_chain/get";
}
