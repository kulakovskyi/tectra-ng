import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxToggleButton } from './toggle-button.component';
import { TxToggleButtonChangeEvent } from './toggle-button.types';

@Component({
  imports: [TxToggleButton, ReactiveFormsModule],
  template: `
    <tx-toggle-button
      [formControl]="control"
      [onLabel]="'On'"
      [offLabel]="'Off'"
      [onIcon]="'check'"
      [allowEmpty]="allowEmpty()"
      (changed)="events.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  control = new FormControl(false);
  readonly allowEmpty = signal(true);
  events: TxToggleButtonChangeEvent[] = [];
}

describe('TxToggleButton', () => {
  let fixture: ComponentFixture<Host>;
  const button = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('toggles the form value and the label', () => {
    expect(button().textContent).toContain('Off');
    button().click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(true);
    expect(button().getAttribute('aria-pressed')).toBe('true');
    expect(button().textContent).toContain('On');
    expect(fixture.componentInstance.events[0].checked).toBe(true);
  });

  it('cannot be turned off when allowEmpty is false', () => {
    fixture.componentInstance.allowEmpty.set(false);
    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();
    button().click();
    expect(fixture.componentInstance.control.value).toBe(true);
  });

  it('follows the disabled state of the form control', () => {
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(button().disabled).toBe(true);
  });
});
