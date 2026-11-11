import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxChartMenu, TxChartMenuItem } from './chart-menu.component';

@Component({
  imports: [TxChartMenu],
  template: `<tx-chart-menu [items]="items" ariaLabel="Chart menu" (selected)="picked.push($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly items: TxChartMenuItem[] = [
    { id: 'a', label: 'First', icon: 'image' },
    { id: 'b', label: 'Off', disabled: true },
    { id: 'c', label: 'Last' },
  ];
  readonly picked: string[] = [];
}

describe('TxChartMenu', () => {
  it('lists the items as menu items, emits the picked id and walks them with the arrows', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const list = fixture.nativeElement.querySelector('[role="menu"]') as HTMLElement;
    expect(list.getAttribute('aria-label')).toBe('Chart menu');
    const items = [...list.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')];
    expect(items.map((item) => item.textContent?.trim())).toEqual(['First', 'Off', 'Last']);
    expect(items[1].disabled).toBe(true);
    items[0].click();
    expect(fixture.componentInstance.picked).toEqual(['a']);
    items[0].focus();
    items[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(items[2]);
    items[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).toBe(items[0]);
  });
});
