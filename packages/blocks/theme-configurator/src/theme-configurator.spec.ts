import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxThemeService, provideTectra } from '@tectra-ng/core/config';
import { TectraPresetSource, TectraStyle, Tectra, edgeStyle, paperStyle, softStyle, tectraStyle } from '@tectra-ng/themes';
import { TxThemeConfigurator } from './theme-configurator.component';

@Component({
  imports: [TxThemeConfigurator],
  template: `
    <tx-theme-configurator
      [styles]="styles()"
      [showRipple]="showRipple()"
      [columns]="5"
      [dt]="{ root: { gap: '20px' } }"
      [pt]="{ label: { class: 'own-label' } }"
      (themeChange)="themes.push($event)"
      (rippleChange)="ripples.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly styles = signal<TectraStyle[]>([tectraStyle, softStyle, edgeStyle, paperStyle]);
  readonly showRipple = signal(true);
  readonly themes: TectraPresetSource[] = [];
  readonly ripples: boolean[] = [];
}

describe('TxThemeConfigurator', () => {
  let fixture: ComponentFixture<Host>;
  let theme: TxThemeService;
  const root = () => fixture.nativeElement.querySelector('tx-theme-configurator') as HTMLElement;
  const groups = () => Array.from(root().querySelectorAll<HTMLElement>('[role="radiogroup"]'));
  const radios = (group: number) => Array.from(groups()[group].querySelectorAll<HTMLButtonElement>('[role="radio"]'));
  const key = async (target: HTMLElement, name: string) => {
    const event = new KeyboardEvent('keydown', { key: name, cancelable: true, bubbles: true });
    target.dispatchEvent(event);
    await fixture.whenStable();
    return event;
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: Tectra })] });
    theme = TestBed.inject(TxThemeService);
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  });

  afterEach(() => {
    document.querySelectorAll('#tectra-theme, style[id^="tectra-tokens-"]').forEach((style) => style.remove());
    document.documentElement.removeAttribute('data-tx-theme');
  });

  it('shows labelled primary, surface and style groups and the ripple switch', () => {
    const labels = Array.from(root().querySelectorAll('.tx-theme-configurator__label')).map((label) => label.textContent?.trim());
    expect(labels).toEqual(['Primary', 'Surface', 'Style', 'Ripple']);
    expect(groups()).toHaveLength(3);
    expect(groups().every((group) => document.getElementById(group.getAttribute('aria-labelledby') ?? '')?.classList.contains('own-label'))).toBe(true);
    expect(radios(0).find((radio) => radio.getAttribute('aria-checked') === 'true')?.getAttribute('aria-label')).toBe('Blue');
    expect(radios(1).find((radio) => radio.getAttribute('aria-checked') === 'true')?.getAttribute('aria-label')).toBe('Ink');
    expect(radios(2).map((radio) => radio.textContent?.trim())).toEqual(['Tectra', 'Soft', 'Edge', 'Paper']);
    expect(radios(2).map((radio) => radio.tabIndex)).toEqual([0, -1, -1, -1]);
    expect(root().style.getPropertyValue('--tx-theme-configurator-gap')).toBe('20px');
    expect(root().querySelector('tx-toggle-switch')).not.toBeNull();
  });

  it('rebuilds the theme from a picked primary, surface and style', async () => {
    radios(0).find((radio) => radio.getAttribute('aria-label') === 'Teal')?.click();
    await fixture.whenStable();
    expect(theme.primary()).toBe('teal');
    radios(1).find((radio) => radio.getAttribute('aria-label') === 'Zinc')?.click();
    await fixture.whenStable();
    radios(2)[1].click();
    await fixture.whenStable();
    expect(theme.preset()?.name).toBe('soft-teal-zinc');
    expect(fixture.componentInstance.themes.at(-1)).toEqual({ style: softStyle, primary: 'teal', surface: 'zinc' });
    expect(radios(2)[1].getAttribute('aria-checked')).toBe('true');
    radios(2)[1].click();
    expect(fixture.componentInstance.themes).toHaveLength(3);
  });

  it('moves through the styles with the arrow keys, Home and End', async () => {
    expect((await key(radios(2)[0], 'ArrowRight')).defaultPrevented).toBe(true);
    expect(theme.style()).toBe(softStyle);
    expect(document.activeElement).toBe(radios(2)[1]);
    await key(radios(2)[1], 'End');
    expect(theme.style()).toBe(paperStyle);
    await key(radios(2)[3], 'ArrowDown');
    expect(theme.style()).toBe(tectraStyle);
    await key(radios(2)[0], 'ArrowLeft');
    expect(theme.style()).toBe(paperStyle);
    await key(radios(2)[3], 'Home');
    expect(theme.style()).toBe(tectraStyle);
    expect((await key(radios(2)[0], 'Enter')).defaultPrevented).toBe(false);
  });

  it('turns the ripple on and off', async () => {
    const input = root().querySelector('tx-toggle-switch input') as HTMLInputElement;
    input.click();
    await fixture.whenStable();
    expect(theme.ripple()).toBe(true);
    expect(fixture.componentInstance.ripples).toEqual([true]);
  });

  it('hides the rows it has nothing for', async () => {
    theme.updateTheme({ style: edgeStyle });
    fixture.componentInstance.styles.set([softStyle, paperStyle]);
    await fixture.whenStable();
    expect(radios(2).map((radio) => radio.tabIndex)).toEqual([0, -1]);
    fixture.componentInstance.styles.set([softStyle]);
    fixture.componentInstance.showRipple.set(false);
    await fixture.whenStable();
    expect(groups()).toHaveLength(2);
    expect(root().querySelector('tx-toggle-switch')).toBeNull();
  });
});
