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
    el('#outside').dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await settle();
    expect(fixture.componentInstance.open()).toBe(false);
  });
});
