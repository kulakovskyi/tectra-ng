import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxPanel } from './panel.component';
import { TxPanelVariant } from './panel.types';
import { TX_ICONS, provideTxIcons } from '@tectra-ng/icons';

@Component({
  imports: [TxPanel],
  template: `
    <tx-panel id="members" title="Members" subtitle="People in the project" icon="users" [variant]="variant()" align="center" [toggleable]="true" [(collapsed)]="collapsed" [dt]="{ root: { padding: '12px' } }">
      <button txPanelActions>Invite</button>
      <p>List</p>
      <div txPanelFooter><button>Save</button></div>
    </tx-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly variant = signal<TxPanelVariant>('card');
  collapsed = false;
}

beforeEach(() => TestBed.configureTestingModule({ providers: [provideTxIcons(TX_ICONS)] }));

describe('TxPanel', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('is a region named by its title with icon, subtitle, actions, body and footer', () => {
    const panel = el('#members');
    const title = el('#members .tx-panel__title');
    expect(panel.getAttribute('role')).toBe('region');
    expect(panel.getAttribute('aria-labelledby')).toBe(title.id);
    expect(title.getAttribute('aria-level')).toBe('2');
    expect(el('#members .tx-panel__icon tx-icon').getAttribute('data-icon')).toBe('users');
    expect(el('#members .tx-panel__subtitle').textContent).toBe('People in the project');
    expect(el('#members .tx-panel__actions button').textContent).toBe('Invite');
    expect(el('#members .tx-panel__body p').textContent).toBe('List');
    expect(el('#members .tx-panel__footer button')).not.toBeNull();
    expect(panel.getAttribute('data-align')).toBe('center');
    expect(panel.style.getPropertyValue('--tx-panel-padding')).toBe('12px');
  });

  it('collapses with the toggle button and reports it', async () => {
    const toggle = el('#members .tx-panel__toggle') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-controls')).toBe(el('#members .tx-panel__collapse').id);
    expect(toggle.getAttribute('aria-label')).toBe('Members');
    toggle.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.collapsed).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(el('#members').classList).toContain('tx-panel--collapsed');
    expect(el('#members .tx-panel__collapse').hasAttribute('inert')).toBe(true);
  });

  it('switches the variant', async () => {
    fixture.componentInstance.variant.set('inset');
    await fixture.whenStable();
    expect(el('#members').getAttribute('data-variant')).toBe('inset');
  });
});
