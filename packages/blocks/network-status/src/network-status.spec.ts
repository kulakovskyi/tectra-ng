import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxNetworkStatus } from './network-status.component';
import { TxNetworkState } from './network-status.types';

@Component({
  imports: [TxNetworkStatus],
  template: `<tx-network-status [restoredDuration]="50" [dt]="{ root: { bottom: '40px' } }" (statusChange)="states.push($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly states: TxNetworkState[] = [];
}

describe('TxNetworkStatus', () => {
  it('shows the offline pill, then "Connection restored" for a while, and marks the body', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-network-status') as HTMLElement;
    const region = root.querySelector('[role="status"]') as HTMLElement;
    expect(root.style.getPropertyValue('--tx-network-status-bottom')).toBe('40px');
    expect(region.getAttribute('aria-live')).toBe('polite');
    expect(region.querySelector('.tx-network-status__pill')).toBeNull();

    window.dispatchEvent(new Event('offline'));
    await fixture.whenStable();
    const pill = () => region.querySelector('.tx-network-status__pill') as HTMLElement | null;
    expect(pill()?.getAttribute('data-status')).toBe('offline');
    expect(pill()?.textContent?.trim()).toBe('No internet connection');
    expect(pill()?.querySelector('tx-icon')?.getAttribute('data-icon')).toBe('wifi');
    expect(document.body.classList).toContain('tx-offline');

    window.dispatchEvent(new Event('online'));
    await fixture.whenStable();
    expect(pill()?.getAttribute('data-status')).toBe('restored');
    expect(pill()?.textContent?.trim()).toBe('Connection restored');
    expect(pill()?.querySelector('tx-icon')?.getAttribute('data-icon')).toBe('check');

    await new Promise((resolve) => setTimeout(resolve, 80));
    await fixture.whenStable();
    expect(document.body.classList).not.toContain('tx-offline');
    expect(fixture.componentInstance.states).toEqual(['offline', 'restored', 'online']);
  });

  it('ignores "online" while it was not offline', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    window.dispatchEvent(new Event('online'));
    await fixture.whenStable();
    expect(fixture.componentInstance.states).toEqual([]);
  });
});
