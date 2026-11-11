import { TxOrgChartPoint, TxOrgChartSize, TxOrgChartView } from './org-chart.types';

export const TX_ORG_CHART_ZOOM = { min: 0.2, max: 2, step: 1.2, initial: 1 } as const;
export const TX_ORG_CHART_FOCUS_ZOOM = 1.25;
export const TX_ORG_CHART_WHEEL_SPEED = 0.0015;
export const TX_ORG_CHART_WHEEL_MAX_DELTA = 120;
export const TX_ORG_CHART_PADDING = 40;
export const TX_ORG_CHART_MINIMAP = { width: 240, height: 170, minHeight: 56 } as const;
export const TX_ORG_CHART_MINIMAP_COMPACT = { width: 140, height: 100, minHeight: 40 } as const;
export const TX_ORG_CHART_COMPACT_WIDTH = 480;

export function clampZoom(zoom: number): number {
  return Math.min(TX_ORG_CHART_ZOOM.max, Math.max(TX_ORG_CHART_ZOOM.min, zoom));
}

export function zoomAt(view: TxOrgChartView, zoom: number, at: TxOrgChartPoint): TxOrgChartView {
  const next = clampZoom(zoom);
  const ratio = next / view.zoom;
  return { zoom: next, x: at.x - (at.x - view.x) * ratio, y: at.y - (at.y - view.y) * ratio };
}

export function centerOn(view: TxOrgChartView, viewport: TxOrgChartSize, point: TxOrgChartPoint, zoom = view.zoom): TxOrgChartView {
  const next = clampZoom(zoom);
  return { zoom: next, x: viewport.width / 2 - point.x * next, y: viewport.height / 2 - point.y * next };
}

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

export function wheelIsMouse(event: Pick<WheelEvent, 'deltaMode' | 'deltaX' | 'deltaY'>): boolean {
  return event.deltaMode !== 0 || (event.deltaX === 0 && Number.isInteger(event.deltaY) && Math.abs(event.deltaY) >= 40);
}

export function wheelZoom(zoom: number, deltaY: number, pinch: boolean): number {
  const delta = Math.max(-TX_ORG_CHART_WHEEL_MAX_DELTA, Math.min(TX_ORG_CHART_WHEEL_MAX_DELTA, deltaY));
  return zoom * Math.exp(-delta * TX_ORG_CHART_WHEEL_SPEED * (pinch ? 4 : 1));
}

export const TX_ORG_CHART_KEEP_VISIBLE = 64;

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
