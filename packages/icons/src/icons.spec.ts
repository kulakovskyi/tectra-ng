import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxIcon } from './icon.component';
import { TxIconRegistry } from './icon-registry.service';
import { TX_ICONS } from './icons';
import { isTxIconName } from './is-icon-name';
import { provideTxIcons } from './provide-icons';

@Component({
  imports: [TxIcon],
  template: `<tx-icon [name]="'trash'" /><tx-icon [name]="'my-logo'" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {}

describe('icons', () => {
  it('has the PrimeIcons-compatible set', () => {
    expect(Object.keys(TX_ICONS).length).toBe(334);
    expect(isTxIconName('chevron-down')).toBe(true);
    expect(isTxIconName('pi-check')).toBe(false);
  });

  it('renders a tectra icon and a registered one', () => {
    TestBed.configureTestingModule({ providers: [provideTxIcons({ 'my-logo': [{ d: 'M0 0H1', fill: true, stroke: false }] })] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const [trash, logo] = fixture.nativeElement.querySelectorAll('tx-icon') as NodeListOf<HTMLElement>;
    expect(trash.querySelectorAll('path').length).toBe(TX_ICONS.trash.length);
    const logoPath = logo.querySelector('path') as SVGPathElement;
    expect(logoPath.getAttribute('fill')).toBe('currentColor');
    expect(logoPath.getAttribute('stroke')).toBe('none');
  });

  it('registers sets at runtime', () => {
    const registry = TestBed.inject(TxIconRegistry);
    expect(registry.has('custom')).toBe(false);
    registry.register({ custom: ['M0 0'] });
    expect(registry.get('custom')).toEqual(['M0 0']);
  });
});
