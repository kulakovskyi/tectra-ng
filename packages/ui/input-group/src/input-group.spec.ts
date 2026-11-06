import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxFluid } from '@tectra-ng/core/fluid';
import { TxInputGroup } from './input-group.component';
import { TxInputGroupAddon } from './input-group-addon.component';

@Component({
  imports: [TxInputGroup, TxInputGroupAddon, TxFluid],
  template: `<tx-fluid><tx-input-group><tx-input-group-addon>$</tx-input-group-addon><input /></tx-input-group></tx-fluid>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {}

describe('TxInputGroup', () => {
  it('is a group with addons and follows tx-fluid', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const group = fixture.nativeElement.querySelector('tx-input-group') as HTMLElement;
    expect(group.getAttribute('role')).toBe('group');
    expect(group.classList).toContain('tx-input-group--fluid');
    expect(group.querySelector('tx-input-group-addon')?.textContent).toBe('$');
  });
});
