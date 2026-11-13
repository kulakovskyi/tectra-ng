/** A `[from, to]` pair of numbers: a domain or a pixel range. */
export type TxRange = [number, number];

/** A scale that maps numbers (values, times) to pixels and back, with round tick values. */
export interface TxContinuousScale {
  /** Which scale it is: `linear`, `log` or `time`. */
  kind: 'linear' | 'log' | 'time';
  /** Value range the scale reads, `[min, max]`. */
  domain: TxRange;
  /** Pixel range the scale writes, `[from, to]`. */
  range: TxRange;
  /** Maps a value to its pixel position. */
  map(value: number): number;
  /** Maps a pixel position back to a value. */
  invert(position: number): number;
  /** Round tick values inside the domain; `count` is the wanted number of ticks. */
  ticks(count?: number): number[];
}

/** Calendar unit of a time tick step. */
export type TxTimeUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

/** A calendar step between time ticks, for example every 6 hours. */
export interface TxTimeInterval {
  /** Calendar unit of the step. */
  unit: TxTimeUnit;
  /** How many units one step covers. */
  step: number;
  /** Approximate length of one step, in ms. */
  duration: number;
}

/** A continuous scale over time in ms that also reports the calendar step of its ticks. */
export interface TxTimeScale extends TxContinuousScale {
  /** Always `time`. */
  kind: 'time';
  /** The calendar step the ticks use for the wanted number of ticks. */
  interval(count?: number): TxTimeInterval;
}

/** A scale of equal bands, one per category. */
export interface TxBandScale {
  /** Always `band`. */
  kind: 'band';
  /** Number of bands. */
  count: number;
  /** Pixel range the bands share, `[from, to]`. */
  range: TxRange;
  /** Distance between the starts of two neighbour bands, in px. */
  step: number;
  /** Width of one band without the inner padding, in px. */
  bandwidth: number;
  /** Pixel position where the band at `index` starts. */
  start(index: number): number;
  /** Pixel position of the middle of the band at `index`. */
  center(index: number): number;
  /** Index of the band under a pixel position, clamped to the first and last band. */
  indexAt(position: number): number;
}

/** A scale of evenly spaced points from one edge to the other, one per category. */
export interface TxPointScale {
  /** Always `point`. */
  kind: 'point';
  /** Number of points. */
  count: number;
  /** Pixel range the points are spread over, `[from, to]`. */
  range: TxRange;
  /** Distance between two neighbour points, in px; `0` for a single point. */
  step: number;
  /** Pixel position of the point at `index`. */
  at(index: number): number;
  /** Index of the point nearest to a pixel position. */
  indexAt(position: number): number;
}

/** An x value of a point: a category label, a number or a date. */
export type TxChartX = string | number | Date;

/** One point of a series with its own x value. */
export interface TxChartPoint {
  /** Category label, number or date of the point. */
  x: TxChartX;
  /** Value of the point; `null` leaves a gap. */
  y: number | null;
}

/** One series of a chart: a name and numbers (one per category) or `{ x, y }` points. */
export interface TxChartSeries {
  /** Name shown in the legend and the tooltip. */
  name: string;
  /** Values: numbers matched to the categories by index, or `{ x, y }` points; `null` leaves a gap. */
  data: readonly (number | null)[] | readonly TxChartPoint[];
  /** Colour of the series; a palette colour by series index when not set. */
  color?: string;
}

/** Turns a value into the text shown for it. */
export type TxChartValueFormatter = (value: number) => string;

/** How values are written: `number`, `integer`, `compact`, `percent` or an own formatter function. */
export type TxChartValueFormat = 'number' | 'integer' | 'compact' | 'percent' | TxChartValueFormatter;

/** Which point a tooltip value belongs to. */
export interface TxChartTooltipContext {
  /** Index of the series. */
  seriesIndex: number;
  /** Index of the point inside the series. */
  dataPointIndex: number;
}

/** Turns a tooltip value into text; gets the series and point index as context. */
export type TxChartTooltipFormatter = (value: number, context: TxChartTooltipContext) => string;

/** Side of the chart where the legend sits. */
export type TxChartLegendPosition = 'top' | 'bottom' | 'left' | 'right';

