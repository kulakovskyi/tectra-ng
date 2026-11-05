import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxProgressBarValueTemplate } from './progress-bar-templates.directive';
import { TxProgressBar } from './progress-bar.component';
import { TxProgressBarMode } from './progress-bar.types';

@Component({
  imports: [TxProgressBar, TxProgressBarValueTemplate],
  template: `
    <tx-progress-bar id="upload" ariaLabel="Upload" [value]="value()" [mode]="mode()" [showValue]="true" severity="success" size="normal" />
    <tx-progress-bar id="disk" [value]="320" [max]="500" unit=" GB" [showValue]="true" color="teal" />
    <tx-progress-bar id="custom" [value]="3" [max]="4" [showValue]="true">
      <ng-template txProgressBarValue let-value let-percent="percent"><b class="own">{{ value }} of 4 · {{ percent }}</b></ng-template>
    </tx-progress-bar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly value = signal(40);
  readonly mode = signal<TxProgressBarMode>('determinate');
}

describe('TxProgressBar', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('is a progressbar with its value, width and label', () => {
    const bar = el('#upload');
    expect(bar.getAttribute('role')).toBe('progressbar');
    expect(bar.getAttribute('aria-label')).toBe('Upload');
    expect(bar.getAttribute('aria-valuenow')).toBe('40');
    expect(bar.getAttribute('aria-valuetext')).toBe('40%');
    expect(bar.getAttribute('data-size')).toBe('medium');
    expect((bar.querySelector('.tx-progress-bar__value') as HTMLElement).style.width).toBe('40%');
    expect(bar.querySelector('.tx-progress-bar__label')?.textContent?.trim()).toBe('40%');
  });

  it('clamps the value and uses min, max and a unit', async () => {
    fixture.componentInstance.value.set(140);
    await fixture.whenStable();
    expect(el('#upload').getAttribute('aria-valuenow')).toBe('100');
    expect(el('#disk .tx-progress-bar__label').textContent?.trim()).toBe('320 GB');
    expect((el('#disk .tx-progress-bar__value') as HTMLElement).style.width).toBe('64%');
    expect(el('#disk').style.getPropertyValue('--tx-progress-bar-fill')).toBe('teal');
    expect(el('#disk').getAttribute('aria-label')).toBe('Loading');
    expect(el('#custom .own').textContent).toBe('3 of 4 · 75');
  });

  it('drops the value in indeterminate mode and marks itself busy', async () => {
    fixture.componentInstance.mode.set('indeterminate');
    await fixture.whenStable();
    expect(el('#upload').getAttribute('aria-valuenow')).toBeNull();
    expect(el('#upload').getAttribute('aria-busy')).toBe('true');
    expect(el('#upload .tx-progress-bar__label')).toBeNull();
  });
});
