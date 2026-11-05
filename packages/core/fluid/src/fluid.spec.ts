import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxFluid } from './fluid.component';
import { injectFluid } from './inject-fluid';

@Component({ selector: 'test-fluid-aware', template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class FluidAware {
  fluid = input<boolean | undefined>(undefined);
  isFluid = injectFluid(this.fluid);
}

@Component({
  imports: [TxFluid, FluidAware],
  template: `<tx-fluid><test-fluid-aware /></tx-fluid><test-fluid-aware />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {}

describe('injectFluid', () => {
  it('is true inside tx-fluid and false outside', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const [inside, outside] = fixture.debugElement.queryAll((node) => node.componentInstance instanceof FluidAware).map((node) => node.componentInstance as FluidAware);
    expect(inside.isFluid()).toBe(true);
    expect(outside.isFluid()).toBe(false);
  });
});
