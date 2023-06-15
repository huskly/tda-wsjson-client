export type OHLC = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type PriceItem = { date: Date } & OHLC;
