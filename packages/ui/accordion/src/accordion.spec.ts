import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxAccordionContent } from './accordion-content.component';
import { TxAccordionHeader } from './accordion-header.component';
import { TxAccordionPanel } from './accordion-panel.component';
import { TxAccordion } from './accordion.component';
import { TxAccordionContentTemplate, TxAccordionHeaderTemplate, TxAccordionToggleIconTemplate } from './accordion.templates';
import { TxAccordionItem, TxAccordionToggleEvent, TxAccordionValue } from './accordion.types';
import { TX_ICONS, provideTxIcons } from '@tectra-ng/icons';

@Component({
  imports: [TxAccordion, TxAccordionPanel, TxAccordionHeader, TxAccordionContent, TxAccordionContentTemplate],
  template: `
    <tx-accordion
      id="parts"
      [multiple]="multiple()"
      [selectOnFocus]="selectOnFocus()"
      [(value)]="open"
      (opened)="events.push('open ' + $event.value + ' ' + $event.index)"
      (closed)="events.push('close ' + $event.value + ' ' + $event.index)"
      [dt]="{ header: { padding: '20px' } }"
      [pt]="{ header: { class: 'my-header' } }"
      [unstyled]="unstyled()"
    >
      <tx-accordion-panel value="a" tone="warn">
        <tx-accordion-header [headingLevel]="3">A</tx-accordion-header>
        <tx-accordion-content><p class="eager">Eager A</p></tx-accordion-content>
      </tx-accordion-panel>
      <tx-accordion-panel value="b" [disabled]="true">
        <tx-accordion-header>B</tx-accordion-header>
        <tx-accordion-content>B</tx-accordion-content>
      </tx-accordion-panel>
      <tx-accordion-panel value="c">
        <tx-accordion-header>C</tx-accordion-header>
        <tx-accordion-content><ng-template txAccordionContent><p class="lazy">Lazy C</p></ng-template></tx-accordion-content>
      </tx-accordion-panel>
    </tx-accordion>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PartsHost {
  readonly open = signal<TxAccordionValue>(['a']);
  readonly multiple = signal(true);
  readonly selectOnFocus = signal(false);
  readonly unstyled = signal(false);
  readonly events: string[] = [];
}

@Component({
  imports: [TxAccordion, TxAccordionHeaderTemplate, TxAccordionContentTemplate, TxAccordionToggleIconTemplate],
  template: `
    <tx-accordion id="items" [items]="items" [(value)]="open" (opened)="last = $event" expandIcon="plus" collapseIcon="minus">
      <ng-template txAccordionHeader let-item let-index="index" let-active="active">
        <span class="head">{{ index }} {{ item.header }} {{ active ? 'open' : 'closed' }}</span>
      </ng-template>
      <ng-template txAccordionContent let-item><span class="body">{{ item['extra'] }}</span></ng-template>
    </tx-accordion>
    <tx-accordion id="plain" [items]="items" [(value)]="plainOpen">
      <ng-template txAccordionToggleIcon let-active><span class="own-icon">{{ active ? '-' : '+' }}</span></ng-template>
    </tx-accordion>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ItemsHost {
  readonly items: TxAccordionItem[] = [
    { header: 'First', content: 'One', extra: 'Extra one', tone: 'info' },
    { header: 'Second', content: 'Two', extra: 'Extra two', value: 'second' },
  ];
  readonly open = signal<TxAccordionValue>([]);
  readonly plainOpen = signal<TxAccordionValue>([0]);
  last: TxAccordionToggleEvent | null = null;
}

function keydown(target: HTMLElement, key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

beforeEach(() => TestBed.configureTestingModule({ providers: [provideTxIcons(TX_ICONS)] }));

describe('TxAccordion from parts', () => {
  let fixture: ComponentFixture<PartsHost>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement | null;
  const buttons = () => Array.from(fixture.nativeElement.querySelectorAll('.tx-accordion-header__button')) as HTMLButtonElement[];
  const panels = () => Array.from(fixture.nativeElement.querySelectorAll('tx-accordion-panel')) as HTMLElement[];

  beforeEach(async () => {
    fixture = TestBed.createComponent(PartsHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('wires headers and regions and shows the open state', () => {
    const [a, b] = buttons();
    const region = el('#parts tx-accordion-content') as HTMLElement;
    expect(a.getAttribute('aria-expanded')).toBe('true');
    expect(a.getAttribute('aria-controls')).toBe(region.id);
    expect(region.getAttribute('role')).toBe('region');
    expect(region.getAttribute('aria-labelledby')).toBe(a.id);
    expect(b.disabled).toBe(true);
    expect(panels()[0].classList).toContain('tx-accordion-panel--active');
    expect(panels()[0].getAttribute('data-tone')).toBe('warn');
    expect(el('tx-accordion-header')?.getAttribute('role')).toBe('heading');
    expect(el('tx-accordion-header')?.getAttribute('aria-level')).toBe('3');
    expect(a.classList).toContain('my-header');
    expect(el('#parts')?.style.getPropertyValue('--tx-accordion-header-padding')).toBe('20px');
    expect(panels()[2].querySelector('tx-accordion-content')?.hasAttribute('inert')).toBe(true);
  });

  it('opens several panels and reports each toggle', async () => {
    const [a, , c] = buttons();
    c.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.open()).toEqual(['a', 'c']);
    a.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.open()).toEqual(['c']);
    expect(fixture.componentInstance.events).toEqual(['open c 2', 'close a 0']);
  });

  it('keeps one panel open when multiple is off', async () => {
    fixture.componentInstance.multiple.set(false);
    fixture.componentInstance.open.set('a');
    await fixture.whenStable();
    buttons()[2].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.open()).toBe('c');
    expect(fixture.componentInstance.events).toEqual(['close a 0', 'open c 2']);
    buttons()[2].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.open()).toBeNull();
  });

  it('creates template content on the first open and keeps it', async () => {
    expect(el('.lazy')).toBeNull();
    buttons()[2].click();
    await fixture.whenStable();
    expect(el('.lazy')).not.toBeNull();
    buttons()[2].click();
    await fixture.whenStable();
    expect(el('.lazy')).not.toBeNull();
  });

  it('moves between enabled headers with the arrows', () => {
    const [a, , c] = buttons();
    a.focus();
    keydown(a, 'ArrowDown');
    expect(document.activeElement).toBe(c);
    keydown(c, 'ArrowDown');
    expect(document.activeElement).toBe(a);
    keydown(a, 'End');
    expect(document.activeElement).toBe(c);
    keydown(c, 'Home');
    expect(document.activeElement).toBe(a);
    keydown(a, 'ArrowUp');
    expect(document.activeElement).toBe(c);
    expect(fixture.componentInstance.open()).toEqual(['a']);
  });

  it('opens the focused header when selectOnFocus is on', async () => {
    fixture.componentInstance.selectOnFocus.set(true);
    await fixture.whenStable();
    const [a] = buttons();
    a.focus();
    keydown(a, 'ArrowDown');
    await fixture.whenStable();
    expect(fixture.componentInstance.open()).toEqual(['a', 'c']);
  });

  it('drops the styles when unstyled', async () => {
    fixture.componentInstance.unstyled.set(true);
    await fixture.whenStable();
    expect(el('#parts')?.hasAttribute('data-styled')).toBe(false);
  });
});

describe('TxAccordion with items', () => {
  let fixture: ComponentFixture<ItemsHost>;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];

  beforeEach(async () => {
    fixture = TestBed.createComponent(ItemsHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('renders the item templates, values and tones', async () => {
    expect(all('#items .head').map((head) => head.textContent)).toEqual(['0 First closed', '1 Second closed']);
    expect(all('#items tx-accordion-panel')[0].getAttribute('data-tone')).toBe('info');
    expect(all('#items .body')).toHaveLength(0);
    const second = all('#items .tx-accordion-header__button')[1];
    second.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.open()).toEqual(['second']);
    expect(fixture.componentInstance.last?.index).toBe(1);
    expect(fixture.componentInstance.last?.item?.header).toBe('Second');
    expect(all('#items .head')[1].textContent).toBe('1 Second open');
    expect(all('#items .body')[0].textContent).toBe('Extra two');
  });

  it('uses the expand and collapse icons', async () => {
    const icons = all('#items .tx-accordion-header__toggle tx-icon');
    expect(icons.map((icon) => icon.getAttribute('data-icon'))).toEqual(['plus', 'plus']);
    all('#items .tx-accordion-header__button')[0].click();
    await fixture.whenStable();
    expect(all('#items .tx-accordion-header__toggle tx-icon')[0].getAttribute('data-icon')).toBe('minus');
  });

  it('falls back to the item text and uses the toggle icon template', () => {
    expect(all('#plain .tx-accordion-header__content').map((head) => head.textContent?.trim())).toEqual(['First', 'Second']);
    expect(all('#plain .tx-accordion-content__inner')[0].textContent?.trim()).toBe('One');
    expect(all('#plain .own-icon').map((icon) => icon.textContent)).toEqual(['-', '+']);
  });
});

@Component({
  imports: [TxAccordion, TxAccordionPanel, TxAccordionHeader, TxAccordionContent],
  template: `
    <tx-accordion id="single" [items]="items" [multiple]="false" [(value)]="open" (closed)="closed.push($event)" expandIcon="own-expand" />
    <tx-accordion id="collapse-only" [multiple]="false" collapseIcon="minus" [(value)]="other" (closed)="closed.push($event)">
      <tx-accordion-panel value="x">
        <tx-accordion-header>X</tx-accordion-header>
        <tx-accordion-content>X</tx-accordion-content>
      </tx-accordion-panel>
      <tx-accordion-panel value="y" disabled>
        <tx-accordion-header>Y</tx-accordion-header>
        <tx-accordion-content>Y</tx-accordion-content>
      </tx-accordion-panel>
    </tx-accordion>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SingleHost {
  readonly items: TxAccordionItem[] = [
    { header: 'First', content: 'One' },
    { header: 'Second', content: 'Two' },
  ];
  readonly open = signal<TxAccordionValue>(0);
  readonly other = signal<TxAccordionValue>('gone');
  readonly closed: TxAccordionToggleEvent[] = [];
}

describe('TxAccordion with one open panel', () => {
  let fixture: ComponentFixture<SingleHost>;
  const buttons = (id: string) => Array.from(fixture.nativeElement.querySelectorAll(`#${id} .tx-accordion-header__button`)) as HTMLButtonElement[];
  const panel = (id: string, index: number) =>
    fixture.debugElement.queryAll((node) => node.componentInstance instanceof TxAccordionPanel && !!node.nativeElement.closest(`#${id}`))[index].componentInstance as TxAccordionPanel;

  beforeEach(async () => {
    fixture = TestBed.createComponent(SingleHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('reports the item of the panel it closes and draws an unknown icon as a class', async () => {
    expect(fixture.nativeElement.querySelector('#single .tx-accordion-header__toggle span.own-expand')).not.toBeNull();
    buttons('single')[1].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.open()).toBe(1);
    expect(fixture.componentInstance.closed.map((event) => [event.value, event.index, event.item?.header])).toEqual([[0, 0, 'First']]);
    expect(fixture.nativeElement.querySelector('#single .tx-accordion-panel--active .tx-accordion-header__toggle span.own-expand')).not.toBeNull();
  });

  it('closes a value without a panel and uses the collapse icon for both states', async () => {
    const toggle = () => fixture.nativeElement.querySelector('#collapse-only .tx-accordion-header__toggle tx-icon') as HTMLElement;
    expect(toggle().getAttribute('data-icon')).toBe('minus');
    buttons('collapse-only')[0].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.closed.map((event) => [event.value, event.index, event.item])).toEqual([['gone', -1, undefined]]);
    expect(toggle().getAttribute('data-icon')).toBe('minus');
  });

  it('does not open a disabled panel or reopen an open one', async () => {
    panel('collapse-only', 1).toggle();
    panel('collapse-only', 1).open();
    expect(fixture.componentInstance.other()).toBe('gone');
    panel('collapse-only', 0).open();
    fixture.componentInstance.closed.length = 0;
    panel('collapse-only', 0).open();
    expect(fixture.componentInstance.other()).toBe('x');
    expect(fixture.componentInstance.closed).toEqual([]);
  });

  it('leaves other keys to the browser', () => {
    const [first] = buttons('single');
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    first.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('narrows the template contexts', () => {
    const context = { $implicit: { header: 'A' }, index: 0, active: true };
    expect(TxAccordionHeaderTemplate.ngTemplateContextGuard({} as TxAccordionHeaderTemplate, context)).toBe(true);
    expect(TxAccordionContentTemplate.ngTemplateContextGuard({} as TxAccordionContentTemplate, context)).toBe(true);
    expect(TxAccordionToggleIconTemplate.ngTemplateContextGuard({} as TxAccordionToggleIconTemplate, { $implicit: true, active: true })).toBe(true);
  });
});

describe('TxAccordion recompiled by TestBed', () => {
  it('still finds its templates when a test overrides the components', async () => {
    TestBed.overrideComponent(TxAccordion, { set: { styles: [] } });
    TestBed.overrideComponent(TxAccordionContent, { set: { styles: [] } });
    const parts = TestBed.createComponent(PartsHost);
    parts.autoDetectChanges();
    await parts.whenStable();
    (parts.nativeElement.querySelectorAll('.tx-accordion-header__button')[2] as HTMLButtonElement).click();
    await parts.whenStable();
    expect(parts.nativeElement.querySelector('.lazy')).not.toBeNull();
    const items = TestBed.createComponent(ItemsHost);
    items.autoDetectChanges();
    await items.whenStable();
    expect(items.nativeElement.querySelectorAll('#items .head')).toHaveLength(2);
    expect(items.nativeElement.querySelectorAll('#plain .own-icon')).toHaveLength(2);
  });
});
