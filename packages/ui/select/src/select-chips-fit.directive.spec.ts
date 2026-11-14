import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxSelectChipsFit } from './select-chips-fit.directive';

@Component({
  imports: [TxSelectChipsFit],
  template: `
    <span #fit="txSelectChipsFit" class="tx-select__chips" [txSelectChipsFit]="items()" [txSelectChipsFitPaused]="paused()">
      @for (item of items(); track item; let index = $index) {
        <span class="tx-select__chip" [class.tx-select__chip--hidden]="index >= fit.visible()"><span class="tx-select__chip-label">{{ item }}</span></span>
      }
      @if (more()) {
        <span class="tx-select__chip tx-select__chip--more"><span class="tx-select__chip-label">+{{ fit.hidden() }}</span></span>
      }
      @if (input()) {
        <input class="field" aria-label="Search" style="min-width: 40px" />
      }
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly items = signal(['Alpha', 'Beta', 'Gamma']);
  readonly paused = signal(false);
  readonly more = signal(true);
  readonly input = signal(false);
}

describe('TxSelectChipsFit', () => {
  let fixture: ComponentFixture<Host>;
  let available = 150;
  const observers: { callback: () => void; disconnected: boolean }[] = [];
  const hidden = () =>
    (Array.from(fixture.nativeElement.querySelectorAll('.tx-select__chip:not(.tx-select__chip--more)')) as HTMLElement[]).map((chip) =>
      chip.classList.contains('tx-select__chip--hidden'),
    );
  const more = () => (fixture.nativeElement.querySelector('.tx-select__chip--more') as HTMLElement | null)?.textContent?.trim();
  const measure = async () => {
    observers.at(-1)?.callback();
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    available = 150;
    observers.length = 0;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        readonly entry = { callback: () => undefined as void, disconnected: false };
        constructor(callback: () => void) {
          this.entry.callback = callback;
          observers.push(this.entry);
        }
        observe(): void {
          return;
        }
        disconnect(): void {
          this.entry.disconnected = true;
        }
      },
    );
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('tx-select__chip--more') ? 30 : this.classList.contains('tx-select__chip') ? 60 : 0;
    });
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('tx-select__chips') ? available : 0;
    });
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(() => 0);
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('counts the chips that do not fit and keeps at least one', async () => {
    expect(hidden()).toEqual([false, false, true]);
    expect(more()).toBe('+1');
    available = 20;
    await measure();
    expect(hidden()).toEqual([false, true, true]);
    expect(more()).toBe('+2');
    available = 400;
    await measure();
    expect(hidden()).toEqual([false, false, false]);
    expect(more()).toBe('+0');
  });

  it('keeps the min-width of other children free', async () => {
    available = 190;
    await measure();
    expect(hidden()).toEqual([false, false, false]);
    fixture.componentInstance.input.set(true);
    await fixture.whenStable();
    await measure();
    expect(hidden()).toEqual([false, false, true]);
  });

  it('shows every chip while paused and without a +N chip', async () => {
    fixture.componentInstance.paused.set(true);
    await fixture.whenStable();
    expect(hidden()).toEqual([false, false, false]);
    expect(observers[0].disconnected).toBe(true);
    fixture.componentInstance.paused.set(false);
    fixture.componentInstance.more.set(false);
    await fixture.whenStable();
    await measure();
    expect(hidden()).toEqual([false, false, false]);
  });

  it('shows every chip without ResizeObserver', async () => {
    vi.stubGlobal('ResizeObserver', undefined);
    fixture.componentInstance.items.set(['Alpha', 'Beta', 'Gamma', 'Delta']);
    await fixture.whenStable();
    expect(hidden()).toEqual([false, false, false, false]);
  });
});
