import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCheckbox } from '@tectra-ng/ui/checkbox';
import { TxPasswordGenerate } from '@tectra-ng/ui/password-generator';
import { TxSlider } from '@tectra-ng/ui/slider';

@Component({
  selector: 'password-generator-options-example',
  imports: [FormsModule, TxButton, TxCheckbox, TxSlider, TxPasswordGenerate],
  template: `
    <div class="panel">
      <div class="length">
        <span>Length {{ length }}</span>
        <tx-slider ariaLabel="Length" [min]="8" [max]="48" [(ngModel)]="length" />
      </div>
      <div class="sets">
        <tx-checkbox label="a–z" [(ngModel)]="lowercase" />
        <tx-checkbox label="A–Z" [(ngModel)]="uppercase" />
        <tx-checkbox label="0–9" [(ngModel)]="digits" />
        <tx-checkbox label="!@#" [(ngModel)]="symbols" />
        <tx-checkbox label="No look-alikes" [(ngModel)]="excludeSimilar" />
      </div>
      <button
        txButton
        icon="refresh"
        [txPasswordGenerate]="null"
        [length]="length"
        [lowercase]="lowercase"
        [uppercase]="uppercase"
        [digits]="digits"
        [symbols]="symbols"
        [excludeSimilar]="excludeSimilar"
        [disabled]="!lowercase && !uppercase && !digits && !symbols"
        (generated)="result.set($event)"
      >
        Generate
      </button>
      <code class="result">{{ result() || '—' }}</code>
    </div>
  `,
  styles: `
    .panel {
      display: grid;
      justify-items: start;
      gap: 14px;
      max-width: 420px;
    }

    .length {
      display: grid;
      gap: 4px;
      width: 100%;
    }

    .sets {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .result {
      max-width: 100%;
      overflow-wrap: anywhere;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PasswordGeneratorOptionsExample {
  length = 20;
  lowercase = true;
  uppercase = true;
  digits = true;
  symbols = false;
  excludeSimilar = true;
  readonly result = signal('');
}
