import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxInput } from '@tectra-ng/ui/input';
import { TxFloatLabel } from './float-label.component';
import { TxIftaLabel } from './ifta-label.component';
import { TxLabel } from './label.component';

@Component({
  imports: [TxLabel, TxFloatLabel, TxIftaLabel, TxInput, ReactiveFormsModule],
  template: `
    <tx-label for="email" [required]="true" [colon]="true" [tooltip]="'Hint'">Email</tx-label>
    <input txInput id="email" />
    <tx-float-label [variant]="'in'">
      <input txInput id="name" [formControl]="name" />
      <label for="name">Name</label>
    </tx-float-label>
    <tx-ifta-label><input txInput id="sum" /><label for="sum">Sum</label></tx-ifta-label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly name = new FormControl('');
}

describe('labels', () => {
  let fixture: ComponentFixture<Host>;
  const query = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('links the label to the field and shows the marks', () => {
    const label = query('tx-label label');
    expect(label.getAttribute('for')).toBe('email');
    expect(label.textContent).toContain('Email:');
    expect(query('.tx-label__required').getAttribute('aria-hidden')).toBe('true');
    expect(query('.tx-label__hint').getAttribute('aria-label')).toBe('Hint');
  });

  it('marks the input filled for the float label', async () => {
    const input = query('#name');
    expect(query('tx-float-label').getAttribute('data-variant')).toBe('in');
    expect(input.classList).not.toContain('tx-input--filled');
    fixture.componentInstance.name.setValue('Ann');
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    expect(input.classList).toContain('tx-input--filled');
  });

  it('renders the ifta label', () => {
    expect(query('tx-ifta-label label').textContent).toBe('Sum');
  });
});
