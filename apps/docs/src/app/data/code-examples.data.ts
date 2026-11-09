export const OVERLAY_INSETS_EXAMPLE = `<header class="app-header" txOverlayInset>…</header>
<nav class="sticky-tabs" txOverlayInset>…</nav>

// chrome outside Angular: a fixed amount
provideTectra({ preset: Tectra, overlay: { viewportInsets: { top: 56 } } });`;

export const OVERLAY_USAGE_EXAMPLE = `const ref = inject(TxOverlay).open(template, {
  origin: button,
  viewContainerRef,
  placement: 'bottom-start',
  layer: 'popover',
});
ref.placement();      // actual side after a flip
ref.closed.subscribe(reason => …); // 'escape' | 'outside' | 'api' | …`;
