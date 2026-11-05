import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxBadge } from './badge.component';
import { TxBadgeSeverity } from './badge.types';

@Component({
  imports: [TxBadge],
  template: `<tx-badge [value]="value()" [severity]="severity()" [dt]="{ primary: { background: 'teal' } }" [unstyled]="unstyled()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  value = signal<string | number | undefined>(3);
  severity = signal<TxBadgeSeverity>('danger');
  unstyled = signal(false);
}

describe('TxBadge', () => {
  function render() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return { fixture, badge: fixture.nativeElement.querySelector('tx-badge') as HTMLElement };
  }

  it('shows the value with its severity and design tokens', () => {
    const { badge } = render();
    expect(badge.textContent?.trim()).toBe('3');
    expect(badge.getAttribute('data-severity')).toBe('danger');
    expect(badge.style.getPropertyValue('--tx-badge-primary-background')).toBe('teal');
  });

  it('turns into a dot without a value and drops styles when unstyled', () => {
    const { fixture, badge } = render();
    fixture.componentInstance.value.set(undefined);
    fixture.componentInstance.unstyled.set(true);
    fixture.detectChanges();
    expect(badge.classList).toContain('tx-badge--dot');
    expect(badge.hasAttribute('data-styled')).toBe(false);
  });
});
