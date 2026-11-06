export const ACCENT_PRESET_EXAMPLE = `import { Tectra, createTectraPreset } from '@tectra-ng/themes';

provideTectra({ preset: Tectra, ripple: true });

provideTectra({ preset: createTectraPreset({ style: 'edge', primary: 'violet', surface: 'zinc' }) });

inject(TxThemeService).applyPreset(createTectraPreset({ style: 'soft', primary: 'noir', surface: 'slate' }));
inject(TxThemeService).setRipple(false);`;

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
