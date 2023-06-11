import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import WsJsonClient from "tda-wsjson-client/wsJsonClient";
import env from "react-dotenv";
import ReactJson from "react-json-view";

function App() {
  const [accessToken] = useState<string>(env.ACCESS_TOKEN || "");
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [symbol, setSymbol] = useState<string>("ABNB");
  const [client, setClient] = useState<WsJsonClient | null>();
  useEffect(() => {
    (async function () {
      if (accessToken && !connected && !client) {
        console.log("logging in");
        const client = new WsJsonClient(accessToken);
        try {
          const response = await client.authenticate();
          setJsonData((prev) => [response, ...prev]);
          setConnected(true);
          setClient(client);
        } catch (e) {
          console.error(e);
          alert("Login failed");
        }
      }
    })();
  }, [accessToken, client, connected]);
  const onClickBtn = useCallback(
    async (e: React.MouseEvent<HTMLInputElement>, action: string) => {
      e.preventDefault();
      if (symbol && connected && client) {
        switch (action) {
          case "quotes": {
            for await (const event of client.quotes([symbol])) {
              setJsonData((prev) => [event, ...prev]);
            }
            break;
          }
          case "chart": {
            const chartRequest = {
              symbol,
              timeAggregation: "DAY",
              range: "YEAR2",
              includeExtendedHours: true,
            };
            for await (const event of client.chart(chartRequest)) {
              setJsonData((prev) => [event, ...prev]);
            }
          }
        }
      }
    },
    [symbol, connected, client]
  );
  return (
    <div className="dark:bg-gray-800 flex items-center flex-col min-h-screen">
      {connected && (
        <div className="mt-8">
          <form className="mb-8">
            <input
              type="text"
              placeholder="Symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="px-3 py-3 dark:text-gray-500 rounded text-2xl"
            />
            <input type="submit" className="hidden" value="Submit" />
            <input
              type="button"
              value="Quotes"
              onClick={(e) => onClickBtn(e, "quotes")}
              className="px-4 py-3 bg-amber-600 rounded ml-2 text-2xl hover:bg-amber-400"
            />
            <input
              type="button"
              value="Chart"
              onClick={(e) => onClickBtn(e, "chart")}
              className="px-4 py-3 bg-lime-600 rounded ml-2 text-2xl hover:bg-lime-400"
            />
          </form>
          <ReactJson src={jsonData} theme="monokai" style={{ width: "80vw" }} />
        </div>
      )}
    </div>
  );
}

export default App;
