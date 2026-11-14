import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxColorSwatches } from './color-swatches.component';
import { TxColorSwatchOption, TxColorSwatchesChangeEvent } from './color-swatches.types';

const COLORS: TxColorSwatchOption[] = [
  { value: 'red', color: '#ef4444', label: 'Red' },
  { value: 'green', color: '#22c55e', label: 'Green' },
  { value: 'gray', color: '#6b7280', label: 'Gray', disabled: true },
  { value: 'blue', color: '#3b82f6', label: 'Blue' },
];

@Component({
  imports: [TxColorSwatches, ReactiveFormsModule],
  template: `
    <tx-color-swatches
      id="main"
      ariaLabel="Color"
      [options]="options"
      [formControl]="color"
      [readonly]="readonly()"
      [columns]="columns()"
      size="small"
      [dt]="{ root: { size: '30px' } }"
      [pt]="{ swatch: { class: 'own-swatch' }, group: { style: { padding: '1px' } } }"
      (changed)="events.push($event)"
    />
    <tx-color-swatches id="free" ariaLabelledBy="free-label" [options]="options" [disabled]="disabled()" [unstyled]="true" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly options = COLORS;
  readonly color = new FormControl<string | null>('green');
  readonly readonly = signal(false);
  readonly disabled = signal(false);
  readonly columns = signal<number | undefined>(undefined);
  readonly events: TxColorSwatchesChangeEvent[] = [];
}

describe('TxColorSwatches', () => {
  let fixture: ComponentFixture<Host>;
  const root = (id = 'main') => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
  const group = (id = 'main') => root(id).querySelector('[role="radiogroup"]') as HTMLElement;
  const swatches = (id = 'main') => Array.from(root(id).querySelectorAll<HTMLButtonElement>('[role="radio"]'));
  const key = async (target: HTMLElement, name: string) => {
    const event = new KeyboardEvent('keydown', { key: name, cancelable: true, bubbles: true });
    target.dispatchEvent(event);
    await fixture.whenStable();
    return event;
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('is a labelled radio group of color dots with one tab stop on the picked one', () => {
    expect(group().getAttribute('aria-label')).toBe('Color');
    expect(group('free').getAttribute('aria-labelledby')).toBe('free-label');
    expect(swatches().map((swatch) => swatch.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false', 'false']);
    expect(swatches().map((swatch) => swatch.tabIndex)).toEqual([-1, 0, -1, -1]);
    expect(swatches()[0].getAttribute('aria-label')).toBe('Red');
    expect(swatches()[0].title).toBe('Red');
    expect(swatches()[0].style.getPropertyValue('--_color')).toBe('#ef4444');
    expect(swatches()[2].disabled).toBe(true);
    expect(swatches()[1].classList).toContain('tx-color-swatches__swatch--selected');
    expect(swatches()[1].classList).toContain('own-swatch');
    expect(group().style.padding).toBe('1px');
    expect(root().getAttribute('data-size')).toBe('small');
    expect(root().getAttribute('data-styled')).toBe('true');
    expect(root('free').hasAttribute('data-styled')).toBe(false);
    expect(root().style.getPropertyValue('--tx-color-swatches-size')).toBe('30px');
    expect(swatches('free').map((swatch) => swatch.tabIndex)).toEqual([0, -1, -1, -1]);
  });

  it('picks a color with a click and tells the form', async () => {
    swatches()[0].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.color.value).toBe('red');
    expect(fixture.componentInstance.events.map((event) => event.value)).toEqual(['red']);
    swatches()[0].click();
    swatches()[2].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.events).toHaveLength(1);
    swatches()[0].dispatchEvent(new FocusEvent('blur'));
    expect(fixture.componentInstance.color.touched).toBe(true);
  });

  it('follows the radio group keyboard and skips disabled dots', async () => {
    expect((await key(swatches()[1], 'ArrowRight')).defaultPrevented).toBe(true);
    expect(fixture.componentInstance.color.value).toBe('blue');
    expect(document.activeElement).toBe(swatches()[3]);
    await key(swatches()[3], 'ArrowDown');
    expect(fixture.componentInstance.color.value).toBe('red');
    await key(swatches()[0], 'ArrowLeft');
    expect(fixture.componentInstance.color.value).toBe('blue');
    await key(swatches()[3], 'ArrowUp');
    expect(fixture.componentInstance.color.value).toBe('green');
    await key(swatches()[1], 'Home');
    expect(fixture.componentInstance.color.value).toBe('red');
    await key(swatches()[0], 'End');
    expect(fixture.componentInstance.color.value).toBe('blue');
    expect((await key(swatches()[3], 'a')).defaultPrevented).toBe(false);
  });

  it('moves focus but keeps the value while readonly', async () => {
    fixture.componentInstance.readonly.set(true);
    await fixture.whenStable();
    expect(root().classList).toContain('tx-color-swatches--readonly');
    expect(group().getAttribute('aria-readonly')).toBe('true');
    await key(swatches()[1], 'ArrowRight');
    expect(document.activeElement).toBe(swatches()[3]);
    expect(fixture.componentInstance.color.value).toBe('green');
  });

  it('is disabled by its input or the form and shows invalid state', async () => {
    fixture.componentInstance.disabled.set(true);
    fixture.componentInstance.color.disable();
    await fixture.whenStable();
    expect(swatches('free').every((swatch) => swatch.disabled)).toBe(true);
    expect(group('free').getAttribute('aria-disabled')).toBe('true');
    expect(root().classList).toContain('tx-color-swatches--disabled');
    fixture.componentInstance.color.enable();
    fixture.componentInstance.color.setErrors({ required: true });
    fixture.componentInstance.color.markAsTouched();
    await fixture.whenStable();
    expect(group().getAttribute('aria-invalid')).toBe('true');
    expect(root().classList).toContain('tx-color-swatches--invalid');
  });

  it('lays the dots out in columns and focuses the picked one', async () => {
    fixture.componentInstance.columns.set(2);
    await fixture.whenStable();
    expect(group().hasAttribute('data-columns')).toBe(true);
    expect(group().style.gridTemplateColumns).toBe('repeat(2, max-content)');
    const instance = fixture.debugElement.children[0].componentInstance as TxColorSwatches;
    instance.focus();
    expect(document.activeElement).toBe(swatches()[1]);
    fixture.componentInstance.color.setValue('gray');
    await fixture.whenStable();
    expect(swatches().map((swatch) => swatch.tabIndex)).toEqual([0, -1, -1, -1]);
  });
});
