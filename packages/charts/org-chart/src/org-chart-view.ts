import { TxOrgChartPoint, TxOrgChartSize, TxOrgChartView } from './org-chart.types';

/** Zoom limits (`min`, `max`), the factor of one button press (`step`) and the starting zoom (`initial`). */
export const TX_ORG_CHART_ZOOM = { min: 0.2, max: 2, step: 1.2, initial: 1 } as const;
/** Smallest zoom when the chart focuses a node (`focusId`). */
export const TX_ORG_CHART_FOCUS_ZOOM = 1.25;
/** How fast the wheel changes the zoom. */
export const TX_ORG_CHART_WHEEL_SPEED = 0.0015;
/** Largest wheel step taken into account at once. */
export const TX_ORG_CHART_WHEEL_MAX_DELTA = 120;
/** Space in px kept around the tree when it is fitted. */
export const TX_ORG_CHART_PADDING = 40;
/** Size in px of the minimap; its height shrinks to the tree down to `minHeight`. */
export const TX_ORG_CHART_MINIMAP = { width: 240, height: 170, minHeight: 56 } as const;
/** Size in px of the minimap on a narrow canvas. */
export const TX_ORG_CHART_MINIMAP_COMPACT = { width: 140, height: 100, minHeight: 40 } as const;
/** Canvas width in px under which the compact minimap is used. */
export const TX_ORG_CHART_COMPACT_WIDTH = 480;

/** Keeps a zoom factor between the smallest and the biggest allowed. */
export function clampZoom(zoom: number): number {
  return Math.min(TX_ORG_CHART_ZOOM.max, Math.max(TX_ORG_CHART_ZOOM.min, zoom));
}

/** Zooms the view around a point so that the point stays under the cursor. */
export function zoomAt(view: TxOrgChartView, zoom: number, at: TxOrgChartPoint): TxOrgChartView {
  const next = clampZoom(zoom);
  const ratio = next / view.zoom;
  return { zoom: next, x: at.x - (at.x - view.x) * ratio, y: at.y - (at.y - view.y) * ratio };
}

/**
 * Moves the view so that a point of the canvas is in the middle of the viewport, optionally at a new zoom.
 */
export function centerOn(view: TxOrgChartView, viewport: TxOrgChartSize, point: TxOrgChartPoint, zoom = view.zoom): TxOrgChartView {
  const next = clampZoom(zoom);
  return { zoom: next, x: viewport.width / 2 - point.x * next, y: viewport.height / 2 - point.y * next };
}

/**
 * View that fits the whole stage into the viewport, at most at 100% and centered; `top` leaves room for the toolbar. `null` when sizes are not known yet.
 */
export function fitView(viewport: TxOrgChartSize, stage: TxOrgChartSize, top = 0): TxOrgChartView | null {
  if (!viewport.width || !stage.width || !stage.height) return null;
  const zoom = Math.max(
    TX_ORG_CHART_ZOOM.min,
    Math.min(TX_ORG_CHART_ZOOM.initial, (viewport.width - TX_ORG_CHART_PADDING * 2) / stage.width, (viewport.height - top - TX_ORG_CHART_PADDING * 2) / stage.height),
  );
  return {
    zoom,
    x: (viewport.width - stage.width * zoom) / 2,
    y: top + Math.max(0, (viewport.height - top - stage.height * zoom) / 2),
  };
}

/** Tells a mouse wheel from a trackpad scroll: a mouse sends big whole steps along Y only. */
export function wheelIsMouse(event: Pick<WheelEvent, 'deltaMode' | 'deltaX' | 'deltaY'>): boolean {
  return event.deltaMode !== 0 || (event.deltaX === 0 && Number.isInteger(event.deltaY) && Math.abs(event.deltaY) >= 40);
}

/** New zoom after a wheel step; a pinch gesture changes it faster. */
export function wheelZoom(zoom: number, deltaY: number, pinch: boolean): number {
  const delta = Math.max(-TX_ORG_CHART_WHEEL_MAX_DELTA, Math.min(TX_ORG_CHART_WHEEL_MAX_DELTA, deltaY));
  return zoom * Math.exp(-delta * TX_ORG_CHART_WHEEL_SPEED * (pinch ? 4 : 1));
}

/** Part of the tree in px that always stays inside the viewport when panning. */
export const TX_ORG_CHART_KEEP_VISIBLE = 64;

/** Limits the offset of the view so that at least `keep` px of the stage stay in the viewport. */
export function boundView(view: TxOrgChartView, viewport: TxOrgChartSize, stage: TxOrgChartSize, keep = TX_ORG_CHART_KEEP_VISIBLE): TxOrgChartView {
  if (!viewport.width || !stage.width) return view;
  const width = stage.width * view.zoom;
  const height = stage.height * view.zoom;
  const keepX = Math.min(keep, width, viewport.width);
  const keepY = Math.min(keep, height, viewport.height);
  return {
    zoom: view.zoom,
    x: Math.min(viewport.width - keepX, Math.max(keepX - width, view.x)),
    y: Math.min(viewport.height - keepY, Math.max(keepY - height, view.y)),
  };
}
