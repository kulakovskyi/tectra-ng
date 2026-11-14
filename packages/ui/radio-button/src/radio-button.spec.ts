import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxRadioButton } from './radio-button.component';
import { TxRadioGroup } from './radio-group.component';

@Component({
  imports: [TxRadioButton, TxRadioGroup, ReactiveFormsModule, FormsModule],
  template: `
    <tx-radio-group id="plan" [formControl]="plan" ariaLabel="Plan" size="small" [required]="true">
      <tx-radio-button value="free" label="Free" />
      <tx-radio-button value="team" label="Team" description="Up to 20 people" [tile]="true" />
      <tx-radio-button value="enterprise" label="Enterprise" [disabled]="true" />
    </tx-radio-group>
    <tx-radio-button id="alone-a" value="a" label="A" [(ngModel)]="letter" [readonly]="readonly()" [dt]="{ root: { size: '24px' } }" [pt]="{ dot: { class: 'own-dot' } }" />
    <tx-radio-button id="alone-b" value="b" label="B" [(ngModel)]="letter" />
    <tx-radio-group id="sizes" ariaLabel="Size">
      <tx-radio-button id="bare" value="s" ariaLabel="Small" />
      <tx-radio-button id="projected" value="m">Medium</tx-radio-button>
    </tx-radio-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly plan = new FormControl<string | null>('free', Validators.required);
  letter = 'b';
  readonly readonly = signal(false);
}

describe('TxRadioButton', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const radios = () => Array.from(fixture.nativeElement.querySelectorAll('#plan input')) as HTMLInputElement[];

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('is a radiogroup of native radios that share a name', () => {
    expect(el('#plan').getAttribute('role')).toBe('radiogroup');
    expect(el('#plan').getAttribute('aria-label')).toBe('Plan');
    const names = new Set(radios().map((radio) => radio.name));
    expect(names.size).toBe(1);
    expect([...names][0]).toMatch(/^tx-radio-group-/);
    expect(radios().map((radio) => radio.checked)).toEqual([true, false, false]);
    expect(radios().every((radio) => radio.required)).toBe(true);
    expect(radios()[2].disabled).toBe(true);
    expect(el('#plan tx-radio-button').getAttribute('data-size')).toBe('small');
  });

  it('writes the chosen value to the group control', async () => {
    radios()[1].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.plan.value).toBe('team');
    expect(el('#plan tx-radio-button:nth-child(2)').classList).toContain('tx-radio-button--checked');
    expect(el(`#${radios()[1].getAttribute('aria-describedby')}`).textContent).toContain('Up to 20 people');
  });

  it('stretches the buttons of a group that holds tiles', () => {
    expect(el('#plan').hasAttribute('data-tiles')).toBe(true);
    expect(el('#sizes').hasAttribute('data-tiles')).toBe(false);
  });

  it('drops the text and its gap when there is no label, description or content', () => {
    expect(getComputedStyle(el('#bare .tx-radio-button__text')).display).toBe('none');
    expect(getComputedStyle(el('#projected .tx-radio-button__text')).display).not.toBe('none');
    expect(getComputedStyle(el('#alone-a .tx-radio-button__text')).display).not.toBe('none');
    expect(getComputedStyle(el('#plan tx-radio-button:nth-child(2) .tx-radio-button__text')).display).not.toBe('none');
  });

  it('selects a tile from anywhere on the card', async () => {
    el('#plan tx-radio-button:nth-child(2)').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.plan.value).toBe('team');
  });

  it('works alone with ngModel and ignores clicks when readonly', async () => {
    const a = el('#alone-a input') as HTMLInputElement;
    expect(a.checked).toBe(false);
    a.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.letter).toBe('a');
    fixture.componentInstance.readonly.set(true);
    fixture.componentInstance.letter = 'b';
    fixture.detectChanges();
    await fixture.whenStable();
    a.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.letter).toBe('b');
  });

  it('follows the group state: invalid and disabled', async () => {
    fixture.componentInstance.plan.setValue(null);
    fixture.componentInstance.plan.markAsTouched();
    await fixture.whenStable();
    expect(el('#plan').getAttribute('aria-invalid')).toBe('true');
    expect(radios()[0].getAttribute('aria-invalid')).toBe('true');
    fixture.componentInstance.plan.disable();
    await fixture.whenStable();
    expect(radios().every((radio) => radio.disabled)).toBe(true);
  });

  it('applies dt and pt', () => {
    expect(el('#alone-a').style.getPropertyValue('--tx-radio-button-size')).toBe('24px');
    expect(el('#alone-a .tx-radio-button__dot').classList).toContain('own-dot');
  });

  it('focuses its input and touches the group on blur', () => {
    const radio = fixture.debugElement.query((node) => node.componentInstance instanceof TxRadioButton).componentInstance as TxRadioButton;
    radio.focus();
    expect(document.activeElement).toBe(radios()[0]);
    radios()[0].dispatchEvent(new FocusEvent('blur'));
    expect(fixture.componentInstance.plan.touched).toBe(true);
  });

  it('is touched on blur when alone', async () => {
    const model = fixture.debugElement.query((node) => node.nativeElement.id === 'alone-b').injector.get(NgModel);
    expect(model.touched).toBe(false);
    (el('#alone-b input') as HTMLInputElement).dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(model.touched).toBe(true);
  });
});

describe('TxRadioButton recompiled by TestBed', () => {
  it('still joins its group when a test overrides the components', async () => {
    TestBed.overrideComponent(TxRadioButton, { set: { styles: [] } });
    TestBed.overrideComponent(TxRadioGroup, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    (fixture.nativeElement.querySelectorAll('#plan input')[1] as HTMLInputElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.plan.value).toBe('team');
  });
});

