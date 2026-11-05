import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxStatusIcon } from './status-icon.component';
import { TxStatusIconSeverity } from './status-icon.types';

@Component({
  imports: [TxStatusIcon],
  template: `
    <tx-status-icon id="status" [status]="active()" />
    <tx-status-icon id="labelled" [status]="true" toolTip="Verified" size="large" />
    <tx-status-icon id="severity" [severity]="severity()" />
    <tx-status-icon id="own" severity="info" icon="fa fa-star" label="Starred" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly active = signal(true);
  readonly severity = signal<TxStatusIconSeverity>('warn');
}

describe('TxStatusIcon', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('shows on and off with a translated name', async () => {
    expect(el('#status').getAttribute('role')).toBe('img');
    expect(el('#status').getAttribute('aria-label')).toBe('Yes');
    expect(el('#status').getAttribute('data-severity')).toBe('success');
    expect(el('#status tx-icon').getAttribute('data-icon')).toBe('check-circle');
    fixture.componentInstance.active.set(false);
    await fixture.whenStable();
    expect(el('#status').getAttribute('aria-label')).toBe('No');
    expect(el('#status').getAttribute('data-severity')).toBe('danger');
    expect(el('#status tx-icon').getAttribute('data-icon')).toBe('times-circle');
  });

  it('takes a label, a severity and an own icon', () => {
    expect(el('#labelled').getAttribute('aria-label')).toBe('Verified');
    expect(el('#labelled').getAttribute('title')).toBe('Verified');
    expect(el('#labelled').getAttribute('data-size')).toBe('large');
    expect(el('#severity').getAttribute('aria-hidden')).toBe('true');
    expect(el('#severity tx-icon').getAttribute('data-icon')).toBe('exclamation-triangle');
    expect(el('#own span').className).toContain('fa fa-star');
    expect(el('#own').getAttribute('aria-label')).toBe('Starred');
  });
});
