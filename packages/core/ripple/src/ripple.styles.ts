import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'tx-ripple-styles',
  template: '',
  styles: `
    .tx-ripple-host { position: relative; overflow: hidden; }
    .tx-ripple {
      position: absolute;
      border-radius: 50%;
      background: currentColor;
      opacity: 0.25;
      transform: scale(0);
      pointer-events: none;
      animation: tx-ripple 0.5s ease-out forwards;
    }
    @keyframes tx-ripple { to { transform: scale(2.5); opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .tx-ripple { display: none; } }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TxRippleStyles {}
