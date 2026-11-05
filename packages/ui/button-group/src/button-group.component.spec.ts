import { TestBed } from '@angular/core/testing';
import { TxButtonGroup } from './button-group.component';

describe('TxButtonGroup', () => {
  it('is a group', () => {
    const fixture = TestBed.createComponent(TxButtonGroup);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('role')).toBe('group');
  });
});
