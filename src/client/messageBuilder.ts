export default class MessageBuilder {
  connectionRequest() {
    return {
      ver: "27.*.*",
      fmt: "json-patches-structured",
      heartbeat: "2s",
    };
  }

  quotesRequest(symbols: string[]) {
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

  loginRequest(accessToken: string) {
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
