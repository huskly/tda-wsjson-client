import React, { useCallback, useState } from "react";
import { priceFormat } from "./App";
import { QuotesResponseItem } from "../../src/client/types/quoteTypes";

const InstrumentTopPanel = ({
  quote,
  onChangeSymbol,
}: {
  quote?: Partial<QuotesResponseItem>;
  onChangeSymbol: (symbol: string) => void;
}) => {
  const [symbol, setSymbol] = useState<string>("");
  const symbolChanged = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (onChangeSymbol) {
        onChangeSymbol(symbol);
      }
    },
    [symbol, onChangeSymbol]
  );
  return (
    <form className="mb-2 flex items-center" onSubmit={symbolChanged}>
      <input
        type="text"
        placeholder="Symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        className="dark:bg-stone-900 px-3 py-3 ml-2 dark:text-gray-500 rounded text-xl w-48"
      />
      <input type="submit" className="hidden" value="Submit" />
      {quote?.last && (
        <div className="ml-4 text-3xl dark:text-gray-200 font-mono">
          {priceFormat(quote?.last)}
        </div>
      )}
      {quote?.ask && (
        <div className="text-lg dark:text-gray-200 font-mono flex flex-col mx-4 text-center">
          <div>Ask</div>
          <div>
            {priceFormat(quote?.ask)} x {quote?.askSize}
          </div>
        </div>
      )}
      {quote?.bid && (
        <div className="text-lg dark:text-gray-200 font-mono flex flex-col mx-4 text-center">
          <div>Bid</div>
          <div>
            {priceFormat(quote?.bid)} x {quote?.bidSize}
          </div>
        </div>
      )}
    </form>
  );
};

export default InstrumentTopPanel;
