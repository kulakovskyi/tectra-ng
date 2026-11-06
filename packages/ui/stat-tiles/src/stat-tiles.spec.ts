import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TxStatTile } from './stat-tile.component';
import { TxStatTiles } from './stat-tiles.component';
import { TxStatTileTone } from './stat-tiles.types';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class Page {}

@Component({
  imports: [TxStatTiles, TxStatTile],
  template: `
    <tx-stat-tiles id="grid" ariaLabel="Traffic" [compact]="compact()" [minWidth]="minWidth()" [dt]="{ root: { gap: '20px' } }">
      <tx-stat-tile
        id="visits"
        label="Visits"
        icon="eye"
        unit="k"
        meta="Last 30 days"
        [value]="value()"
        [tone]="tone()"
        [share]="share()"
        [pt]="{ value: { class: 'own-value' } }"
      >
        <span class="aside" txStatTileAside>+12%</span>
        <span class="spark">spark</span>
      </tx-stat-tile>
      <tx-stat-tile id="empty" label="Bounce" />
      <tx-stat-tile id="text" label="Top page" value="/pricing/enterprise" textValue fitValue accentValue highlighted tone="success" />
      <tx-stat-tile id="router" label="Orders" [value]="5" [link]="['/orders']" [queryParams]="{ status: 'open' }" />
      <tx-stat-tile id="external" label="Status" value="OK" href="https://example.com" target="_blank" />
    </tx-stat-tiles>
    <tx-stat-tile id="alone" label="Alone" unstyled />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly compact = signal(false);
  readonly minWidth = signal<string | undefined>(undefined);
  readonly value = signal<number | null>(12.4);
  readonly tone = signal<TxStatTileTone>('primary');
  readonly share = signal<number | null>(140);
}

describe('TxStatTiles', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'orders', component: Page }])] });
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('is a named list of list items', () => {
    expect(el('#grid').getAttribute('role')).toBe('list');
    expect(el('#grid').getAttribute('aria-label')).toBe('Traffic');
    expect(el('#visits').getAttribute('role')).toBe('listitem');
  });

  it('shows the label, value, unit, meta, icon and slots', () => {
    expect(el('#visits .tx-stat-tile__label').textContent).toBe('Visits');
    expect(el('#visits .tx-stat-tile__value').textContent?.replace(/\s+/g, ' ').trim()).toBe('12.4 k');
    expect(el('#visits .tx-stat-tile__meta').textContent).toBe('Last 30 days');
    expect(el('#visits .tx-stat-tile__icon').getAttribute('aria-hidden')).toBe('true');
    expect(el('#visits .tx-stat-tile__aside .aside').textContent).toBe('+12%');
    expect(el('#visits .tx-stat-tile__body .spark')).not.toBeNull();
    expect(el('#visits .own-value')).not.toBeNull();
    expect(el('#empty .tx-stat-tile__icon')).toBeNull();
    expect(el('#empty .tx-stat-tile__aside').childElementCount).toBe(0);
  });

  it('shows a dash for a missing value', async () => {
    expect(el('#empty .tx-stat-tile__value').textContent?.trim()).toBe('-');
    fixture.componentInstance.value.set(null);
    await fixture.whenStable();
    expect(el('#visits .tx-stat-tile__value').textContent?.trim().startsWith('-')).toBe(true);
  });

  it('clamps the share into a meter and hides it without a share', async () => {
    const meter = el('#visits [role="meter"]');
    expect(meter.getAttribute('aria-valuenow')).toBe('100');
    expect(meter.getAttribute('aria-label')).toBe('Visits');
    expect(el('#visits .tx-stat-tile__bar-fill').style.width).toBe('100%');
    fixture.componentInstance.share.set(0);
    await fixture.whenStable();
    expect(el('#visits [role="meter"]').getAttribute('aria-valuenow')).toBe('0');
    fixture.componentInstance.share.set(null);
    await fixture.whenStable();
    expect(el('#visits [role="meter"]')).toBeNull();
  });

  it('reflects tone and value modes on the tile', async () => {
    expect(el('#visits').getAttribute('data-tone')).toBe('primary');
    fixture.componentInstance.tone.set('danger');
    await fixture.whenStable();
    expect(el('#visits').getAttribute('data-tone')).toBe('danger');
    const text = el('#text');
    expect(text.classList).toContain('tx-stat-tile--highlighted');
    expect(text.classList).toContain('tx-stat-tile--fit');
    expect(el('#text .tx-stat-tile__value').classList).toContain('tx-stat-tile__value--text');
    expect(el('#text .tx-stat-tile__value').classList).toContain('tx-stat-tile__value--accent');
    expect(el('#text .tx-stat-tile__value').getAttribute('title')).toBe('/pricing/enterprise');
    expect(el('#visits .tx-stat-tile__value').hasAttribute('title')).toBe(false);
  });

  it('renders router and plain link tiles as one anchor', () => {
    const router = el('#router a.tx-stat-tile__body');
    expect(router.getAttribute('href')).toBe('/orders?status=open');
    expect(el('#router').classList).toContain('tx-stat-tile--link');
    const external = el('#external a.tx-stat-tile__body');
    expect(external.getAttribute('href')).toBe('https://example.com');
    expect(external.getAttribute('target')).toBe('_blank');
    expect(external.getAttribute('rel')).toBe('noopener noreferrer');
    expect(el('#visits div.tx-stat-tile__body')).not.toBeNull();
  });

  it('passes compact to the tiles and sets the column width and tokens', async () => {
    expect(el('#visits').classList).not.toContain('tx-stat-tile--compact');
    expect(el('#grid').style.getPropertyValue('--tx-stat-tiles-gap')).toBe('20px');
    expect(el('#grid').style.getPropertyValue('--tx-stat-tiles-min-width')).toBe('');
    fixture.componentInstance.compact.set(true);
    fixture.componentInstance.minWidth.set('9rem');
    await fixture.whenStable();
    expect(el('#grid').classList).toContain('tx-stat-tiles--compact');
    expect(el('#visits').classList).toContain('tx-stat-tile--compact');
    expect(el('#grid').style.getPropertyValue('--tx-stat-tiles-min-width')).toBe('9rem');
  });

  it('drops the styles when unstyled and works outside a grid', () => {
    expect(el('#visits').hasAttribute('data-styled')).toBe(true);
    expect(el('#alone').hasAttribute('data-styled')).toBe(false);
    expect(el('#alone').classList).not.toContain('tx-stat-tile--compact');
  });
});
