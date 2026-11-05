import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxSlider } from './slider.component';
import { TxSliderOrientation, TxSliderValue } from './slider.types';

@Component({
  imports: [TxSlider, ReactiveFormsModule],
  template: `
    <tx-slider id="single" ariaLabel="Volume" [formControl]="volume" [step]="5" [showSteps]="true" [orientation]="orientation()" [readonly]="readonly()" valueTemplate="{value} %" (slideEnd)="ends.push($event.value)" [dt]="{ root: { trackSize: '6px' } }" />
    <tx-slider id="range" ariaLabel="Price" [formControl]="price" [range]="true" [max]="500" [step]="10" [minStepsBetweenHandles]="2" [marks]="[{ value: 0, label: '$0' }, { value: 500, label: '$500' }]" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly volume = new FormControl<TxSliderValue | null>(40);
  readonly price = new FormControl<TxSliderValue | null>([100, 300]);
  readonly orientation = signal<TxSliderOrientation>('horizontal');
  readonly readonly = signal(false);
  ends: TxSliderValue[] = [];
}

describe('TxSlider', () => {
  let fixture: ComponentFixture<Host>;
  const handles = (id: string) => Array.from(fixture.nativeElement.querySelectorAll(`#${id} [role="slider"]`)) as HTMLElement[];
  const track = (id: string) => fixture.nativeElement.querySelector(`#${id} .tx-slider__track`) as HTMLElement;
  const key = async (element: HTMLElement, name: string) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key: name, cancelable: true }));
    await fixture.whenStable();
  };
  const pointer = async (id: string, type: string, x: number, y = 0, target?: HTMLElement) => {
    (target ?? track(id)).dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, button: 0, bubbles: true, cancelable: true }));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    for (const id of ['single', 'range']) {
      track(id).getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 200, right: 200, bottom: 200, x: 0, y: 0, toJSON: () => ({}) });
    }
  });

  it('renders a slider handle with its values, position and step marks', () => {
    const [handle] = handles('single');
    expect(handle.getAttribute('aria-label')).toBe('Volume');
    expect(handle.getAttribute('aria-valuenow')).toBe('40');
    expect(handle.getAttribute('aria-valuetext')).toBe('40 %');
    expect(handle.style.getPropertyValue('--_at')).toBe('40%');
    expect(fixture.nativeElement.querySelectorAll('#single .tx-slider__mark')).toHaveLength(21);
    expect((fixture.nativeElement.querySelector('#single') as HTMLElement).style.getPropertyValue('--tx-slider-track-size')).toBe('6px');
  });

  it('moves with the keyboard and reports the end of a move', async () => {
    const [handle] = handles('single');
    await key(handle, 'ArrowRight');
    expect(fixture.componentInstance.volume.value).toBe(45);
    await key(handle, 'PageDown');
    expect(fixture.componentInstance.volume.value).toBe(0);
    await key(handle, 'End');
    expect(fixture.componentInstance.volume.value).toBe(100);
    expect(fixture.componentInstance.ends).toEqual([45, 0, 100]);
  });

  it('jumps to a click on the track and follows the drag', async () => {
    await pointer('single', 'pointerdown', 50);
    expect(fixture.componentInstance.volume.value).toBe(25);
    await pointer('single', 'pointermove', 151);
    expect(fixture.componentInstance.volume.value).toBe(75);
    await pointer('single', 'pointerup', 151);
    expect(fixture.componentInstance.ends).toEqual([75]);
  });

  it('measures from the bottom when vertical', async () => {
    fixture.componentInstance.orientation.set('vertical');
    await fixture.whenStable();
    expect(handles('single')[0].getAttribute('aria-orientation')).toBe('vertical');
    await pointer('single', 'pointerdown', 0, 50);
    expect(fixture.componentInstance.volume.value).toBe(75);
  });

  it('keeps a range in order with a minimum gap', async () => {
    const [start, end] = handles('range');
    expect(start.getAttribute('aria-label')).toBe('Price, from');
    expect(end.getAttribute('aria-label')).toBe('Price, to');
    expect(start.getAttribute('aria-valuemax')).toBe('280');
    await key(start, 'End');
    expect(fixture.componentInstance.price.value).toEqual([280, 300]);
    await key(end, 'Home');
    expect(fixture.componentInstance.price.value).toEqual([280, 300]);
    await pointer('range', 'pointerdown', 190);
    expect(fixture.componentInstance.price.value).toEqual([280, 480]);
    expect(fixture.nativeElement.querySelectorAll('#range .tx-slider__label')).toHaveLength(2);
  });

  it('ignores input when readonly and disables from the form', async () => {
    fixture.componentInstance.readonly.set(true);
    await fixture.whenStable();
    await key(handles('single')[0], 'ArrowRight');
    await pointer('single', 'pointerdown', 10);
    expect(fixture.componentInstance.volume.value).toBe(40);
    fixture.componentInstance.volume.disable();
    await fixture.whenStable();
    expect(handles('single')[0].getAttribute('tabindex')).toBe('-1');
  });
});
