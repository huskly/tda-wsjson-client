import {
  ColorType,
  createChart,
  CrosshairMode,
  HistogramSeriesPartialOptions,
  IChartApi,
  ISeriesApi,
  MouseEventParams,
  PriceLineOptions,
  PriceScaleMode,
  Time,
  TouchMouseEventData,
} from "lightweight-charts";
import React, { useEffect, useRef, useState } from "react";
import { format } from "d3-format";
import { OHLC } from "../../src/client/services/chartMessageHandler";

export type ChartMouseMoveHandlerParams = {
  mouseEventParams: MouseEventParams;
  price?: number;
  hoveredPriceLine?: PriceLineOptions;
};

export type ChartClickHandlerParams = {
  price: number;
  event?: TouchMouseEventData;
  clickedPriceLine?: PriceLineOptions;
};

export type CandleStickData = { time: Time } & OHLC;

export type CandleStickChartColors = Partial<{
  backgroundColor: string;
  upColor: string;
  downColor: string;
  wickUpColor: string;
  wickDownColor: string;
  gridColor: string;
  textColor: string;
}>;

type ChartInstance = {
  chart: IChartApi;
  candleSeries: ISeriesApi<"Candlestick">;
  volumeSeries: ISeriesApi<"Histogram">;
};

export type CandleStickChartProps = {
  data: CandleStickData[];
  height: string;
  width: string;
  cursorStyle?: "crosshair" | "grab" | "grabbing";
  priceLines: Set<PriceLineOptions>;
  onChartClick?: (params: ChartClickHandlerParams) => void;
  onPriceLineClick?: (params: ChartClickHandlerParams) => void;
  onMouseMove?: (params: ChartMouseMoveHandlerParams) => void;
  priceScaleMode?: PriceScaleMode;
  colors?: CandleStickChartColors;
};

type InternalChartMouseMoveClickParams = Pick<
  ChartClickHandlerParams,
  "price" | "event"
> & {
  clickedObjectId?: unknown;
};

type InternalChartMouseMoveParams = Pick<
  ChartMouseMoveHandlerParams,
  "mouseEventParams" | "price"
> & {
  hoveredObjectId?: unknown;
};

// TODO: These should be configurable via user settings UI
const UP_COLOR = "#26a69a";
const DOWN_COLOR = "#ef5350";
const VOL_ALPHA = "60";
const priceFormat = format(".2f");

const DEFAULT_CHART_OPTIONS = {
  layout: {
    background: { type: ColorType.Solid, color: "transparent" },
    textColor: "#d1d5db",
  },
  crosshair: { mode: CrosshairMode.Normal },
  grid: {
    vertLines: { color: "#374151" },
    horzLines: { color: "#374151" },
  },
};

const DEFAULT_CHART_COLORS: CandleStickChartColors = {
  upColor: UP_COLOR,
  downColor: DOWN_COLOR,
  wickUpColor: UP_COLOR,
  wickDownColor: DOWN_COLOR,
};

const DEFAULT_VOLUME_SERIES_OPTIONS: HistogramSeriesPartialOptions = {
  color: UP_COLOR,
  priceFormat: { type: "volume" },
  priceScaleId: "",
};

const CandleStickChart = ({
  data,
  height,
  width,
  priceScaleMode = PriceScaleMode.Logarithmic,
  cursorStyle = "crosshair",
  colors = {},
}: CandleStickChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const ohlcTooltipRef = useRef<HTMLDivElement | null>(null);
  const [candleStickSeries, setCandleStickSeries] =
    useState<ISeriesApi<"Candlestick"> | null>(null);
  const [volumeSeries, setVolumeSeries] =
    useState<ISeriesApi<"Histogram"> | null>(null);

  useEffect(() => {
    const element = chartContainerRef.current;
    if (element) {
      element.style.cursor = cursorStyle;
    }
  }, [cursorStyle]);

  useEffect(() => {
    const { chart, candleSeries, volumeSeries } = createCandleStickChart({
      container: chartContainerRef.current!,
      ohlcTooltipRef: ohlcTooltipRef.current!,
      chartColors: colors,
      priceScaleMode,
    });
    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef?.current?.clientWidth,
        height: chartContainerRef?.current?.clientHeight,
      });
    };
    volumeSeries.setData(candleDataToVolumeData(data));
    candleSeries.setData(data);
    setCandleStickSeries(candleSeries);
    setVolumeSeries(volumeSeries);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (candleStickSeries) {
      candleStickSeries.setData(data);
    }
    if (volumeSeries) {
      volumeSeries.setData(candleDataToVolumeData(data));
    }
  }, [data]);

  return (
    <div
      ref={chartContainerRef}
      className="relative w-full"
      style={{ height, width }}
    >
      <div
        className="absolute top-4 left-4 z-50 text-xs dark:text-gray-200 font-mono"
        ref={ohlcTooltipRef}
      />
    </div>
  );
};

const candleDataToVolumeData = (candleData: CandleStickData[]) =>
  candleData.map((item) => {
    const color =
      item.close > item.open
        ? `${UP_COLOR}${VOL_ALPHA}`
        : `${DOWN_COLOR}${VOL_ALPHA}`;
    return { time: item.time, color, value: item.volume };
  });

function createCandleStickChart({
  container,
  ohlcTooltipRef,
  chartColors = DEFAULT_CHART_COLORS,
  priceScaleMode,
  onClickChart = () => {},
}: {
  container: HTMLElement;
  ohlcTooltipRef: HTMLElement;
  chartColors: CandleStickChartColors;
  priceScaleMode: PriceScaleMode;
  onClickChart?: (params: InternalChartMouseMoveClickParams) => void;
  onChartMove?: (params: InternalChartMouseMoveParams) => void;
}): ChartInstance {
  const chart = createChart(container, DEFAULT_CHART_OPTIONS);
  const candleSeries = chart.addCandlestickSeries({
    ...chartColors,
    borderVisible: false,
  });
  const volumeSeries = chart.addHistogramSeries(DEFAULT_VOLUME_SERIES_OPTIONS);
  volumeSeries.priceScale().applyOptions({
    scaleMargins: { top: 0.7, bottom: 0 },
  });
  chart.applyOptions({
    timeScale: { timeVisible: true, secondsVisible: true },
    rightPriceScale: { mode: priceScaleMode },
  });
  chart.subscribeCrosshairMove((param) =>
    updateOnHoverOHLC(param, ohlcTooltipRef)
  );
  chart.subscribeClick(({ hoveredObjectId, point, sourceEvent }) => {
    const price = candleSeries.coordinateToPrice(point?.y!);
    if (onClickChart) {
      onClickChart({
        price: price!,
        event: sourceEvent,
        clickedObjectId: hoveredObjectId,
      });
    }
  });
  return { chart, candleSeries, volumeSeries };
}

const updateOnHoverOHLC = (param: MouseEventParams, element: HTMLElement) => {
  if (param?.seriesData && param?.seriesData.size > 0) {
    const value = param.seriesData.values().next().value;
    const open = priceFormat(value.open);
    const close = priceFormat(value.close);
    const high = priceFormat(value.high);
    const low = priceFormat(value.low);
    element.innerHTML = `O ${open} H ${high} L ${low} C ${close}`;
  }
};

export default CandleStickChart;
