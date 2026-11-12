import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxOverlayInset } from './overlay-inset.directive';
import { TxOverlayInsets } from './overlay-insets.service';

@Component({
  imports: [TxOverlayInset],
  template: `<header txOverlayInset>Header</header>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {}

describe('TxOverlayInset', () => {
  it('registers its element as overlay chrome while it lives', () => {
    const insets = TestBed.inject(TxOverlayInsets);
    const unregister = vi.fn();
    const register = vi.spyOn(insets, 'register').mockReturnValue(unregister);
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    expect(register).toHaveBeenCalledWith(fixture.nativeElement.querySelector('header'));
    expect(unregister).not.toHaveBeenCalled();
    fixture.destroy();
    expect(unregister).toHaveBeenCalledTimes(1);
  });
});
