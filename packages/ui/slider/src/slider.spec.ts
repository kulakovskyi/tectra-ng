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

@Component({
  imports: [TxSlider, ReactiveFormsModule],
  template: `
    <tx-slider id="pair" [formControl]="pair" [range]="true" [showSteps]="true" [step]="25" [marks]="[{ value: 50, label: 'Half' }, { value: 75 }]" ariaLabelledBy="pair-label" />
    <tx-slider id="fine" [formControl]="fine" [step]="0.5" [max]="2" [showSteps]="many()" />
    <tx-slider id="flat" [min]="10" [max]="10" />
    <tx-slider id="dense" [max]="1000" showSteps />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class EdgeHost {
  readonly pair = new FormControl<TxSliderValue | null>(null);
  readonly fine = new FormControl<TxSliderValue | null>(null);
  readonly many = signal(false);
}

describe('TxSlider edge cases', () => {
  let fixture: ComponentFixture<EdgeHost>;
  const handles = (id: string) => Array.from(fixture.nativeElement.querySelectorAll(`#${id} [role="slider"]`)) as HTMLElement[];
  const track = (id: string) => fixture.nativeElement.querySelector(`#${id} .tx-slider__track`) as HTMLElement;
  const pointer = async (id: string, type: string, x: number, target?: HTMLElement) => {
    (target ?? track(id)).dispatchEvent(new MouseEvent(type, { clientX: x, button: 0, bubbles: true, cancelable: true }));
    await fixture.whenStable();
  };
  const sized = (id: string, width: number) =>
    (track(id).getBoundingClientRect = () => ({ left: 0, top: 0, width, height: width, right: width, bottom: width, x: 0, y: 0, toJSON: () => ({}) }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(EdgeHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('spans the whole track for an empty range and merges step marks with labelled marks', () => {
    const [start, end] = handles('pair');
    expect(start.getAttribute('aria-valuenow')).toBe('0');
    expect(end.getAttribute('aria-valuenow')).toBe('100');
    expect(start.hasAttribute('aria-label')).toBe(false);
    expect(start.getAttribute('aria-labelledby')).toBe('pair-label');
    expect(fixture.nativeElement.querySelectorAll('#pair .tx-slider__mark')).toHaveLength(5);
    expect(fixture.nativeElement.querySelectorAll('#pair .tx-slider__label')).toHaveLength(1);
  });

  it('starts an empty single slider at the minimum, snaps to fractional steps and hides too many step marks', async () => {
    const [handle] = handles('fine');
    expect(handle.getAttribute('aria-valuenow')).toBe('0');
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.fine.value).toBe(0.5);
    fixture.componentInstance.many.set(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('#fine .tx-slider__mark')).toHaveLength(5);
    expect(fixture.nativeElement.querySelectorAll('#dense .tx-slider__mark')).toHaveLength(0);
  });

  it('places a slider without a span at the start', () => {
    expect(handles('flat')[0].style.getPropertyValue('--_at')).toBe('0%');
  });

  it('grabs a handle without moving it and ignores moves and releases without a grab', async () => {
    sized('pair', 200);
    await pointer('pair', 'pointermove', 100);
    await pointer('pair', 'pointerup', 100);
    expect(fixture.componentInstance.pair.value).toBeNull();
    expect(fixture.componentInstance.pair.touched).toBe(false);
    await pointer('pair', 'pointerdown', 150, handles('pair')[1]);
    expect(document.activeElement).toBe(handles('pair')[1]);
    expect(fixture.componentInstance.pair.value).toBeNull();
    await pointer('pair', 'pointermove', 100);
    expect(fixture.componentInstance.pair.value).toEqual([0, 50]);
  });

  it('moves the nearer handle, and picks by side when both sit together', async () => {
    sized('pair', 200);
    await pointer('pair', 'pointerdown', 40);
    await pointer('pair', 'pointerup', 40);
    expect(fixture.componentInstance.pair.value).toEqual([25, 100]);
    fixture.componentInstance.pair.setValue([50, 50]);
    await fixture.whenStable();
    await pointer('pair', 'pointerdown', 20);
    await pointer('pair', 'pointerup', 20);
    expect(fixture.componentInstance.pair.value).toEqual([0, 50]);
    fixture.componentInstance.pair.setValue([50, 50]);
    await fixture.whenStable();
    await pointer('pair', 'pointerdown', 180);
    expect(fixture.componentInstance.pair.value).toEqual([50, 100]);
  });

  it('falls back to the minimum on a track without a size and ignores other keys', async () => {
    fixture.componentInstance.fine.setValue(1);
    await fixture.whenStable();
    sized('fine', 0);
    await pointer('fine', 'pointerdown', 80);
    expect(fixture.componentInstance.fine.value).toBe(0);
    const [handle] = handles('fine');
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', cancelable: true }));
    handle.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(fixture.componentInstance.fine.value).toBe(0);
    expect(fixture.componentInstance.fine.touched).toBe(true);
  });
});

describe('TxSlider recompiled by TestBed', () => {
  it('still reads its track when a test overrides the component', async () => {
    TestBed.overrideComponent(TxSlider, { set: { styles: [] } });
    const fixture = TestBed.createComponent(EdgeHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const handle = fixture.nativeElement.querySelector('#fine [role="slider"]') as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', cancelable: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.fine.value).toBe(2);
  });
});
