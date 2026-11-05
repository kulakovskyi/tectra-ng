import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxFieldset } from './fieldset.component';

@Component({
  imports: [TxFieldset],
  template: `
    <tx-fieldset id="static" legend="Contact"><input aria-label="Email" /></tx-fieldset>
    <tx-fieldset id="toggle" legend="Billing" [toggleable]="true" [(collapsed)]="collapsed"><input aria-label="Street" /></tx-fieldset>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  collapsed = false;
}

describe('TxFieldset', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('is a native fieldset with a legend', () => {
    expect(el('#static fieldset legend').textContent?.trim()).toBe('Contact');
    expect(el('#static fieldset input')).not.toBeNull();
    expect(el('#static .tx-fieldset__toggle')).toBeNull();
  });

  it('collapses from the legend button', async () => {
    const toggle = el('#toggle legend button') as HTMLButtonElement;
    expect(toggle.textContent?.trim()).toBe('Billing');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    toggle.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.collapsed).toBe(true);
    expect(el('#toggle').classList).toContain('tx-fieldset--collapsed');
    expect(el('#toggle .tx-fieldset__collapse').hasAttribute('inert')).toBe(true);
  });
});
