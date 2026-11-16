import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSelectButton } from '@tectra-ng/ui/select-button';

@Component({
  selector: 'select-button-design-tokens-example',
  imports: [TxSelectButton],
  template: `<tx-select-button
    ariaLabel="Theme"
    [dt]="tokens"
    [options]="themes"
    [(value)]="theme"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectButtonDesignTokensExample {
  readonly tokens = {
    root: { borderRadius: '9999px', padding: '4px' },
    item: {
      borderRadius: '9999px',
      padding: '8px 16px',
      activeBackground: 'var(--tx-surface-card)',
      activeColor: 'var(--tx-text-primary)',
      activeShadow: '0 1px 3px rgb(0 0 0 / 0.12)',
    },
  };
  readonly themes = [
    { label: 'Light', value: 'light', icon: 'sun' },
    { label: 'Dark', value: 'dark', icon: 'moon' },
    { label: 'System', value: 'system', icon: 'desktop' },
  ];
  readonly theme = signal<unknown>('system');
}
