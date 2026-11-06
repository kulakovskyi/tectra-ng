import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxTextareaCounter } from './textarea-counter.component';
import { TxTextarea } from './textarea.directive';
import { TxTextareaResize } from './textarea.types';

@Component({
  imports: [TxTextarea, TxTextareaCounter, ReactiveFormsModule],
  template: `
    <textarea
      id="bio"
      txTextarea
      maxlength="10"
      [formControl]="bio"
      [autoResize]="autoResize()"
      [maxHeight]="maxHeight()"
      [resize]="resize()"
      [borderless]="true"
      [variant]="'filled'"
      [dt]="{ root: { minHeight: '40px' } }"
      [fieldDt]="{ root: { borderRadius: '2px' } }"
      (heightChange)="heights.push($event)"
      #ref="txTextarea"
    ></textarea>
    <tx-textarea-counter [for]="ref" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly bio = new FormControl('', Validators.required);
  readonly autoResize = signal(true);
  readonly maxHeight = signal<number | undefined>(undefined);
  readonly resize = signal<TxTextareaResize>('vertical');
  heights: number[] = [];
}

describe('TxTextarea', () => {
  let fixture: ComponentFixture<Host>;
  let content = 60;
  const textarea = () => fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
  const counter = () => fixture.nativeElement.querySelector('tx-textarea-counter') as HTMLElement;

  beforeEach(async () => {
    content = 60;
    Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', { configurable: true, get: () => content });
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
  });

  it('uses the input look and its own classes and tokens', () => {
    const element = textarea();
    expect(element.classList).toContain('tx-input');
    expect(element.classList).toContain('tx-textarea--borderless');
    expect(element.classList).toContain('tx-textarea--auto-resize');
    expect(element.getAttribute('data-variant')).toBe('filled');
    expect(element.getAttribute('data-resize')).toBe('vertical');
    expect(element.style.getPropertyValue('--tx-textarea-min-height')).toBe('40px');
    expect(element.style.getPropertyValue('--tx-form-field-border-radius')).toBe('2px');
  });

  it('grows with the text and stops at maxHeight', async () => {
    expect(textarea().style.height).toBe('60px');
    content = 120;
    textarea().value = 'a\nb\nc';
    textarea().dispatchEvent(new Event('input'));
    expect(textarea().style.height).toBe('120px');
    expect(textarea().style.overflowY).toBe('hidden');
    fixture.componentInstance.maxHeight.set(90);
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    expect(textarea().style.height).toBe('90px');
    expect(textarea().style.overflowY).toBe('auto');
    expect(fixture.componentInstance.heights).toEqual([60, 120, 90]);
  });

  it('follows values written by the form and stops growing when autoResize is off', async () => {
    content = 80;
    fixture.componentInstance.bio.setValue('Hello');
    await new Promise((resolve) => setTimeout(resolve));
    expect(textarea().style.height).toBe('80px');
    fixture.componentInstance.autoResize.set(false);
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    expect(textarea().style.height).toBe('');
  });

  it('keeps a height the user dragged when autoResize is off', async () => {
    fixture.componentInstance.autoResize.set(false);
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    textarea().style.height = '150px';
    textarea().value = 'Hi';
    textarea().dispatchEvent(new Event('input'));
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    expect(textarea().style.height).toBe('150px');
  });

  it('counts characters against maxlength', async () => {
    expect(counter().textContent).toBe('0 / 10');
    textarea().value = '0123456789';
    textarea().dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(counter().textContent).toBe('10 / 10');
    expect(counter().classList).toContain('tx-textarea-counter--limit');
    expect(counter().getAttribute('aria-hidden')).toBe('true');
  });

  it('marks itself invalid from the form control', async () => {
    fixture.componentInstance.bio.markAsTouched();
    await fixture.whenStable();
    expect(textarea().getAttribute('aria-invalid')).toBe('true');
  });
});
