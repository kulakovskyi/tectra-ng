import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxSpeedDial } from './speed-dial.component';
import { TxSpeedDialDirection, TxSpeedDialType } from './speed-dial.types';

@Component({
  imports: [TxSpeedDial],
  template: `
    <tx-speed-dial ariaLabel="Create" [model]="items" [type]="type()" [direction]="direction()" [radius]="100" mask [(visible)]="open" (itemSelected)="picked.push($event.item.id ?? '')" />
    <button id="outside">Outside</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly open = signal(false);
  readonly type = signal<TxSpeedDialType>('linear');
  readonly direction = signal<TxSpeedDialDirection>('up');
  readonly picked: string[] = [];
  readonly items: TxMenuItem[] = [
    { id: 'note', label: 'Note', icon: 'pencil' },
    { id: 'task', label: 'Task', icon: 'check' },
    { id: 'event', label: 'Event', icon: 'calendar' },
    { id: 'hidden', label: 'Hidden', icon: 'eye', visible: false },
  ];
}

describe('TxSpeedDial', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const items = () => [...fixture.nativeElement.querySelectorAll('.tx-speed-dial__item')] as HTMLElement[];
  const key = (target: Element, name: string) => target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
  const settle = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await settle();
  });

  afterEach(() => fixture.destroy());

  it('opens a menu of round buttons along its direction', async () => {
    const button = el('.tx-speed-dial__button');
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(el('.tx-speed-dial__list').getAttribute('role')).toBe('menu');
    expect(items().length).toBe(3);
    expect(items()[0].getAttribute('aria-label')).toBe('Note');
    expect(items()[0].getAttribute('tabindex')).toBe('-1');
    button.click();
    await settle();
    expect(fixture.componentInstance.open()).toBe(true);
    expect(el('tx-speed-dial').classList).toContain('tx-speed-dial--open');
    expect(el('.tx-speed-dial__mask')).not.toBeNull();
    const ys = items().map((item) => parseFloat(item.style.getPropertyValue('--_y')));
    expect(ys[0]).toBeLessThan(0);
    expect(ys[1]).toBeLessThan(ys[0]);
    expect(items().map((item) => item.style.getPropertyValue('--_x'))).toEqual(['0px', '0px', '0px']);
  });

  it('lays items on a semi circle', async () => {
    fixture.componentInstance.type.set('semi-circle');
    fixture.componentInstance.open.set(true);
    await settle();
    const points = items().map((item) => [parseFloat(item.style.getPropertyValue('--_x')), parseFloat(item.style.getPropertyValue('--_y'))]);
    expect(points).toEqual([
      [-100, 0],
      [0, -100],
      [100, 0],
    ]);
  });

  it('moves with arrows, runs an item and closes with Escape and outside clicks', async () => {
    const button = el('.tx-speed-dial__button');
    key(button, 'ArrowUp');
    await settle();
    expect(document.activeElement).toBe(items()[0]);
    key(items()[0], 'ArrowUp');
    expect(document.activeElement).toBe(items()[1]);
    key(items()[1], 'ArrowDown');
    expect(document.activeElement).toBe(items()[0]);
    key(items()[0], 'Escape');
    await settle();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(document.activeElement).toBe(button);

    button.click();
    await settle();
    items()[2].click();
    await settle();
    expect(fixture.componentInstance.picked).toEqual(['event']);
    expect(fixture.componentInstance.open()).toBe(false);

    button.click();
    await settle();
    items()[0].dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await settle();
    expect(fixture.componentInstance.open()).toBe(true);
    el('#outside').dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await settle();
    expect(fixture.componentInstance.open()).toBe(false);
  });
});

@Component({
  imports: [TxSpeedDial],
  template: `
    <tx-speed-dial
      [model]="items"
      [type]="type()"
      [direction]="direction()"
      [disabled]="disabled()"
      [hideOnClickOutside]="false"
      hideIcon="times"
      [style.--tx-speed-dial-gap]="'10px'"
      [(visible)]="open"
      (opened)="events.push('opened')"
      (closed)="events.push('closed')"
      (itemSelected)="picked.push($event.item.id ?? '')"
    />
    <button id="away">Away</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DialHost {
  readonly open = signal(false);
  readonly type = signal<TxSpeedDialType>('linear');
  readonly direction = signal<TxSpeedDialDirection>('up');
  readonly disabled = signal(false);
  readonly events: string[] = [];
  readonly picked: string[] = [];
  readonly items: TxMenuItem[] = [
    { id: 'copy', label: 'Copy', icon: 'copy', command: () => this.picked.push('command') },
    { id: 'off', label: 'Off', icon: 'lock', disabled: true },
    { separator: true },
    { id: 'drop', label: 'Drop', icon: 'trash', severity: 'danger' },
  ];
}

describe('TxSpeedDial layouts and keys', () => {
  let fixture: ComponentFixture<DialHost>;
  let dial: TxSpeedDial;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const items = () => [...fixture.nativeElement.querySelectorAll('.tx-speed-dial__item')] as HTMLElement[];
  const enabled = () => items().filter((item) => !item.hasAttribute('disabled'));
  const key = (target: Element, name: string) => {
    const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
  };
  const point = (item: HTMLElement) => [parseFloat(item.style.getPropertyValue('--_x')), parseFloat(item.style.getPropertyValue('--_y'))];
  const layout = async (type: TxSpeedDialType, direction: TxSpeedDialDirection) => {
    fixture.componentInstance.type.set(type);
    fixture.componentInstance.direction.set(direction);
    await fixture.whenStable();
    return items().map(point);
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(DialHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    dial = fixture.debugElement.children[0].componentInstance as TxSpeedDial;
  });

  afterEach(() => fixture.destroy());

  it('lays items in a full circle, quarter circles and fallback arcs', async () => {
    expect(items()).toHaveLength(3);
    expect(await layout('circle', 'up')).toEqual([
      [0, -80],
      [69, 40],
      [-69, 40],
    ]);
    expect(await layout('quarter-circle', 'down-right')).toEqual([
      [80, 0],
      [57, 57],
      [0, 80],
    ]);
    expect(await layout('quarter-circle', 'up')).toEqual([
      [-80, 0],
      [-57, -57],
      [0, -80],
    ]);
    expect(await layout('semi-circle', 'up-left')).toEqual(await layout('semi-circle', 'up'));
    expect(dial.tooltipPlacement()).toBe('top');
  });

  it('lays items in a line along every direction and places tooltips beside it', async () => {
    expect(dial.tooltipPlacement()).toBe('left');
    const [right] = await layout('linear', 'right');
    expect(right[0]).toBeGreaterThan(0);
    expect(right[1]).toBe(0);
    expect(dial.tooltipPlacement()).toBe('top');
    const [downLeft] = await layout('linear', 'down-left');
    expect(downLeft[0]).toBeLessThan(0);
    expect(downLeft[1]).toBeGreaterThan(0);
  });

  it('measures the buttons and the gap token before opening', async () => {
    const button = el('.tx-speed-dial__button');
    Object.defineProperty(button, 'offsetWidth', { value: 40, configurable: true });
    dial.show();
    await fixture.whenStable();
    expect(point(items()[0])).toEqual([0, -50]);
    expect(dial.currentIcon()).toBe('times');
    Object.defineProperty(items()[0], 'offsetWidth', { value: 20, configurable: true });
    dial.show();
    await fixture.whenStable();
    expect(point(items()[0])).toEqual([0, -40]);
    expect(fixture.componentInstance.events).toEqual(['opened']);
  });

  it('stays closed while disabled and ignores repeated show and hide', async () => {
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    dial.show();
    expect(fixture.componentInstance.open()).toBe(false);
    fixture.componentInstance.disabled.set(false);
    await fixture.whenStable();
    dial.hide();
    dial.show();
    dial.show();
    await fixture.whenStable();
    expect(fixture.componentInstance.events).toEqual(['opened']);
    expect(document.activeElement).not.toBe(items()[0]);
    el('#away').dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.open()).toBe(true);
    dial.toggle();
    await fixture.whenStable();
    expect(fixture.componentInstance.events).toEqual(['opened', 'closed']);
  });

  it('runs commands, skips disabled items and keeps open on the button keys it does not own', async () => {
    dial.show();
    await fixture.whenStable();
    const [copy] = items();
    dial.run(fixture.componentInstance.items[1], new Event('click'));
    expect(fixture.componentInstance.open()).toBe(true);
    expect(fixture.componentInstance.picked).toEqual([]);
    copy.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.picked).toEqual(['command', 'copy']);
    expect(document.activeElement).toBe(el('.tx-speed-dial__button'));
    const button = el('.tx-speed-dial__button');
    expect(key(button, 'Escape').defaultPrevented).toBe(false);
    dial.show();
    await fixture.whenStable();
    expect(key(button, 'ArrowUp').defaultPrevented).toBe(false);
    expect(key(button, 'Enter').defaultPrevented).toBe(false);
    expect(key(button, 'Escape').defaultPrevented).toBe(true);
    await fixture.whenStable();
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('moves with Home, End and the arrows of each direction and closes on Tab', async () => {
    fixture.componentInstance.direction.set('down');
    dial.show(true);
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
    const [first, last] = enabled();
    expect(document.activeElement).toBe(first);
    key(first, 'ArrowDown');
    expect(document.activeElement).toBe(last);
    key(last, 'Home');
    expect(document.activeElement).toBe(first);
    key(first, 'End');
    expect(document.activeElement).toBe(last);
    fixture.componentInstance.direction.set('left');
    await fixture.whenStable();
    key(last, 'ArrowLeft');
    expect(document.activeElement).toBe(first);
    key(first, 'ArrowRight');
    expect(document.activeElement).toBe(last);
    fixture.componentInstance.direction.set('right');
    await fixture.whenStable();
    key(last, 'ArrowRight');
    expect(document.activeElement).toBe(first);
    fixture.componentInstance.type.set('circle');
    await fixture.whenStable();
    key(first, 'ArrowDown');
    expect(document.activeElement).toBe(last);
    key(last, 'ArrowUp');
    expect(document.activeElement).toBe(first);
    expect(key(first, 'x').defaultPrevented).toBe(false);
    expect(key(first, 'Tab').defaultPrevented).toBe(false);
    await fixture.whenStable();
    expect(fixture.componentInstance.open()).toBe(false);
  });
});
