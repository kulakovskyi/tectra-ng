import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxPinnedTabs } from './pinned-tabs.component';

const KEY = 'tx-spec-pinned';

@Component({
  imports: [TxPinnedTabs],
  template: `<tx-pinned-tabs [stateKey]="key" [options]="options" allLabel="All teams" [(selected)]="selected" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly key = KEY;
  readonly options = [
    { value: 'design', label: 'Design' },
    { value: 'sales', label: 'Sales' },
    { value: 'support', label: 'Support' },
  ];
  readonly selected = signal<readonly string[]>([]);
}

describe('TxPinnedTabs', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove()));

  it('shows only the labelled customize button while nothing is pinned', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-pinned-tabs') as HTMLElement;
    expect(root.classList).toContain('tx-pinned-tabs--empty');
    expect(root.querySelector('tx-tabs')).toBeNull();
    expect(root.querySelector('button')?.textContent?.trim()).toBe('Customize');
  });

  it('shows the all tab and the pinned values in the option order and picks them', async () => {
    localStorage.setItem(KEY, JSON.stringify(['support', 'design', 'gone']));
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-pinned-tabs') as HTMLElement;
    const tabs = () => Array.from(root.querySelectorAll<HTMLElement>('[role="tab"]'));
    expect(tabs().map((tab) => tab.textContent?.trim())).toEqual(['All teams', 'Design', 'Support']);
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
    expect(root.querySelector('.tx-pinned-tabs__button')?.getAttribute('aria-label')).toBe('Customize');

    tabs()[2].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.selected()).toEqual(['support']);
    expect(tabs()[2].getAttribute('aria-selected')).toBe('true');

    fixture.componentInstance.selected.set(['design', 'support']);
    await fixture.whenStable();
    expect(tabs().some((tab) => tab.getAttribute('aria-selected') === 'true')).toBe(false);

    tabs()[0].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.selected()).toEqual([]);
  });

  it('pins values in the dialog and saves them', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-pinned-tabs') as HTMLElement;
    (root.querySelector('button') as HTMLButtonElement).click();
    await fixture.whenStable();
    const options = Array.from(document.querySelectorAll<HTMLButtonElement>('.tx-pinned-tabs-dialog__option'));
    expect(options.map((option) => option.getAttribute('aria-checked'))).toEqual(['false', 'false', 'false']);
    options[1].click();
    options[0].click();
    await fixture.whenStable();
    expect(document.querySelector('.tx-pinned-tabs-dialog__counter')?.textContent?.trim()).toBe('Selected: 2 of 3');
    const save = Array.from(document.querySelectorAll<HTMLButtonElement>('tx-dialog-footer button')).find((button) => button.textContent?.trim() === 'Save');
    save?.click();
    await fixture.whenStable();
    expect(JSON.parse(localStorage.getItem(KEY) ?? '[]')).toEqual(['design', 'sales']);
    expect(Array.from(root.querySelectorAll('[role="tab"]')).map((tab) => tab.textContent?.trim())).toEqual(['All teams', 'Design', 'Sales']);
  });
});
