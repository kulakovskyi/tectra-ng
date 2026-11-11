import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxInView } from './in-view.directive';
import { TxVisibleOnScroll, TxVisibleOnScrollItem } from './visible-on-scroll.directive';

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

class FakeObserver {
  static instances: FakeObserver[] = [];
  readonly targets = new Set<Element>();
  disconnected = false;

  constructor(
    readonly callback: Callback,
    readonly options: IntersectionObserverInit,
  ) {
    FakeObserver.instances.push(this);
  }

  observe(target: Element): void {
    this.targets.add(target);
  }

  unobserve(target: Element): void {
    this.targets.delete(target);
  }

  disconnect(): void {
    this.disconnected = true;
    this.targets.clear();
  }

  fire(target: Element, ratio: number): void {
    this.callback([{ target, isIntersecting: ratio > 0, intersectionRatio: ratio }]);
  }
}

@Component({
  imports: [TxInView],
  template: `<section txInView #view="txInView" [once]="once()" enterClass="fade-in" leaveClass="fade-out" (entered)="log.push('in')" (left)="log.push('out')">{{ view.isInView() }}</section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class InViewHost {
  readonly once = signal(true);
  readonly log: string[] = [];
}

@Component({
  imports: [TxVisibleOnScroll],
  template: `<ul [txVisibleOnScroll]="items()" (itemVisible)="seen.push($event)">
    @for (item of items(); track item.id) {
      <li>{{ item.id }}</li>
    }
  </ul>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ListHost {
  readonly items = signal<TxVisibleOnScrollItem[]>([{ id: 'a' }, { id: 'b', ignore: true }, { id: 'c' }]);
  readonly seen: string[] = [];
}

describe('in view', () => {
  beforeEach(() => {
    FakeObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeObserver);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('marks the element once it scrolls into view and stops watching', async () => {
    const fixture = TestBed.createComponent(InViewHost);
    await fixture.whenStable();
    const section = fixture.nativeElement.querySelector('section') as HTMLElement;
    const observer = FakeObserver.instances[0];
    expect(observer.options.threshold).toBe(0.3);
    expect(section.classList.contains('tx-in-view')).toBe(false);
    observer.fire(section, 0.5);
    await fixture.whenStable();
    expect(section.classList.contains('tx-in-view')).toBe(true);
    expect(section.classList.contains('fade-in')).toBe(true);
    expect(section.textContent).toBe('true');
    expect(observer.disconnected).toBe(true);
    expect(fixture.componentInstance.log).toEqual(['in']);
  });

  it('follows the element in and out when once is off', async () => {
    const fixture = TestBed.createComponent(InViewHost);
    fixture.componentInstance.once.set(false);
    await fixture.whenStable();
    const section = fixture.nativeElement.querySelector('section') as HTMLElement;
    const observer = FakeObserver.instances[0];
    observer.fire(section, 1);
    observer.fire(section, 0);
    await fixture.whenStable();
    expect(section.classList.contains('fade-out')).toBe(true);
    expect(section.classList.contains('fade-in')).toBe(false);
    expect(fixture.componentInstance.log).toEqual(['in', 'out']);
  });

  it('shows the element when the browser has no IntersectionObserver', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const fixture = TestBed.createComponent(InViewHost);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('section').classList.contains('tx-in-view')).toBe(true);
  });

  it('reports each fully visible list item once and skips ignored ones', async () => {
    const fixture = TestBed.createComponent(ListHost);
    await fixture.whenStable();
    const items = fixture.nativeElement.querySelectorAll('li');
    let observer = FakeObserver.instances.at(-1) as FakeObserver;
    expect(observer.targets.size).toBe(2);
    observer.fire(items[0], 0.5);
    observer.fire(items[0], 1);
    observer.fire(items[0], 1);
    expect(fixture.componentInstance.seen).toEqual(['a']);

    fixture.componentInstance.items.set([{ id: 'b' }, { id: 'c' }]);
    await fixture.whenStable();
    observer = FakeObserver.instances.at(-1) as FakeObserver;
    const next = fixture.nativeElement.querySelectorAll('li');
    observer.fire(next[0], 1);
    expect(fixture.componentInstance.seen).toEqual(['a', 'b']);
  });
});
