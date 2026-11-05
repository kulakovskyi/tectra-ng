import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxProgressSpinner } from './progress-spinner.component';

@Component({
  imports: [TxProgressSpinner],
  template: `
    <tx-progress-spinner id="small" size="small" />
    <tx-progress-spinner id="custom" [size]="64" [strokeWidth]="2" fill="white" animationDuration="2s" color="teal" ariaLabel="Loading the dashboard" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {}

describe('TxProgressSpinner', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('is a busy progressbar named Loading by default', () => {
    expect(el('#small').getAttribute('role')).toBe('progressbar');
    expect(el('#small').getAttribute('aria-busy')).toBe('true');
    expect(el('#small').getAttribute('aria-label')).toBe('Loading');
    expect(el('#small').getAttribute('data-size')).toBe('small');
  });

  it('takes a size in px, stroke, fill, speed, colour and label', () => {
    const spinner = el('#custom');
    expect(spinner.getAttribute('data-size')).toBeNull();
    expect(spinner.style.getPropertyValue('--tx-progress-spinner-size')).toBe('64px');
    expect(spinner.style.getPropertyValue('--tx-progress-spinner-duration')).toBe('2s');
    expect(spinner.style.getPropertyValue('--tx-progress-spinner-color')).toBe('teal');
    expect(spinner.querySelector('.tx-progress-spinner__track')?.getAttribute('fill')).toBe('white');
    expect(spinner.querySelector('.tx-progress-spinner__circle')?.getAttribute('r')).toBe('24');
    expect(spinner.getAttribute('aria-label')).toBe('Loading the dashboard');
  });
});
