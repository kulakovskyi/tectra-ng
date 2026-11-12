import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TxDebounceInput } from './debounce-input.directive';

@Component({
  imports: [TxDebounceInput],
  template: `<div txDebounceInput [debounceTime]="300" [distinct]="distinct()" [minLength]="minLength()" (debounceInput)="events.push($event)" (debounceValue)="values.push($event)">
    <input aria-label="Search" />
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DebounceHost {
  readonly distinct = signal(false);
  readonly minLength = signal(0);
  readonly events: Event[] = [];
  readonly values: string[] = [];
}

function setup() {
  const fixture = TestBed.createComponent(DebounceHost);
  fixture.detectChanges();
  const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
  const type = (value: string) => {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const enter = () => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  return { fixture, host: fixture.componentInstance, type, enter };
}

describe('txDebounceInput', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('emits once after the pause, also for inputs inside the host', () => {
    const { host, type } = setup();
    type('a');
    vi.advanceTimersByTime(200);
    type('ab');
    vi.advanceTimersByTime(299);
    expect(host.values).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(host.values).toEqual(['ab']);
    expect(host.events[0].type).toBe('input');
  });

  it('emits at once on Enter and drops the pending one', () => {
    const { host, type, enter } = setup();
    type('kyiv');
    enter();
    expect(host.values).toEqual(['kyiv']);
    vi.advanceTimersByTime(1000);
    expect(host.values).toEqual(['kyiv']);
    enter();
    expect(host.values).toEqual(['kyiv', 'kyiv']);
  });

  it('skips the same value when distinct, except on Enter', () => {
    const { fixture, host, type, enter } = setup();
    fixture.componentInstance.distinct.set(true);
    fixture.detectChanges();
    type('lviv');
    vi.advanceTimersByTime(300);
    type('lviv');
    vi.advanceTimersByTime(300);
    expect(host.values).toEqual(['lviv']);
    enter();
    expect(host.values).toEqual(['lviv', 'lviv']);
  });

  it('waits for the minimum length but lets a cleared field through', () => {
    const { fixture, host, type } = setup();
    fixture.componentInstance.minLength.set(3);
    fixture.detectChanges();
    type('od');
    vi.advanceTimersByTime(300);
    expect(host.values).toEqual([]);
    type('ode');
    vi.advanceTimersByTime(300);
    type('');
    vi.advanceTimersByTime(300);
    expect(host.values).toEqual(['ode', '']);
  });

  it('cancels the timer when destroyed', () => {
    const { fixture, host, type } = setup();
    type('x');
    fixture.destroy();
    vi.advanceTimersByTime(1000);
    expect(host.values).toEqual([]);
  });
  it('ignores Enter with nothing typed and reads non-field targets as empty', () => {
    const { fixture, host } = setup();
    const directive = fixture.debugElement.query(By.directive(TxDebounceInput)).injector.get(TxDebounceInput);
    directive.flush();
    expect(host.values).toEqual([]);
    (fixture.nativeElement as HTMLElement).querySelector('div')?.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(300);
    expect(host.values).toEqual(['']);
  });
});
