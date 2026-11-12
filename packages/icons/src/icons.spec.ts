import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxIcon } from './icon.component';
import { TX_ICON_DEFAULTS, injectTxIcons, provideTxIconDefaults } from './icon-defaults';
import { TxIconRegistry } from './icon-registry.service';
import { TX_ICONS, txIconCheck, txIconTrash } from './icons';
import { isTxIconName } from './is-icon-name';
import { provideTxIcons } from './provide-icons';

@Component({
  imports: [TxIcon],
  template: `<tx-icon [name]="'trash'" /><tx-icon [name]="'my-logo'" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {}

@Component({
  selector: 'tx-test-kit',
  imports: [TxIcon],
  template: `<tx-icon class="own" name="check" /><ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideTxIconDefaults({ check: txIconCheck })],
})
class KitComponent {}

@Component({
  imports: [TxIcon, KitComponent],
  template: `<tx-test-kit><tx-icon class="projected" name="check" /></tx-test-kit>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class AppHost {}

const paths = (element: Element | null) => element?.querySelectorAll('path').length ?? 0;

describe('icons', () => {
  afterEach(() => vi.restoreAllMocks());

  it('has the full icon set, one constant per icon', () => {
    expect(Object.keys(TX_ICONS).length).toBe(334);
    expect(TX_ICONS.trash).toBe(txIconTrash);
    expect(isTxIconName('chevron-down')).toBe(true);
    expect(isTxIconName('pi-check')).toBe(false);
  });

  it('renders the icons an app registers', () => {
    TestBed.configureTestingModule({ providers: [provideTxIcons({ trash: txIconTrash }, { 'my-logo': [{ d: 'M0 0H1', fill: true, stroke: false }] })] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const [trash, logo] = fixture.nativeElement.querySelectorAll('tx-icon') as NodeListOf<HTMLElement>;
    expect(paths(trash)).toBe(txIconTrash.length);
    const logoPath = logo.querySelector('path') as SVGPathElement;
    expect(logoPath.getAttribute('fill')).toBe('currentColor');
    expect(logoPath.getAttribute('stroke')).toBe('none');
  });

  it('draws nothing for a name nobody registered and says so once in development', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    expect(paths(fixture.nativeElement.querySelector('tx-icon'))).toBe(0);
    expect(TestBed.runInInjectionContext(() => injectTxIcons()).has('trash')).toBe(false);
    expect(warn.mock.calls.filter(([message]) => String(message).includes('"trash"'))).toHaveLength(1);
    expect(String(warn.mock.calls[0][0])).toContain('provideTxIcons(TX_ICONS)');
  });

  it('gives a kit component its own icons in its view, but not to the content an app projects into it', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(AppHost);
    fixture.detectChanges();
    expect(paths(fixture.nativeElement.querySelector('.own'))).toBe(txIconCheck.length);
    expect(paths(fixture.nativeElement.querySelector('.projected'))).toBe(0);
  });

  it('lets icons registered by the app replace the defaults of a component', () => {
    TestBed.configureTestingModule({ providers: [provideTxIcons({ check: ['M0 0', 'M1 1', 'M2 2', 'M3 3', 'M4 4', 'M5 5', 'M6 6'] })] });
    const fixture = TestBed.createComponent(AppHost);
    fixture.detectChanges();
    expect(paths(fixture.nativeElement.querySelector('.own'))).toBe(7);
  });

  it('merges the defaults of nested components', () => {
    TestBed.configureTestingModule({ providers: [provideTxIconDefaults({ check: txIconCheck })] });
    const child = TestBed.inject(TX_ICON_DEFAULTS);
    expect(child).toEqual({ check: txIconCheck });
  });

  it('accepts names with the pi- prefix, but keeps full icon classes as classes', () => {
    const registry = TestBed.inject(TxIconRegistry);
    registry.register(TX_ICONS);
    expect(registry.has('pi-check')).toBe(true);
    expect(registry.get('pi-check')).toEqual(registry.get('check'));
    expect(registry.has('pi pi-check')).toBe(false);
    expect(registry.has(undefined)).toBe(false);
    const lookup = TestBed.runInInjectionContext(() => injectTxIcons());
    expect(lookup.has('pi-check')).toBe(true);
    expect(lookup.has(undefined)).toBe(false);
    expect(lookup.has('pi pi-check')).toBe(false);
  });

  it('registers sets at runtime', () => {
    const registry = TestBed.inject(TxIconRegistry);
    expect(registry.has('custom')).toBe(false);
    registry.register({ custom: ['M0 0'] });
    expect(registry.get('custom')).toEqual(['M0 0']);
  });
});