/** How the legend items are aligned along their side. */
export type TxChartLegendAlign = 'start' | 'center' | 'end';

/** Look of a legend item: `dot`, `line`, `pill` or `stat` (the value in large type). */
export type TxChartLegendVariant = 'dot' | 'line' | 'pill' | 'stat';

/** Shape of the colour marker of a legend item. */
export type TxChartLegendMarker = 'dot' | 'line';

/** One legend entry: a colour marker, a label and optional values. */
export interface TxChartLegendItem {
  /** Identifies the item in `toggled` and `hovered` events. */
  key: string;
  /** Text of the item. */
  label: string;
  /** Colour of the marker. */
  color: string;
  /** Shows the item as switched off (its series is hidden). */
  hidden?: boolean;
  /** Marker shape, `dot` or `line`. */
  marker?: TxChartLegendMarker;
  /** Value text next to the label; the large figure in the `stat` variant. */
  value?: string;
  /** Share text shown after the value. */
  percent?: string;
  /** Small text under the value in the `stat` variant. */
  caption?: string;
}

/** Context of an own legend item template: the item and its index. */
export interface TxChartLegendContext {
  /** The legend item to draw. */
  $implicit: TxChartLegendItem;
  /** Position of the item in the legend. */
  index: number;
}

/** One line of a tooltip: a colour marker, a name and a formatted value. */
export interface TxChartTooltipRow {
  /** Series or category name. */
  label: string;
  /** Formatted value text. */
  value: string;
  /** Colour of the marker. */
  color: string;
  /** Value as a number; `null` when there is none. */
  raw: number | null;
  /** Index of the series the row belongs to. */
  seriesIndex: number;
  /** Marks the row of the hovered series. */
  active?: boolean;
  /** Formatted share of the whole, for example a percent. */
  share?: string;
}

/** Content and position of a chart tooltip. */
export interface TxChartTooltipData {
  /** Heading of the tooltip, usually the category or date. */
  title: string;
  /** Lines of the tooltip. */
  rows: TxChartTooltipRow[];
  /** Index of the category the tooltip shows. */
  index: number;
  /** Horizontal anchor of the tooltip inside the chart box, in px. */
  x: number;
  /** Vertical anchor of the tooltip inside the chart box, in px. */
  y: number;
  /** Side of the anchor the tooltip opens on; `tooltipPlacement` of the frame when not set. */
  placement?: TxChartTooltipPlacement;
  /** Formatted total shown below the rows. */
  total?: string;
  /** Extra line of text shown below the rows. */
  note?: string;
}

/** Side of the anchor a tooltip opens on. */
export type TxChartTooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

/** Context of an own tooltip template. */
export interface TxChartTooltipTemplateContext {
  /** The tooltip data to draw. */
  $implicit: TxChartTooltipData;
}

/** What a tooltip shows: every series at the category (`shared`) or only the hovered one (`single`). */
export type TxChartTooltipMode = 'shared' | 'single';

/** What to do with category labels that do not fit: `auto`, `rotate` or `skip`. */
export type TxChartLabelMode = 'auto' | 'rotate' | 'skip';

/** Side of the plot an axis sits on. */
export type TxChartAxisPosition = 'top' | 'bottom' | 'left' | 'right';

/** Side of the plot the x axis sits on. */
export type TxChartXAxisPosition = 'bottom' | 'top';

/** Side of the plot the y axis sits on. */
export type TxChartYAxisPosition = 'left' | 'right';

/** A tick of an axis: its value, pixel position and text. */
export interface TxChartTick {
  /** Tick value. */
  value: number;
  /** Pixel position along the axis. */
  position: number;
  /** Formatted tick text. */
  label: string;
}

/** A text of an axis placed in the SVG: tick label with its anchor and rotation. */
export interface TxChartAxisLabel {
  /** Text of the label, shortened when it is too long. */
  text: string;
  /** Horizontal position, in px. */
  x: number;
  /** Vertical position, in px. */
  y: number;
  /** SVG `text-anchor` of the text. */
  anchor: 'start' | 'middle' | 'end';
  /** SVG `dominant-baseline` of the text. */
  baseline: 'auto' | 'middle' | 'hanging';
  /** Rotation around the label position, in degrees. */
  rotate: number;
  /** Full text for a tooltip when `text` was shortened. */
  title?: string;
}

