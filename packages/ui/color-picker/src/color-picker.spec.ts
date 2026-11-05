import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { hsbToRgb, parseHex, rgbToHex, rgbToHsb, toHsb } from './color';
import { TxColorPicker } from './color-picker.component';
import { TxColorFormat, TxColorValue } from './color-picker.types';

@Component({
  imports: [TxColorPicker, ReactiveFormsModule],
  template: `<tx-color-picker
    [formControl]="control"
    [inline]="inline()"
    [format]="format()"
    [presets]="['#ef4444', '#22c55e']"
    [showClear]="true"
    [dt]="{ panel: { width: '300px' } }"
    (changed)="changes.push($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  control = new FormControl<TxColorValue | null>('#3366cc');
  readonly inline = signal(false);
  readonly format = signal<TxColorFormat>('hex');
  changes: (TxColorValue | null)[] = [];
}

describe('color helpers', () => {
  it('converts between hex, rgb and hsb', () => {
    expect(parseHex('#abc')).toEqual({ r: 170, g: 187, b: 204 });
    expect(parseHex('nope')).toBeNull();
    expect(rgbToHex({ r: 255, g: 0, b: 128 })).toBe('#ff0080');
    expect(rgbToHsb({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, b: 100 });
    expect(hsbToRgb({ h: 120, s: 100, b: 100 })).toEqual({ r: 0, g: 255, b: 0 });
    expect(toHsb({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 100, b: 100 });
    expect(toHsb({ h: 10, s: 20, b: 30 })).toEqual({ h: 10, s: 20, b: 30 });
  });
});

describe('TxColorPicker', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const trigger = () => fixture.nativeElement.querySelector('.tx-color-picker__trigger') as HTMLButtonElement;
  const area = () => document.querySelector('.tx-color-picker__area') as HTMLElement;
  const hue = () => document.querySelector('.tx-color-picker__hue') as HTMLElement;
  const render = () => fixture.detectChanges();
  const key = (target: HTMLElement, name: string, init: KeyboardEventInit = {}) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, ...init }));
    render();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    render();
  });

  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('shows the colour on the trigger and opens a dialog', () => {
    expect(trigger().textContent?.trim()).toBe('#3366cc');
    expect(trigger().getAttribute('aria-label')).toBe('Pick a colour, #3366cc');
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
    trigger().click();
    render();
    const panel = document.querySelector('.tx-color-picker__panel') as HTMLElement;
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.style.getPropertyValue('--tx-color-picker-panel-width')).toBe('300px');
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    key(panel, 'Escape');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('changes saturation, brightness and hue from the keyboard', () => {
    trigger().click();
    render();
    expect(area().getAttribute('aria-valuetext')).toBe('Saturation 75%, brightness 80%');
    key(area(), 'ArrowRight', { shiftKey: true });
    key(area(), 'ArrowUp');
    expect(area().getAttribute('aria-valuetext')).toBe('Saturation 85%, brightness 81%');
    key(hue(), 'Home');
    expect(hue().getAttribute('aria-valuenow')).toBe('0');
    expect(host.control.value).toBe(rgbToHex(hsbToRgb({ h: 0, s: 85, b: 81 })));
  });

  it('takes a typed hex and presets, and clears', () => {
    host.inline.set(true);
    render();
    const input = fixture.nativeElement.querySelector('.tx-color-picker__input') as HTMLInputElement;
    input.value = '#0f0';
    input.dispatchEvent(new Event('input'));
    render();
    expect(host.control.value).toBe('#00ff00');
    const presets = Array.from(fixture.nativeElement.querySelectorAll('.tx-color-picker__preset')) as HTMLButtonElement[];
    presets[0].click();
    render();
    expect(host.control.value).toBe('#ef4444');
    expect(presets[0].getAttribute('aria-pressed')).toBe('true');
    (fixture.nativeElement.querySelector('.tx-color-picker__clear') as HTMLButtonElement).click();
    render();
    expect(host.control.value).toBeNull();
    expect(host.changes.at(-1)).toBeNull();
  });

  it('writes rgb and hsb objects', () => {
    host.inline.set(true);
    host.format.set('rgb');
    render();
    const hueSlider = fixture.nativeElement.querySelector('.tx-color-picker__hue') as HTMLElement;
    key(hueSlider, 'End');
    expect(host.control.value).toEqual(hsbToRgb({ h: 360, s: 75, b: 80 }));
    host.format.set('hsb');
    render();
    key(hueSlider, 'ArrowLeft');
    expect(host.control.value).toEqual({ h: 359, s: 75, b: 80 });
  });

  it('does not open when disabled', () => {
    host.control.disable();
    render();
    expect(trigger().disabled).toBe(true);
  });
});
