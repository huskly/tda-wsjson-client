import * as React from "react";
import { useEffect, useState } from "react";
import CandleStickChart, {
  ChartClickHandlerParams,
  ChartMouseMoveHandlerParams,
} from "./candleStickChart";
import { isEmpty } from "lodash";
import { PriceLineOptions, Time } from "lightweight-charts";
import { OHLC } from "../../src/client/types/chartTypes";

export type ChartData = { date: any } & OHLC;

export type ChartMargins = {
  top: number;
  right: number;
  left: number;
  bottom: number;
};

export type FullscreenChartProps = {
  symbol: string;
  priceLines?: Set<PriceLineOptions>;
  margins?: Partial<ChartMargins>;
  prices: ChartData[];
  cursorStyle: "crosshair" | "grab" | "grabbing";
  onChartClick?: (params: ChartClickHandlerParams) => void;
  onPriceLineClick?: (params: ChartClickHandlerParams) => void;
  onMouseMove?: (params: ChartMouseMoveHandlerParams) => void;
};

/** A candlestick chart that uses the entire screen bounds, with an optional margin */
const FullscreenChart = ({
  prices,
  margins,
  priceLines = new Set(),
  onChartClick,
  cursorStyle,
  onPriceLineClick,
  onMouseMove,
}: FullscreenChartProps) => {
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const topMargin = margins?.top || 0;
  const rightMargin = margins?.right || 0;
  const bottomMargin = margins?.bottom || 0;
  const leftMargin = margins?.left || 0;
  const handleResize = () => {
    setWindowHeight(window.innerHeight);
    setWindowWidth(window.innerWidth);
  };
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return function cleanup() {
      window.removeEventListener("resize", handleResize);
    };
  }, [topMargin, leftMargin, rightMargin, bottomMargin]);
  const height = windowHeight - topMargin - bottomMargin;
  const width = windowWidth - rightMargin - leftMargin;
  return !isEmpty(prices) ? (
    <CandleStickChart
      height={`${height}px`}
      width={`${width}px`}
      priceLines={priceLines}
      cursorStyle={cursorStyle}
      onChartClick={onChartClick}
      onPriceLineClick={onPriceLineClick}
      onMouseMove={onMouseMove}
      data={prices.map(({ date, ...rest }) => ({
        time: (date / 1000) as Time,
        ...rest,
      }))}
    />
  ) : (
    <></>
  );
};

export default FullscreenChart;