/** One axis ready to draw: its side, labels and title. */
export interface TxChartAxisModel {
  /** Side of the plot the axis sits on. */
  position: TxChartAxisPosition;
  /** Tick labels of the axis. */
  labels: TxChartAxisLabel[];
  /** Axis title with its position and rotation in degrees. */
  title?: { text: string; x: number; y: number; rotate: number };
}

/** A straight line of the grid or the zero line, in px. */
export interface TxChartGridLine {
  /** Start, horizontal position. */
  x1: number;
  /** Start, vertical position. */
  y1: number;
  /** End, horizontal position. */
  x2: number;
  /** End, vertical position. */
  y2: number;
  /** Marks the line at the value zero. */
  zero?: boolean;
}

/** Everything `tx-chart-axes` draws: axes, grid lines and the zero line. */
export interface TxChartAxesModel {
  /** Axes with their labels and titles. */
  axes: TxChartAxisModel[];
  /** Grid lines. */
  grid: TxChartGridLine[];
  /** Line at the value zero, or `null` when zero is outside the domain. */
  zero: TxChartGridLine | null;
}

/** The plot area inside the chart box, in px. */
export interface TxChartPlot {
  /** Distance from the left edge of the box. */
  left: number;
  /** Distance from the top edge of the box. */
  top: number;
  /** Width of the plot area. */
  width: number;
  /** Height of the plot area. */
  height: number;
}

/** Size of a chart box, in px. */
export interface TxChartSize {
  /** Width in px. */
  width: number;
  /** Height in px. */
  height: number;
}

/** A column of the hidden data table (one series). */
export interface TxChartTableColumn {
  /** Identifies the column. */
  key: string;
  /** Column heading, usually the series name. */
  label: string;
}

/** The hidden data table that gives screen readers the values of a chart. */
export interface TxChartTable {
  /** Columns, one per series. */
  columns: TxChartTableColumn[];
  /** Rows, one per category, with a text per column. */
  rows: { label: string; cells: string[] }[];
}

/** Name of a part of the chart frame that takes pass-through attributes. */
export type TxChartPart = 'root' | 'legend' | 'legendItem' | 'plot' | 'svg' | 'grid' | 'axis' | 'series' | 'hoverBand' | 'tooltip' | 'empty' | 'skeleton';

/** A rectangle in px. */
export interface TxChartRect {
  /** Left edge. */
  x: number;
  /** Top edge. */
  y: number;
  /** Width. */
  width: number;
  /** Height. */
  height: number;
}

/** Chart height: a number of px or a CSS `px` string. */
export type TxChartHeight = number | string;

/** A pointer event of the frame, with the position inside the plot. */
export interface TxChartPointerEvent {
  /** Horizontal position inside the plot, in px. */
  x: number;
  /** Vertical position inside the plot, in px. */
  y: number;
  /** What happened: `move`, `leave`, `click`, `down` or `up`. */
  type: 'move' | 'leave' | 'click' | 'down' | 'up';
  /** Element under the pointer. */
  target: Element | null;
  /** Pressed buttons bitmask of the DOM event. */
  buttons?: number;
  /** Kind of pointer: `mouse`, `touch` or `pen`. */
  pointerType?: string;
}

/** A zoom request from Ctrl + wheel or a pinch. */
export interface TxChartZoomEvent {
  /** Horizontal position of the zoom centre inside the plot, in px. */
  x: number;
  /** Zoom factor; above 1 zooms in, below 1 zooms out. */
  factor: number;
}

/** A sideways pan request from a swipe. */
export interface TxChartPanEvent {
  /** Horizontal move since the last event, in px. */
  dx: number;
}

/** A key press forwarded from the frame. */
export interface TxChartKeyEvent {
  /** Value of `KeyboardEvent.key`. */
  key: string;
  /** The original keyboard event. */
  event: KeyboardEvent;
}
