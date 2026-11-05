import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxChip } from './chip.component';

@Component({
  imports: [TxChip],
  template: `
    <tx-chip id="person" label="Olena" image="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="" [removable]="true" removeLabel="Remove Olena" (removed)="removed = removed + 1" />
    <tx-chip id="filter" label="Paid" icon="filter" removeIcon="pi pi-times" [removable]="true" [dt]="{ root: { height: '24px' } }" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  removed = 0;
}

describe('TxChip', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('renders an image or an icon before the label', () => {
    expect(el('#person img').getAttribute('alt')).toBe('');
    expect(el('#person').classList).toContain('tx-chip--image');
    expect(el('#person .tx-chip__label').textContent).toBe('Olena');
    expect(el('#filter .tx-chip__icon tx-icon').getAttribute('data-icon')).toBe('filter');
    expect(el('#filter').style.getPropertyValue('--tx-chip-height')).toBe('24px');
  });

  it('is removed with its button, with an own label and icon', async () => {
    const remove = el('#person .tx-chip__remove') as HTMLButtonElement;
    expect(remove.getAttribute('aria-label')).toBe('Remove Olena');
    remove.click();
    remove.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', cancelable: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.removed).toBe(2);
    expect(el('#filter .tx-chip__remove span').className).toBe('pi pi-times');
    expect(el('#filter .tx-chip__remove').getAttribute('aria-label')).toBe('Remove');
  });
});
