import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxOverlayBadge } from './overlay-badge.component';

@Component({
  imports: [TxOverlayBadge],
  template: `
    <tx-overlay-badge id="bell" [value]="count()" [max]="99" ariaLabel="unread" [hidden]="hidden()" [dt]="{ root: { ringWidth: '3px' } }" [pt]="{ badge: { class: 'own' } }">
      <button aria-label="Notifications">Bell</button>
    </tx-overlay-badge>
    <tx-overlay-badge id="dot" severity="success" shape="circle"><span>Avatar</span></tx-overlay-badge>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly count = signal<number>(4);
  readonly hidden = signal(false);
}

describe('TxOverlayBadge', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('shows the value on the corner and describes the content with it', () => {
    const badge = el('#bell tx-badge');
    expect(badge.textContent?.trim()).toBe('4');
    expect(badge.classList).toContain('own');
    expect(badge.getAttribute('aria-label')).toBe('unread');
    expect(el('#bell button').getAttribute('aria-describedby')).toBe(badge.id);
    expect(el('#bell').style.getPropertyValue('--tx-overlay-badge-ring-width')).toBe('3px');
  });

  it('caps big numbers, hides zero and can be hidden', async () => {
    fixture.componentInstance.count.set(250);
    await fixture.whenStable();
    expect(el('#bell tx-badge').textContent?.trim()).toBe('99+');
    fixture.componentInstance.count.set(0);
    await fixture.whenStable();
    expect(el('#bell tx-badge')).toBeNull();
    expect(el('#bell button').hasAttribute('aria-describedby')).toBe(false);
    fixture.componentInstance.count.set(3);
    fixture.componentInstance.hidden.set(true);
    await fixture.whenStable();
    expect(el('#bell tx-badge')).toBeNull();
  });

  it('renders a dot on a circle', () => {
    expect(el('#dot').getAttribute('data-shape')).toBe('circle');
    expect(el('#dot tx-badge').classList).toContain('tx-badge--dot');
    expect(el('#dot tx-badge').getAttribute('data-severity')).toBe('success');
  });
});
