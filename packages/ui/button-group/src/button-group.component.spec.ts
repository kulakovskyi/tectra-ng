import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxFluid } from '@tectra-ng/core/fluid';
import { TxButton } from '@tectra-ng/ui/button';
import { TxButtonGroup } from './button-group.component';
import { TxButtonGroupOrientation } from './button-group.types';

@Component({
  imports: [TxButtonGroup, TxButton],
  template: `
    <tx-button-group
      aria-label="Actions"
      [orientation]="orientation()"
      [fluid]="fluid()"
      [dt]="{ root: { dividerWidth: '2px' } }"
      [pt]="{ root: { class: 'custom-group', style: { gap: '0px' } } }"
      [unstyled]="unstyled()"
    >
      <button txButton>One</button>
      <button txButton>Two</button>
    </tx-button-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class GroupHost {
  readonly orientation = signal<TxButtonGroupOrientation>('horizontal');
  readonly fluid = signal<boolean | undefined>(undefined);
  readonly unstyled = signal<boolean | undefined>(undefined);
}

@Component({
  imports: [TxButtonGroup, TxButton, TxFluid],
  template: `
    <tx-fluid>
      <tx-button-group><button txButton>One</button></tx-button-group>
    </tx-fluid>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FluidParentHost {}

function render() {
  const fixture = TestBed.createComponent(GroupHost);
  fixture.detectChanges();
  const host: HTMLElement = fixture.nativeElement.querySelector('tx-button-group');
  return { fixture, host };
}

describe('TxButtonGroup', () => {
  it('is a group', () => {
    const fixture = TestBed.createComponent(TxButtonGroup);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('role')).toBe('group');
  });

  it('writes the divider tokens of the group', () => {
    TestBed.createComponent(TxButtonGroup).detectChanges();
    const css = document.getElementById('tectra-tokens-buttonGroup')?.textContent;
    expect(css).toContain('--tx-button-group-divider-color: color-mix(in srgb, currentColor, transparent 68%);');
    expect(css).toContain('--tx-button-group-divider-width: 1px;');
  });

  it('lines up horizontally by default and stacks when vertical', () => {
    const { fixture, host } = render();
    expect(host.getAttribute('data-orientation')).toBe('horizontal');
    expect(host.classList).not.toContain('tx-button-group--vertical');
    fixture.componentInstance.orientation.set('vertical');
    fixture.detectChanges();
    expect(host.getAttribute('data-orientation')).toBe('vertical');
    expect(host.classList).toContain('tx-button-group--vertical');
  });

  it('takes the full width when fluid, also from a parent tx-fluid', () => {
    const { fixture, host } = render();
    expect(host.classList).not.toContain('tx-button-group--fluid');
    fixture.componentInstance.fluid.set(true);
    fixture.detectChanges();
    expect(host.classList).toContain('tx-button-group--fluid');

    const parent = TestBed.createComponent(FluidParentHost);
    parent.detectChanges();
    expect(parent.nativeElement.querySelector('tx-button-group').classList).toContain('tx-button-group--fluid');
  });

  it('applies dt and pt to the root', () => {
    const { host } = render();
    expect(host.style.getPropertyValue('--tx-button-group-divider-width')).toBe('2px');
    expect(host.classList).toContain('custom-group');
    expect(host.classList).toContain('tx-button-group');
    expect(host.style.gap).toBe('0px');
  });

  it('marks the styled state and drops it when unstyled', () => {
    const { fixture, host } = render();
    expect(host.hasAttribute('data-styled')).toBe(true);
    fixture.componentInstance.unstyled.set(true);
    fixture.detectChanges();
    expect(host.hasAttribute('data-styled')).toBe(false);
  });
});
