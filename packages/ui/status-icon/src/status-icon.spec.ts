import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTxTooltip } from '@tectra-ng/ui/tooltip';
import { TxStatusIcon } from './status-icon.component';
import { TxStatusIconSeverity } from './status-icon.types';

@Component({
  imports: [TxStatusIcon],
  template: `
    <tx-status-icon id="status" [status]="active()" />
    <tx-status-icon id="labelled" [status]="true" toolTip="Verified" size="large" />
    <tx-status-icon id="severity" [severity]="severity()" />
    <tx-status-icon id="own" severity="info" icon="fa fa-star" label="Starred" />
    <tx-status-icon id="tipped" [status]="true" label="Backups are on" tooltip tooltipPlacement="right" />
    <tx-status-icon id="silent" [status]="false" label="Sign-in is off" tooltip="none" />
    <tx-status-icon id="decorative" severity="info" [tooltip]="true" />
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

  const fire = (target: Element, type: string) => target.dispatchEvent(new Event(type, { bubbles: true }));
  const tooltip = () => document.querySelector('.tx-tooltip') as HTMLElement | null;
  const settle = async () => {
    await fixture.whenStable();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();
  };

  afterEach(() => {
    fixture.destroy();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTxTooltip({ showDelay: 0, hideDelay: 0 })] });
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

  it('shows the label in a kit tooltip when asked, instead of the native title', async () => {
    const tipped = el('#tipped');
    expect(tipped.hasAttribute('title')).toBe(false);
    expect(tipped.getAttribute('aria-label')).toBe('Backups are on');
    fire(tipped, 'mouseenter');
    await settle();
    expect(tooltip()?.textContent?.trim()).toBe('Backups are on');
    fire(tipped, 'mouseleave');
    await settle();
    expect(tooltip()).toBeNull();

    fire(el('#status'), 'mouseenter');
    await settle();
    expect(tooltip()).toBeNull();
    expect(el('#status').getAttribute('title')).toBe('Yes');
  });

  it('shows no hint for tooltip none or without a label', async () => {
    const silent = el('#silent');
    expect(silent.hasAttribute('title')).toBe(false);
    expect(silent.getAttribute('aria-label')).toBe('Sign-in is off');
    fire(silent, 'mouseenter');
    await settle();
    expect(tooltip()).toBeNull();
    const decorative = el('#decorative');
    expect(decorative.hasAttribute('title')).toBe(false);
    fire(decorative, 'mouseenter');
    await settle();
    expect(tooltip()).toBeNull();
  });
});
