import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPill } from '@tectra-ng/ui/pill';

@Component({
  selector: 'pill-leading-example',
  imports: [TxPill],
  template: `
    <div class="row">
      <tx-pill><span txPillLeading class="flag">🇺🇦</span>Ukraine</tx-pill>
      <tx-pill><span txPillLeading class="avatar">OK</span>Olena K.</tx-pill>
      <tx-pill tone="info"><span txPillLeading class="avatar teal">TS</span>Taras S.</tx-pill>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .flag {
      font-size: 13px;
      line-height: 1;
    }

    .avatar {
      display: grid;
      place-items: center;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--tx-primary-soft);
      color: var(--tx-primary-soft-text);
      font-size: 8px;
    }

    .teal {
      background: var(--tx-surface-card);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PillLeadingExample {}
