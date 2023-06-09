export default class MessageBuilder {
  connectionRequest() {
    return {
      ver: "27.*.*",
      fmt: "json-patches-structured",
      heartbeat: "2s",
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
