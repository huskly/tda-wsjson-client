import { MarketDepthResponse } from "../client/services/marketDepthMessageHandler.js";

type MarketDepthQuote = {
  [name: string]: { price?: number; size?: number; name?: string };
};

export default class MarketDepthStateUpdater {
  readonly askQuotes: MarketDepthQuote = {};
  readonly bidQuotes: MarketDepthQuote = {};

  constructor() {}

  handleMessage(message: MarketDepthResponse) {
    const { askQuotes, bidQuotes } = message;
    askQuotes.forEach(({ index, name, price, size }, i) => {
      if (index !== undefined) {
        const quote = this.askQuotes[index];
        if (price !== undefined) quote.price = price;
        if (name !== undefined) quote.name = name;
        if (size !== undefined) quote.size = size;
      } else {
        this.askQuotes[i] = { price, size, name };
      }
    });
    bidQuotes.forEach(({ index, name, price, size }, i) => {
      if (index !== undefined) {
        const quote = this.bidQuotes[index];
        if (price !== undefined) quote.price = price;
        if (name !== undefined) quote.name = name;
        if (size !== undefined) quote.size = size;
      } else {
        this.bidQuotes[i] = { price, size, name };
      }
    });
  }
}
