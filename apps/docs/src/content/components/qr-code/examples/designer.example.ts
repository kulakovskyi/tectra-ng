import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TxQrCode,
  TxQrDotStyle,
  TxQrErrorCorrection,
  TxQrEyeBallStyle,
  TxQrEyeFrameStyle,
  TxQrGradient,
} from '@tectra-ng/blocks/qr-code';
import { TxButton } from '@tectra-ng/ui/button';
import { TxColorPicker } from '@tectra-ng/ui/color-picker';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxSlider } from '@tectra-ng/ui/slider';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'qr-code-designer-example',
  imports: [
    FormsModule,
    TxQrCode,
    TxButton,
    TxColorPicker,
    TxField,
    TxInput,
    TxSelect,
    TxSlider,
    TxToggleSwitch,
  ],
  template: `
    <div class="designer">
      <div class="controls">
        <tx-field class="wide" label="Text">
          <input txInput fluid [(ngModel)]="text" />
        </tx-field>
        <tx-field label="Dots">
          <tx-select ariaLabel="Dots" [options]="dotStyles" [(ngModel)]="dotStyle" />
        </tx-field>
        <tx-field label="Eye frames">
          <tx-select ariaLabel="Eye frames" [options]="eyeStyles" [(ngModel)]="eyeFrameStyle" />
        </tx-field>
        <tx-field label="Eye centres">
          <tx-select ariaLabel="Eye centres" [options]="eyeStyles" [(ngModel)]="eyeBallStyle" />
        </tx-field>
        <tx-field label="Error correction">
          <tx-select ariaLabel="Error correction" [options]="levels" [(ngModel)]="level" />
        </tx-field>
        <tx-field label="Dots colour">
          <tx-color-picker ariaLabel="Dots colour" [(ngModel)]="color" />
        </tx-field>
        <tx-field label="Eyes colour">
          <tx-color-picker ariaLabel="Eyes colour" [(ngModel)]="eyeColor" />
        </tx-field>
        <tx-field label="Gradient to">
          <tx-color-picker ariaLabel="Gradient to" [(ngModel)]="gradientTo" />
        </tx-field>
        <tx-field label="Background">
          <tx-color-picker ariaLabel="Background" [(ngModel)]="background" />
        </tx-field>
        <tx-field class="wide" [label]="'Quiet zone: ' + margin() + ' modules'">
          <tx-slider ariaLabel="Quiet zone" [min]="0" [max]="6" [step]="1" [(ngModel)]="margin" />
        </tx-field>
        <div class="wide switches">
          <tx-toggle-switch label="Gradient" [(ngModel)]="useGradient" />
          <tx-toggle-switch label="Logo" [(ngModel)]="useLogo" />
        </div>
      </div>
      <div class="preview">
        <tx-qr-code
          [data]="text()"
          [size]="240"
          [margin]="margin()"
          [dotStyle]="dotStyle()"
          [eyeFrameStyle]="eyeFrameStyle()"
          [eyeBallStyle]="eyeBallStyle()"
          [errorCorrection]="level()"
          [color]="color()"
          [eyeColor]="eyeColor()"
          [background]="background()"
          [gradient]="gradient()"
          [logo]="useLogo() ? '/favicon.svg' : undefined"
        />
        <div class="downloads">
          <button txButton icon="download" (click)="qr().download('png')">PNG</button>
          <button
            txButton
            severity="secondary"
            outlined
            icon="download"
            (click)="qr().download('svg')"
          >
            SVG
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .designer {
      display: flex;
      flex-wrap: wrap;
      gap: 28px;
      width: 100%;
    }

    .controls {
      display: grid;
      flex: 1 1 320px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px 14px;
    }

    .wide {
      grid-column: 1 / -1;
    }

    .switches {
      display: flex;
      gap: 20px;
    }

    .preview {
      display: flex;
      flex: 0 0 auto;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      margin: 0 auto;
    }

    .downloads {
      display: flex;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class QrCodeDesignerExample {
  readonly qr = viewChild.required(TxQrCode);
  readonly text = signal('https://example.com/r/7Q2M');
  readonly dotStyle = signal<TxQrDotStyle>('rounded');
  readonly eyeFrameStyle = signal<TxQrEyeFrameStyle>('rounded');
  readonly eyeBallStyle = signal<TxQrEyeBallStyle>('circle');
  readonly level = signal<TxQrErrorCorrection>('Q');
  readonly color = signal('#111827');
  readonly eyeColor = signal('#2563eb');
  readonly gradientTo = signal('#7c3aed');
  readonly background = signal('#ffffff');
  readonly margin = signal(2);
  readonly useGradient = signal(true);
  readonly useLogo = signal(true);
  readonly gradient = computed<TxQrGradient | undefined>(() =>
    this.useGradient()
      ? { type: 'linear', colors: [this.color(), this.gradientTo()], rotation: 45 }
      : undefined,
  );

  readonly dotStyles = [
    { label: 'Square', value: 'square' },
    { label: 'Dots', value: 'dots' },
    { label: 'Rounded', value: 'rounded' },
    { label: 'Soft', value: 'soft' },
  ];
  readonly eyeStyles = [
    { label: 'Square', value: 'square' },
    { label: 'Rounded', value: 'rounded' },
    { label: 'Circle', value: 'circle' },
  ];
  readonly levels = [
    { label: 'L — 7%', value: 'L' },
    { label: 'M — 15%', value: 'M' },
    { label: 'Q — 25%', value: 'Q' },
    { label: 'H — 30%', value: 'H' },
  ];
}
