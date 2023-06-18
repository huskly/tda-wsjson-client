import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import WsJsonClient from "tda-wsjson-client/wsJsonClient";
import env from "react-dotenv";
import { format } from "d3-format";
import FullScreenChart from "./fullScreenChart";
import InstrumentTopPanel from "./instrumentTopPanel";
import { PriceItem } from "../../src/client/services/chartMessageHandler";
import { QuotesResponseItem } from "../../src/client/services/quotesMessageHandler";

export const priceFormat = format(".2f");

function App() {
  const [accessToken] = useState<string>(env.ACCESS_TOKEN || "");
  const [connected, setConnected] = useState(false);
  const [symbol, setSymbol] = useState<string>("");
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [client, setClient] = useState<WsJsonClient | null>();
  const [quote, setQuote] = useState<Partial<QuotesResponseItem>>();
  useEffect(() => {
    (async function () {
      if (accessToken && !connected && !client) {
        console.log("logging in");
        const client = new WsJsonClient(accessToken);
        try {
          await client.authenticate();
          setConnected(true);
          setClient(client);
        } catch (e) {
          console.error(e);
          alert("Login failed");
        }
      }
    })();
  }, [accessToken, client, connected]);
  const onChangeSymbol = useCallback(
    async (symbol: string) => {
      if (symbol && connected && client) {
        setSymbol(symbol);
        const quotesPromise = async () => {
          for await (const { quotes } of client.quotes([symbol])) {
            quotes.forEach(({ ask, bid, askSize, bidSize, last }) => {
              setQuote((oldQuote) => ({
                ask: ask || oldQuote?.ask,
                bid: bid || oldQuote?.bid,
                askSize: askSize || oldQuote?.askSize,
                bidSize: bidSize || oldQuote?.bidSize,
                last: last || oldQuote?.last,
              }));
            });
          }
        };
        const chartPromise = async () => {
          const chartRequest = {
            symbol,
            timeAggregation: "DAY",
            range: "YEAR2",
            includeExtendedHours: true,
          };
          for await (const { candles } of client.chart(chartRequest)) {
            setPrices(candles);
          }
        };
        await Promise.all([quotesPromise(), chartPromise()]);
      }
    },
    [symbol, connected, client, setPrices]
  );
  return (
    <div className="dark:bg-gray-800 flex items-center flex-col min-h-screen">
      {connected && (
        <div className="mt-2">
          <InstrumentTopPanel onChangeSymbol={onChangeSymbol} quote={quote} />
          <FullScreenChart
            cursorStyle="crosshair"
            prices={prices}
            margins={{ right: 0, top: 60 }}
            symbol={symbol}
          />
        </div>
      )}
    </div>
  );
}

export default App;
