import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxDivider } from './divider.component';

@Component({
  imports: [TxDivider],
  template: `
    <tx-divider id="plain" />
    <tx-divider id="text" type="dashed" align="start" [dt]="{ root: { margin: '24px' } }">or</tx-divider>
    <tx-divider id="vertical" layout="vertical" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {}

describe('TxDivider', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('is a separator with its orientation, type and alignment', () => {
    expect(el('#plain').getAttribute('role')).toBe('separator');
    expect(el('#plain').getAttribute('aria-orientation')).toBe('horizontal');
    expect(el('#vertical').getAttribute('aria-orientation')).toBe('vertical');
    expect(el('#text').getAttribute('data-type')).toBe('dashed');
    expect(el('#text').getAttribute('data-align')).toBe('start');
    expect(el('#text .tx-divider__content').textContent).toBe('or');
    expect(el('#text').style.getPropertyValue('--tx-divider-margin')).toBe('24px');
  });
});
