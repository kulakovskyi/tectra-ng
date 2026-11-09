import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxHoverEffect } from '@tectra-ng/blocks/hover-effect';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCard } from '@tectra-ng/ui/card';
import { TxPill } from '@tectra-ng/ui/pill';

@Component({
  selector: 'hover-effect-basic-example',
  imports: [TxHoverEffect, TxButton, TxCard, TxPill],
  template: `
    <tx-hover-effect class="plan">
      <tx-card title="Pro" subtitle="For growing teams">
        <div class="price">$24 <span>per month</span></div>
        <div class="pills">
          <tx-pill size="small" tone="primary" value="Unlimited projects" />
          <tx-pill size="small" value="Priority support" />
        </div>
        <button txButton fluid>Choose Pro</button>
      </tx-card>
    </tx-hover-effect>
  `,
  styles: `
    .plan {
      width: 100%;
      max-width: 300px;
    }

    .price {
      margin-bottom: 12px;
      font-size: 28px;
      font-weight: 600;
    }

    .price span {
      color: var(--tx-text-muted);
      font-size: 14px;
      font-weight: 400;
    }

    .pills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HoverEffectBasicExample {}
