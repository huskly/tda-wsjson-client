import { MarketDepthResponse } from "../client/services/marketDepthMessageHandler";

type MarketDepthQuote = { [name: string]: { price: number; size: number } };

export default class MarketDepthStateUpdater {
  readonly askQuotes: MarketDepthQuote = {};
  readonly bidQuotes: MarketDepthQuote = {};

  constructor() {}

  handleMessage(message: MarketDepthResponse) {
    const { askQuotes, bidQuotes } = message;
    askQuotes.forEach(({ name, price, size }) => {
      if (price) {
        this.askQuotes[name] = { price, size };
      } else {
        this.askQuotes[name].size = size;
      }
    });
    bidQuotes.forEach(({ name, price, size }) => {
      if (price) {
        this.bidQuotes[name] = { price, size };
      } else {
        this.bidQuotes[name].size = size;
      }
    });
  }
}
