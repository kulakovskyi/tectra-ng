import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxSkeletonTable } from './skeleton-table.component';
import { TxSkeleton } from './skeleton.component';

@Component({
  imports: [TxSkeleton, TxSkeletonTable],
  template: `
    <tx-skeleton id="avatar" shape="circle" size="48px" />
    <tx-skeleton id="box" width="60%" height="120px" borderRadius="16px" animation="none" [dt]="{ root: { duration: '3s' } }" />
    <tx-skeleton id="text" [lines]="3" />
    <tx-skeleton-table id="table" [rows]="2" [columns]="3" />
    <tx-skeleton-table id="body-only" [rows]="2" [columns]="2" [header]="false" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {}

describe('TxSkeleton', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('draws shapes with sizes and is hidden from screen readers', () => {
    expect(el('#avatar').getAttribute('aria-hidden')).toBe('true');
    expect(el('#avatar').getAttribute('data-shape')).toBe('circle');
    expect(el('#avatar').style.width).toBe('48px');
    expect(el('#avatar').style.height).toBe('48px');
    expect(el('#box').style.width).toBe('60%');
    expect(el('#box').style.borderRadius).toBe('16px');
    expect(el('#box').getAttribute('data-animation')).toBe('none');
    expect(el('#box').style.getPropertyValue('--tx-skeleton-duration')).toBe('3s');
  });

  it('draws text lines and a table', () => {
    expect(el('#text').querySelectorAll('.tx-skeleton__line')).toHaveLength(3);
    expect(el('#table').getAttribute('aria-hidden')).toBe('true');
    expect(el('#table').querySelectorAll('.tx-skeleton-table__row')).toHaveLength(3);
    expect(el('#table').querySelectorAll('.tx-skeleton-table__header tx-skeleton')).toHaveLength(3);
    expect(el('#table').style.getPropertyValue('--_columns')).toBe('3');
    expect(el('#body-only .tx-skeleton-table__header')).toBeNull();
    expect(el('#body-only').querySelectorAll('.tx-skeleton-table__row')).toHaveLength(2);
  });
});
