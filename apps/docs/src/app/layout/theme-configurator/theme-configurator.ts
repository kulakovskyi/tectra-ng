import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';
import { PRIMARY_OPTIONS, STYLE_OPTIONS, SURFACE_OPTIONS } from '../../data/theme-options.data';
import { DocsThemeSettings } from '../theme-settings';

let nextId = 0;

const STEPS: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

@Component({
  selector: 'docs-theme-configurator',
  imports: [FormsModule, TxToggleSwitch],
  templateUrl: './theme-configurator.html',
  styleUrl: './theme-configurator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsThemeConfigurator {
  readonly settings = inject(DocsThemeSettings);

  readonly id = `docs-theme-${nextId++}`;
  readonly primaries = PRIMARY_OPTIONS;
  readonly surfaces = SURFACE_OPTIONS;
  readonly styles = STYLE_OPTIONS;

  moveFocus(event: KeyboardEvent): void {
    const radio = event.currentTarget as HTMLButtonElement;
    const radios = Array.from(radio.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? []);
    const current = radios.indexOf(radio);
    const next =
      event.key === 'Home' ? 0 : event.key === 'End' ? radios.length - 1 : event.key in STEPS ? (current + STEPS[event.key] + radios.length) % radios.length : -1;
    if (next < 0) {
      return;
    }
    event.preventDefault();
    radios[next].focus();
    radios[next].click();
  }
}
