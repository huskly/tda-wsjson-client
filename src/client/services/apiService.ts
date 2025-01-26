export type ApiService =
  | "login"
  | "login/schwab"
  | "cancel_order"
  | "chart"
  | "order_events"
  | "instrument_search"
  | "optionSeries"
  | "option_chain/get"
  | "positions"
  | "place_order"
  | "quotes"
  | "quotes/options"
  | "user_properties"
  | "alerts/create"
  | "alerts/cancel"
  | "alerts/subscribe"
  | "alerts/lookup"
  | "optionSeries/quotes"
  | "market_depth"
  | "watchlist/get"
  | "fake"; // testing only

// make node happy
export const __internalMarker = true
