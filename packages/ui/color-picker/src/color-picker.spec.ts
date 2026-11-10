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

@Component({
  imports: [TxColorPicker, ReactiveFormsModule],
  template: `
    <tx-color-picker id="field" field placeholder="#rrggbb" [formControl]="control" [presets]="['#22c55e']" showClear />
    <tx-color-picker id="rgb" field format="rgb" inputId="rgb-field" [formControl]="rgb" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FieldHost {
  control = new FormControl<TxColorValue | null>(null);
  rgb = new FormControl<TxColorValue | null>({ r: 255, g: 0, b: 0 });
}

describe('TxColorPicker field', () => {
  let fixture: ComponentFixture<FieldHost>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const field = (id = 'field') => el(`#${id} input`) as HTMLInputElement;
  const dot = (id = 'field') => el(`#${id} .tx-color-picker__dot`) as HTMLButtonElement;
  const type = (value: string, id = 'field') => {
    field(id).value = value;
    field(id).dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const blur = (id = 'field') => {
    field(id).dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldHost);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('is a text field with an empty dot at its start', () => {
    expect(el('#field').classList).toContain('tx-color-picker--field');
    expect(el('#field .tx-color-picker__trigger')).toBeNull();
    expect(field().getAttribute('placeholder')).toBe('#rrggbb');
    expect(field().getAttribute('aria-label')).toBe('Hex colour');
    expect(field().classList).toContain('tx-input');
    expect(dot().classList).toContain('tx-color-picker__dot--empty');
    expect(dot().getAttribute('aria-label')).toBe('Pick a colour');
    expect(dot().getAttribute('aria-expanded')).toBe('false');
    expect(field('rgb').getAttribute('id')).toBe('rgb-field');
    expect(field('rgb').hasAttribute('aria-label')).toBe(false);
    expect(field('rgb').value).toBe('#ff0000');
  });

  it('keeps the typed text, colours the dot and normalizes on blur', () => {
    const control = fixture.componentInstance.control;
    type('3C6');
    expect(control.value).toBe('3C6');
    expect(control.valid).toBe(true);
    expect(dot().style.backgroundColor).toBe('rgb(51, 204, 102)');
    expect(dot().classList).not.toContain('tx-color-picker__dot--empty');
    blur();
    expect(field().value).toBe('#33cc66');
    expect(control.value).toBe('#33cc66');
    expect(control.touched).toBe(true);
  });

  it('flags a value that is not a hex colour and clears a blank one', () => {
    const control = fixture.componentInstance.control;
    type('#12');
    expect(control.value).toBe('#12');
    expect(control.errors).toEqual({ pattern: { requiredPattern: '#rrggbb', actualValue: '#12' } });
    blur();
    expect(field().value).toBe('#12');
    expect(field().getAttribute('aria-invalid')).toBe('true');
    expect(dot().classList).toContain('tx-color-picker__dot--empty');
    type('   ');
    blur();
    expect(control.value).toBeNull();
    expect(field().value).toBe('');
    expect(control.valid).toBe(true);
  });

  it('opens the picker from the dot and writes the picked colour into the field', async () => {
    dot().click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(dot().getAttribute('aria-expanded')).toBe('true');
    (document.querySelector('.tx-color-picker__preset') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('#22c55e');
    expect(field().value).toBe('#22c55e');
    (document.querySelector('.tx-color-picker__clear') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBeNull();
    expect(field().value).toBe('');
  });

  it('writes a value from the form and gives an rgb value in rgb format', () => {
    fixture.componentInstance.control.setValue('#ABCDEF');
    fixture.detectChanges();
    expect(field().value).toBe('#ABCDEF');
    type('#00ff00', 'rgb');
    expect(fixture.componentInstance.rgb.value).toEqual({ r: 0, g: 255, b: 0 });
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(field().disabled).toBe(true);
    expect(dot().disabled).toBe(true);
  });
});
