import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
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

@Component({
  imports: [TxPinnedTabs],
  template: `
    <tx-pinned-tabs
      [stateKey]="key()"
      [options]="options"
      dialogTitle="Pinned teams"
      dialogText="Pick the teams you use most"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainHost {
  readonly key = signal(KEY);
  readonly options = [
    { value: 'design', label: 'Design' },
    { value: 'sales', label: 'Sales' },
  ];
}

describe('TxPinnedTabs dialog and storage edges', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    vi.restoreAllMocks();
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
  });

  async function setup() {
    const fixture = TestBed.createComponent(PlainHost);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-pinned-tabs') as HTMLElement;
    const tabs = fixture.debugElement.query(By.directive(TxPinnedTabs)).componentInstance as TxPinnedTabs;
    return { fixture, root, tabs };
  }

  const footerButton = (label: string) =>
    Array.from(document.querySelectorAll<HTMLButtonElement>('tx-dialog-footer button')).find((button) => button.textContent?.trim() === label) as HTMLButtonElement;

  it('shows the own dialog texts, unpins a value and keeps the pins when cancelled', async () => {
    localStorage.setItem(KEY, JSON.stringify(['design', 'sales']));
    const { fixture, root, tabs } = await setup();
    expect(Array.from(root.querySelectorAll('[role="tab"]')).map((tab) => tab.textContent?.trim())).toEqual(['All', 'Design', 'Sales']);

    tabs.openSettings();
    await fixture.whenStable();
    expect(document.querySelector('tx-dialog-header')?.textContent).toContain('Pinned teams');
    expect(document.querySelector('.tx-pinned-tabs-dialog')?.textContent).toContain('Pick the teams you use most');
    expect(document.querySelector('.tx-pinned-tabs-dialog__options')?.getAttribute('aria-label')).toBe('Pinned teams');
    const options = Array.from(document.querySelectorAll<HTMLButtonElement>('.tx-pinned-tabs-dialog__option'));
    options[0].click();
    await fixture.whenStable();
    expect(options.map((option) => option.getAttribute('aria-checked'))).toEqual(['false', 'true']);
    footerButton('Cancel').click();
    await fixture.whenStable();
    expect(tabs.pinned()).toEqual(['design', 'sales']);
    expect(JSON.parse(localStorage.getItem(KEY) ?? '[]')).toEqual(['design', 'sales']);

    tabs.openSettings();
    await fixture.whenStable();
    document.querySelectorAll<HTMLButtonElement>('.tx-pinned-tabs-dialog__option')[0].click();
    footerButton('Save').click();
    await fixture.whenStable();
    expect(tabs.pinned()).toEqual(['sales']);
    expect(JSON.parse(localStorage.getItem(KEY) ?? '[]')).toEqual(['sales']);
  });

  it('reads broken or foreign stored values as nothing pinned', async () => {
    localStorage.setItem(KEY, '{oops');
    localStorage.setItem('tx-spec-object', JSON.stringify({ design: true }));
    const { fixture, tabs } = await setup();
    expect(tabs.pinned()).toEqual([]);
    fixture.componentInstance.key.set('tx-spec-object');
    await fixture.whenStable();
    expect(tabs.pinned()).toEqual([]);
    expect(tabs.tabs()).toEqual([]);
  });

  it('still pins values when the storage cannot be used', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const quota = await setup();
    quota.tabs.openSettings();
    await quota.fixture.whenStable();
    document.querySelectorAll<HTMLButtonElement>('.tx-pinned-tabs-dialog__option')[1].click();
    footerButton('Save').click();
    await quota.fixture.whenStable();
    expect(quota.tabs.pinned()).toEqual(['sales']);
    expect(localStorage.getItem(KEY)).toBeNull();

    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('denied');
    });
    const denied = await setup();
    expect(denied.tabs.pinned()).toEqual([]);
  });

  it('starts with nothing pinned when the window has no storage', async () => {
    vi.spyOn(window, 'localStorage', 'get').mockReturnValue(null as unknown as Storage);
    const { tabs } = await setup();
    expect(tabs.pinned()).toEqual([]);
  });
});

@Component({
  imports: [TxPinnedTabs],
  template: `<tx-pinned-tabs [stateKey]="key" [options]="options" [defaultPinned]="['sales']" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DefaultHost {
  readonly key = KEY;
  readonly options = [
    { value: 'design', label: 'Design' },
    { value: 'sales', label: 'Sales' },
  ];
}

describe('TxPinnedTabs default pins and pins from code', () => {
  beforeEach(() => localStorage.clear());

  async function setup() {
    const fixture = TestBed.createComponent(DefaultHost);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-pinned-tabs') as HTMLElement;
    const tabs = fixture.debugElement.query(By.directive(TxPinnedTabs)).componentInstance as TxPinnedTabs;
    const labels = () => Array.from(root.querySelectorAll('[role="tab"]')).map((tab) => tab.textContent?.trim());
    return { fixture, tabs, labels };
  }

  it('shows the default pins until a choice is saved', async () => {
    const { tabs, labels } = await setup();
    expect(tabs.pinned()).toEqual(['sales']);
    expect(labels()).toEqual(['All', 'Sales']);
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('prefers the saved choice, also an empty one', async () => {
    localStorage.setItem(KEY, JSON.stringify([]));
    const { tabs } = await setup();
    expect(tabs.pinned()).toEqual([]);
  });

  it('pins and unpins from code and saves the choice', async () => {
    const { fixture, tabs, labels } = await setup();
    tabs.pin('design');
    tabs.pin('design');
    await fixture.whenStable();
    expect(labels()).toEqual(['All', 'Design', 'Sales']);
    expect(JSON.parse(localStorage.getItem(KEY) ?? '[]')).toEqual(['sales', 'design']);
    tabs.unpin('sales');
    tabs.unpin('sales');
    await fixture.whenStable();
    expect(labels()).toEqual(['All', 'Design']);
    expect(JSON.parse(localStorage.getItem(KEY) ?? '[]')).toEqual(['design']);
  });
});
