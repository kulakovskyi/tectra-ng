import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxKnob, TxKnobValueTemplate } from '@tectra-ng/ui/knob';

@Component({
  selector: 'knob-template-example',
  imports: [FormsModule, TxKnob, TxKnobValueTemplate],
  template: `
    <tx-knob arc="ring" ariaLabel="Daily goal" [size]="140" [(ngModel)]="steps">
      <ng-template txKnobValue let-value>
        <span class="center">
          <strong>{{ value }}%</strong>
          <small>of goal</small>
        </span>
      </ng-template>
    </tx-knob>
  `,
  styles: `
    .center {
      display: grid;
      justify-items: center;
      line-height: 1.1;
    }

    strong {
      font-size: 22px;
    }

    small {
      color: var(--tx-text-muted);
      font-size: 11px;
      font-weight: 400;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KnobTemplateExample {
  steps = 72;
}
