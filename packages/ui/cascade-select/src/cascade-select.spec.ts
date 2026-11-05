import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxCascadeSelect } from './cascade-select.component';
import { TxCascadeSelectChangeEvent } from './cascade-select.types';

const PLACES = [
  {
    name: 'Ukraine',
    regions: [
      { name: 'Kyiv region', cities: [{ cname: 'Kyiv', code: 'KBP' }, { cname: 'Bila Tserkva', code: 'BTS' }] },
      { name: 'Lviv region', cities: [{ cname: 'Lviv', code: 'LWO' }, { cname: 'Drohobych', code: 'DRH', off: true }, { cname: 'Stryi', code: 'STR' }] },
    ],
  },
  { name: 'Poland', regions: [{ name: 'Masovia', cities: [{ cname: 'Warsaw', code: 'WAW' }] }] },
];

@Component({
  imports: [TxCascadeSelect, ReactiveFormsModule],
  template: `<tx-cascade-select
    [options]="places"
    [formControl]="control"
    [optionLabel]="'cname'"
    [optionValue]="'code'"
    [optionDisabled]="'off'"
    [optionGroupLabel]="'name'"
    [optionGroupChildren]="['regions', 'cities']"
    [showPath]="showPath()"
    [showClear]="true"
    [placeholder]="'City'"
    (changed)="changes.push($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly places = PLACES;
  control = new FormControl<string | null>(null);
  readonly showPath = signal(false);
  changes: TxCascadeSelectChangeEvent[] = [];
}

describe('TxCascadeSelect', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const trigger = () => fixture.nativeElement.querySelector('.tx-select__trigger') as HTMLButtonElement;
  const columns = () => Array.from(document.querySelectorAll('.tx-cascade-select__column')) as HTMLElement[];
  const items = (column: number) => Array.from(columns()[column]?.querySelectorAll('[role="treeitem"]') ?? []) as HTMLElement[];
  const active = () => document.querySelector('.tx-cascade-select__option--active')?.textContent?.trim();
  const render = () => fixture.detectChanges();
  const key = (name: string) => {
    trigger().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    render();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    render();
  });

  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('walks the levels with the arrows and picks a leaf', () => {
    key('ArrowDown');
    expect(columns()).toHaveLength(2);
    expect(active()).toBe('Ukraine');
    key('ArrowRight');
    expect(active()).toBe('Kyiv region');
    expect(items(0)[0].getAttribute('aria-expanded')).toBe('true');
    key('ArrowDown');
    key('Enter');
    expect(active()).toBe('Lviv');
    expect(items(2)[0].getAttribute('aria-level')).toBe('3');
    key('ArrowDown');
    expect(active()).toBe('Stryi');
    key('ArrowLeft');
    expect(active()).toBe('Lviv region');
    key('ArrowRight');
    key('End');
    key('Enter');
    expect(host.control.value).toBe('STR');
    expect(trigger().textContent?.trim()).toBe('Stryi');
    expect(host.changes[0].path.map((option) => (option as { name?: string; cname?: string }).name ?? (option as { cname: string }).cname)).toEqual(['Ukraine', 'Lviv region', 'Stryi']);
  });

  it('opens at the selected value, shows the path and clears', () => {
    host.control.setValue('WAW');
    host.showPath.set(true);
    render();
    expect(trigger().textContent?.trim()).toBe('Poland / Masovia / Warsaw');
    trigger().click();
    render();
    expect(columns()).toHaveLength(3);
    expect(items(2)[0].getAttribute('aria-selected')).toBe('true');
    (fixture.nativeElement.querySelector('.tx-select__clear') as HTMLButtonElement).click();
    render();
    expect(host.control.value).toBeNull();
  });

  it('opens groups on hover and picks with a click', () => {
    trigger().click();
    render();
    items(0)[1].dispatchEvent(new MouseEvent('mouseenter'));
    render();
    items(1)[0].dispatchEvent(new MouseEvent('mouseenter'));
    render();
    items(2)[0].click();
    render();
    expect(host.control.value).toBe('WAW');
  });
});
