import React, { FormEvent, useCallback, useState } from "react";
import "./App.css";
import WsJsonClient from "tda-wsjson-client/wsJsonClient";
import { isSuccessfulLoginResponse } from "tda-wsjson-client/tdaWsJsonTypes";

function App() {
  const [accessToken, setAccessToken] = useState<string>();
  const [connected, setConnected] = useState(false);
  const [symbol, setSymbol] = useState<string>("");
  const [client, setClient] = useState<WsJsonClient | null>();
  const onClickConnect = useCallback(async () => {
    if (accessToken) {
      const client = new WsJsonClient(accessToken);
      const loginResponse = await client.connect();
      const successful = isSuccessfulLoginResponse(loginResponse);
      if (successful) {
        setConnected(successful);
        setClient(client);
      } else {
        alert("Login failed");
      }
    }
  }, [accessToken]);
  const onChangeSymbol = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (symbol && connected && client) {
        for await (const event of client.quotes([symbol])) {
          console.log(event);
        }
      }
    },
    [symbol, connected]
  );
  return (
    <div className="dark:bg-gray-800 flex items-center flex-col h-screen">
      <header className="flex pt-10 flex-col">
        <textarea
          onChange={(e) => setAccessToken(e.target.value)}
          placeholder="Access Token"
          className="dark:text-gray-500 py-3 px-6 rounded mb-2 w-96 h-32 text-xs disabled:bg-gray-500"
        />
        <button
          onClick={onClickConnect}
          className="bg-amber-700 px-4 py-2 rounded hover:bg-amber-600 text-2xl text-gray-100"
          disabled={connected}
        >
          {connected ? "Connected" : "Connect"}
        </button>
      </header>
      <div className="mt-8">
        <form onSubmit={(e) => onChangeSymbol(e)}>
          <input
            type="text"
            placeholder="Symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="px-3 py-3 dark:text-gray-500 rounded text-2xl"
          />
          <input type="submit" className="hidden" value="Submit" />
        </form>
      </div>
    </div>
  );
}

export default App;
