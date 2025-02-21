import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";
import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler.js";

const ALL_FIELDS = [
  "MARK",
  "MARK_CHANGE",
  "MARK_PERCENT_CHANGE",
  "NET_CHANGE",
  "NET_CHANGE_PERCENT",
  "BID",
  "ASK",
  "BID_SIZE",
  "ASK_SIZE",
  "VOLUME",
  "OPEN",
  "HIGH",
  "LOW",
  "LAST",
  "LAST_SIZE",
  "CLOSE",
] as const;

type FieldType = (typeof ALL_FIELDS)[number];

export type RawPayloadResponseQuotesItem = {
  symbol?: string;
  isDelayed?: boolean;
  values: {
    [key in FieldType]?: number;
  };
};

export type RawPayloadResponseQuotesSnapshot = {
  items: RawPayloadResponseQuotesItem[];
};

type RawPayloadResponseQuotesPatchValue = {
  items: RawPayloadResponseQuotesItem[];
};

export type RawPayloadResponseQuotesPatch = {
  patches: {
    op: string;
    path: string;
    value:
      | number
      | RawPayloadResponseQuotesPatchValue
      | RawPayloadResponseQuotesItem;
  }[];
};

export type QuotesResponse = {
  quotes: Partial<QuotesResponseItem>[];
  service: "quotes";
};

export type QuotesResponseItem = {
  symbol?: string;
  symbolIndex?: number;
  last?: number;
  lastSize?: number;
  open?: number;
  close?: number;
  ask?: number;
  bid?: number;
  high?: number;
  low?: number;
  askSize?: number;
  bidSize?: number;
  netChange?: number;
  netChangePercent?: number;
  mark?: number;
  markChange?: number;
  markChangePercent?: number;
  volume?: number;
};

export default class QuotesMessageHandler
  implements WebSocketApiMessageHandler<string[]>
{
  buildRequest(symbols: string[]): RawPayloadRequest {
    return newPayload({
      header: { service: "quotes", id: "generalQuotes", ver: 0 },
      params: {
        account: "COMBINED ACCOUNT",
        symbols,
        refreshRate: 300,
        fields: ALL_FIELDS,
      },
    });
  }

  service: ApiService = "quotes";
}
