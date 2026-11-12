import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxPill } from './pill.component';
import { TxPillSize, TxPillTone } from './pill.types';
import { TX_ICONS, provideTxIcons } from '@tectra-ng/icons';

@Component({
  imports: [TxPill],
  template: `
    <tx-pill id="status" [tone]="tone()" [size]="size()" variant="solid" icon="pi-check" [dt]="{ root: { fontSize: '14px' } }" [pt]="{ label: { class: 'own' } }">Active</tx-pill>
    <tx-pill id="tag" value="Angular" [removable]="true" (removed)="removed = removed + 1"><img txPillLeading alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" /></tx-pill>
    <tx-pill id="dot" tone="warn" [dot]="true" removeLabel="Drop">Pending</tx-pill>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly tone = signal<TxPillTone>('success');
  readonly size = signal<TxPillSize>('normal');
  removed = 0;
}

beforeEach(() => TestBed.configureTestingModule({ providers: [provideTxIcons(TX_ICONS)] }));

describe('TxPill', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('renders tone, variant, an icon with the pi- prefix and maps normal to medium', () => {
    const pill = el('#status');
    expect(pill.getAttribute('data-tone')).toBe('success');
    expect(pill.getAttribute('data-variant')).toBe('solid');
    expect(pill.getAttribute('data-size')).toBe('medium');
    expect(pill.querySelector('.tx-pill__icon tx-icon')?.getAttribute('data-icon')).toBe('pi-check');
    expect(pill.querySelector('.tx-pill__label')?.textContent).toBe('Active');
    expect(pill.querySelector('.tx-pill__label')?.classList).toContain('own');
    expect(pill.style.getPropertyValue('--tx-pill-font-size')).toBe('14px');
  });

  it('removes with a click or the keyboard and has a translated label', async () => {
    const button = el('#tag .tx-pill__remove') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Remove');
    button.click();
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', cancelable: true }));
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', cancelable: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.removed).toBe(3);
    expect(el('#tag img[txPillLeading]')).not.toBeNull();
    expect(el('#tag .tx-pill__label').textContent).toBe('Angular');
  });

  it('shows a dot instead of an icon', () => {
    expect(el('#dot .tx-pill__dot')).not.toBeNull();
    expect(el('#dot .tx-pill__remove')).toBeNull();
  });
});
