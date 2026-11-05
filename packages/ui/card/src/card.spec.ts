import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxCard } from './card.component';

@Component({
  imports: [TxCard],
  template: `
    <tx-card id="report" title="Weekly report" subtitle="Nov 3 – 9" [headingLevel]="2" [pt]="{ body: { class: 'own' } }">
      <img txCardHeader alt="Chart" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
      Visitors grew 12%.
      <div txCardFooter><button>Open</button></div>
    </tx-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {}

describe('TxCard', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('puts media, title, subtitle, content and footer in their places', () => {
    expect(el('#report .tx-card__header img')).not.toBeNull();
    const title = el('#report .tx-card__title');
    expect(title.getAttribute('role')).toBe('heading');
    expect(title.getAttribute('aria-level')).toBe('2');
    expect(title.textContent).toBe('Weekly report');
    expect(el('#report .tx-card__subtitle').textContent).toBe('Nov 3 – 9');
    expect(el('#report .tx-card__content').textContent).toContain('Visitors grew 12%.');
    expect(el('#report .tx-card__footer button')).not.toBeNull();
    expect(el('#report .tx-card__body').classList).toContain('own');
  });
});
