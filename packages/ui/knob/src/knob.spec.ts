import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxKnobValueTemplate } from './knob-templates.directive';
import { TxKnob } from './knob.component';
import { TxKnobArc } from './knob.types';

@Component({
  imports: [TxKnob, TxKnobValueTemplate, ReactiveFormsModule],
  template: `
    <tx-knob id="volume" ariaLabel="Volume" [formControl]="volume" [step]="5" [limit]="limit()" [arc]="arc()" [readonly]="readonly()" valueTemplate="{value}%" [size]="120" [dt]="{ root: { valueColor: 'teal' } }" />
    <tx-knob id="custom" ariaLabel="Custom" [formControl]="custom">
      <ng-template txKnobValue let-value><b class="own">{{ value }} pts</b></ng-template>
    </tx-knob>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly volume = new FormControl<number | null>(40);
  readonly custom = new FormControl<number | null>(7);
  readonly limit = signal<number | undefined>(undefined);
  readonly arc = signal<TxKnobArc>('dial');
  readonly readonly = signal(false);
}

describe('TxKnob', () => {
  let fixture: ComponentFixture<Host>;
  const control = (id = 'volume') => fixture.nativeElement.querySelector(`#${id} [role="slider"]`) as HTMLElement;
  const key = async (name: string) => {
    control().dispatchEvent(new KeyboardEvent('keydown', { key: name, cancelable: true }));
    await fixture.whenStable();
  };
  const pointer = async (type: string, x: number, y: number) => {
    control().dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, button: 0, bubbles: true, cancelable: true }));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const svg = fixture.nativeElement.querySelector('#volume svg') as SVGSVGElement;
    svg.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({}) });
  });

  it('is a slider with its value text, size and tokens', () => {
    expect(control().getAttribute('aria-valuenow')).toBe('40');
    expect(control().getAttribute('aria-valuetext')).toBe('40%');
    expect(fixture.nativeElement.querySelector('#volume .tx-knob__text').textContent.trim()).toBe('40%');
    const host = fixture.nativeElement.querySelector('#volume') as HTMLElement;
    expect(host.style.width).toBe('120px');
    expect(host.style.getPropertyValue('--tx-knob-value-color')).toBe('teal');
    expect(fixture.nativeElement.querySelector('#custom .own').textContent).toBe('7 pts');
  });

  it('steps with the keyboard within min and max', async () => {
    await key('ArrowUp');
    expect(fixture.componentInstance.volume.value).toBe(45);
    await key('PageDown');
    expect(fixture.componentInstance.volume.value).toBe(0);
    await key('End');
    expect(fixture.componentInstance.volume.value).toBe(100);
  });

  it('follows the pointer around the dial', async () => {
    await pointer('pointerdown', 50, 0);
    expect(fixture.componentInstance.volume.value).toBe(50);
    await pointer('pointermove', 100, 50);
    expect(fixture.componentInstance.volume.value).toBe(85);
    await pointer('pointermove', 50, 100);
    expect(fixture.componentInstance.volume.value).toBe(100);
    await pointer('pointerup', 50, 100);
    expect(fixture.componentInstance.volume.touched).toBe(true);
  });

  it('does not wrap past the top of a ring while dragging', async () => {
    fixture.componentInstance.arc.set('ring');
    fixture.componentInstance.volume.setValue(95);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#volume .tx-knob__handle')).not.toBeNull();
    await pointer('pointerdown', 40, 5);
    expect(fixture.componentInstance.volume.value).toBe(95);
    await pointer('pointermove', 55, 2);
    expect(fixture.componentInstance.volume.value).toBe(100);
  });

  it('stops at the limit and marks the rest of the ring', async () => {
    fixture.componentInstance.limit.set(60);
    await fixture.whenStable();
    expect(control().getAttribute('aria-valuemax')).toBe('60');
    expect(fixture.nativeElement.querySelector('#volume .tx-knob__limit')).not.toBeNull();
    await key('End');
    expect(fixture.componentInstance.volume.value).toBe(60);
  });

  it('ignores input when readonly and disables from the form', async () => {
    fixture.componentInstance.readonly.set(true);
    await fixture.whenStable();
    await key('ArrowUp');
    expect(fixture.componentInstance.volume.value).toBe(40);
    fixture.componentInstance.volume.disable();
    await fixture.whenStable();
    expect(control().getAttribute('tabindex')).toBe('-1');
  });
});
