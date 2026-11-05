import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxToggleSwitchHandleTemplate } from './toggle-switch-templates.directive';
import { TxToggleSwitch } from './toggle-switch.component';
import { TxToggleSwitchChangeEvent } from './toggle-switch.types';

@Component({
  imports: [TxToggleSwitch, TxToggleSwitchHandleTemplate, ReactiveFormsModule, FormsModule],
  template: `
    <tx-toggle-switch id="notify" label="Notifications" description="Sent by email" [formControl]="notify" onIcon="check" offIcon="times" (changed)="events.push($event)" />
    <tx-toggle-switch id="mode" label="Mode" trueValue="on" falseValue="off" labelPosition="start" size="large" [(ngModel)]="mode" [readonly]="readonly()" [dt]="{ root: { width: '60px' } }" [pt]="{ handle: { class: 'own-handle' } }" />
    <tx-toggle-switch id="custom" ariaLabel="Dark mode">
      <ng-template txToggleSwitchHandle let-checked><b class="own">{{ checked ? 'on' : 'off' }}</b></ng-template>
    </tx-toggle-switch>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly notify = new FormControl(false, Validators.requiredTrue);
  mode = 'off';
  readonly readonly = signal(false);
  events: TxToggleSwitchChangeEvent[] = [];
}

describe('TxToggleSwitch', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const input = (id: string) => el(`#${id} input`) as HTMLInputElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('is a native switch named by its label and described by its description', () => {
    const native = input('notify');
    expect(native.getAttribute('role')).toBe('switch');
    expect(native.getAttribute('aria-checked')).toBe('false');
    expect(el(`label[for="${native.id}"]`).textContent).toContain('Notifications');
    expect(el(`#${native.getAttribute('aria-describedby')}`).textContent).toContain('Sent by email');
  });

  it('toggles the form control, shows the handle icon and reports the change', async () => {
    expect(el('#notify .tx-toggle-switch__handle tx-icon').getAttribute('data-icon')).toBe('times');
    input('notify').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.notify.value).toBe(true);
    expect(input('notify').getAttribute('aria-checked')).toBe('true');
    expect(el('#notify').classList).toContain('tx-toggle-switch--checked');
    expect(el('#notify .tx-toggle-switch__handle tx-icon').getAttribute('data-icon')).toBe('check');
    expect(fixture.componentInstance.events[0]).toMatchObject({ checked: true, value: true });
  });

  it('writes trueValue / falseValue and ignores clicks when readonly', async () => {
    input('mode').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.mode).toBe('on');
    fixture.componentInstance.readonly.set(true);
    await fixture.whenStable();
    input('mode').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.mode).toBe('on');
  });

  it('marks itself invalid and disabled from the form control', async () => {
    fixture.componentInstance.notify.markAsTouched();
    await fixture.whenStable();
    expect(input('notify').getAttribute('aria-invalid')).toBe('true');
    fixture.componentInstance.notify.disable();
    await fixture.whenStable();
    expect(input('notify').disabled).toBe(true);
  });

  it('renders the handle template, label position, size, dt and pt', async () => {
    expect(el('#custom .own').textContent).toBe('off');
    input('custom').click();
    await fixture.whenStable();
    expect(el('#custom .own').textContent).toBe('on');
    expect(input('custom').getAttribute('aria-label')).toBe('Dark mode');
    expect(el('#mode').getAttribute('data-label-position')).toBe('start');
    expect(el('#mode').getAttribute('data-size')).toBe('large');
    expect(el('#mode').style.getPropertyValue('--tx-toggle-switch-width')).toBe('60px');
    expect(el('#mode .tx-toggle-switch__handle').classList).toContain('own-handle');
  });
});
