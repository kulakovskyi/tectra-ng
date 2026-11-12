import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxStopPropagation } from './stop-propagation.directive';

@Component({
  imports: [TxStopPropagation],
  template: `
    <div class="row" role="group" tabindex="-1" (click)="opened = opened + 1" (keydown)="keys = keys + 1">
      <button type="button" class="menu" txStopPropagation>Menu</button>
      <a class="link" href="/x" txStopPropagation="click keydown" preventDefault>Link</a>
      <span class="chip" [txStopPropagation]="['keydown']">Chip</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StopHost {
  opened = 0;
  keys = 0;
}

describe('txStopPropagation', () => {
  it('stops clicks by default and the listed events', async () => {
    const fixture = TestBed.createComponent(StopHost);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    root.querySelector<HTMLElement>('.menu')?.click();
    expect(fixture.componentInstance.opened).toBe(0);
    const link = root.querySelector('.link') as HTMLElement;
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(click);
    link.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    expect(click.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.opened).toBe(0);
    expect(fixture.componentInstance.keys).toBe(0);
    root.querySelector<HTMLElement>('.row')?.click();
    expect(fixture.componentInstance.opened).toBe(1);
  });
  it('takes the events as a list', async () => {
    const fixture = TestBed.createComponent(StopHost);
    await fixture.whenStable();
    const chip = (fixture.nativeElement as HTMLElement).querySelector('.chip') as HTMLElement;
    chip.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    chip.click();
    expect(fixture.componentInstance.keys).toBe(0);
    expect(fixture.componentInstance.opened).toBe(1);
  });
});
