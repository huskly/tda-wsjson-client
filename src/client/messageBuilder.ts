import { RawPayloadRequest } from "./tdaWsJsonTypes";

export type ChartRequestParams = {
  symbol: string;
  timeAggregation: string;
  range: string;
  includeExtendedHours: boolean;
};

export default class MessageBuilder {
  connectionRequest() {
    return {
      ver: "27.*.*",
      fmt: "json-patches-structured",
      heartbeat: "2s",
    };
  }

  accountPositionsRequest(accountNumber: string): RawPayloadRequest {
    return {
      payload: [
        {
          header: { service: "positions", ver: 0, id: "positions" },
          params: {
            account: accountNumber,
            betaWeightingSymbols: [],
            //additional fields are: MARK DELTA GAMMA THETA VEGA RHO OPEN_COST BP_EFFECT MARK_CHANGE MARGIN
            fields: [
              "QUANTITY",
              "OPEN_PRICE",
              "NET_LIQ",
              "PL_OPEN",
              "PL_YTD",
              "PL_DAY",
            ],
          },
        },
      ],
    };
  }

  quotesRequest(symbols: string[]): RawPayloadRequest {
    return {
      payload: [
        {
          header: { service: "quotes", id: "generalQuotes", ver: 0 },
          params: {
            account: "COMBINED ACCOUNT",
            symbols,
            refreshRate: 300,
            fields: [
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
            ],
          },
        },
      ],
    };
  }

  userProperties(): RawPayloadRequest {
    return {
      payload: [
        {
          header: { service: "user_properties", id: "user_properties", ver: 0 },
          params: {},
        },
      ],
    };
  }

  chartRequest({
    symbol,
    timeAggregation,
    range,
    includeExtendedHours,
  }: ChartRequestParams): RawPayloadRequest {
    return {
      payload: [
        {
          header: { service: "chart", id: "chart-page-chart-1", ver: 1 },
          params: {
            symbol,
            timeAggregation,
            studies: [],
            range,
            extendedHours: includeExtendedHours,
          },
        },
      ],
    };
  }

  loginRequest(accessToken: string): RawPayloadRequest {
    return {
      payload: [
        {
          header: { service: "login", id: "login", ver: 0 },
          params: {
            accessToken,
            domain: "TOS",
            platform: "PROD",
            token: "",
            tag: "TOSWeb",
          },
        },
      ],
    };
  }
}
