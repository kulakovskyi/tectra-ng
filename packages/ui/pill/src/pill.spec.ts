import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TxPill } from './pill.component';
import { TxPillSize, TxPillTone } from './pill.types';
import { TX_ICONS, provideTxIcons } from '@tectra-ng/icons';

@Component({
  selector: 'country-pill',
  imports: [TxPill],
  template: `<tx-pill [pt]="{ leading: { class: 'own-leading' } }"><ng-container ngProjectAs="[txPillLeading]"><ng-content select="[flag]" /></ng-container><ng-content /></tx-pill>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CountryPill {}

@Component({
  imports: [TxPill, CountryPill],
  template: `
    <tx-pill id="status" [tone]="tone()" [size]="size()" variant="solid" icon="pi-check" [dt]="{ root: { fontSize: '14px' } }" [pt]="{ label: { class: 'own' } }">Active</tx-pill>
    <tx-pill id="tag" value="Angular" [removable]="true" (removed)="removed = removed + 1"><img txPillLeading alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" /></tx-pill>
    <tx-pill id="dot" tone="warn" [dot]="true" removeLabel="Drop">Pending</tx-pill>
    <tx-pill id="own" icon="own-pill-icon">Own</tx-pill>
    <tx-pill id="loading" icon=" spinner pi-spin own-modifier ">Saving</tx-pill>
    <tx-pill id="class-icon" icon="pi pi-spinner pi-spin">Legacy</tx-pill>
    <tx-pill id="empty-label" [removable]="true" removeLabel="">Draft</tx-pill>
    <tx-pill id="own-label" [removable]="true" removeLabel="Drop tag">Tag</tx-pill>
    <country-pill id="country"><span flag class="flag">UA</span>Ukraine</country-pill>
    <country-pill id="no-flag">Unknown</country-pill>
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

  it('reads the secondary tone as neutral', async () => {
    fixture.componentInstance.tone.set('secondary');
    await fixture.whenStable();
    expect(el('#status').getAttribute('data-tone')).toBe('neutral');
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

  it('puts a re-projected element into the styled leading slot and leaves an empty slot out', () => {
    const leading = el('#country .tx-pill__leading');
    expect(leading.querySelector('.flag')?.textContent).toBe('UA');
    expect(leading.classList).toContain('own-leading');
    expect(el('#country .tx-pill__label').textContent).toBe('Ukraine');
    expect(el('#no-flag .tx-pill__leading').childElementCount).toBe(0);
    expect(el('#tag .tx-pill__leading img[txPillLeading]')).not.toBeNull();
  });

  it('passes icon modifiers to a tectra icon and spins it', () => {
    const icon = el('#loading .tx-pill__icon');
    expect(icon.classList).toContain('tx-pill__icon--spin');
    expect(icon.querySelector('tx-icon')?.getAttribute('data-icon')).toBe('spinner');
    expect(icon.querySelector('tx-icon')?.classList).toContain('pi-spin');
    expect(icon.querySelector('tx-icon')?.classList).toContain('own-modifier');
    expect(el('#status .tx-pill__icon').classList).not.toContain('tx-pill__icon--spin');
    const plain = fixture.debugElement.query(By.css('#tag')).injector.get(TxPill);
    expect(plain.iconName()).toBeNull();
    expect(plain.iconModifiers()).toBe('');
    expect(plain.iconSpin()).toBe(false);
  });

  it('keeps a class list that does not start with a tectra icon name as classes', () => {
    const icon = el('#class-icon .tx-pill__icon');
    expect(icon.querySelector('tx-icon')).toBeNull();
    expect(icon.querySelector('span.pi.pi-spinner.pi-spin')).not.toBeNull();
    expect(icon.classList).not.toContain('tx-pill__icon--spin');
  });

  it('falls back to the translated remove label when the label is empty', () => {
    const button = el('#empty-label .tx-pill__remove');
    expect(button.getAttribute('aria-label')).toBe('Remove');
    expect(button.getAttribute('title')).toBe('Remove');
    expect(el('#own-label .tx-pill__remove').getAttribute('aria-label')).toBe('Drop tag');
  });

  it('draws an unregistered icon name as a class', () => {
    expect(el('#own .tx-pill__icon span.own-pill-icon')).not.toBeNull();
  });
});

