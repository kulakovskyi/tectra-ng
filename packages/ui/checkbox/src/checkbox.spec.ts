import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxCheckboxGroup } from './checkbox-group.component';
import { TxCheckboxIconTemplate } from './checkbox-templates.directive';
import { TxCheckbox } from './checkbox.component';
import { TxCheckboxChangeEvent } from './checkbox.types';

@Component({
  imports: [TxCheckbox, TxCheckboxGroup, TxCheckboxIconTemplate, ReactiveFormsModule, FormsModule],
  template: `
    <tx-checkbox id="terms" label="I agree" description="Read the terms first" [formControl]="terms" (changed)="events.push($event)" />
    <tx-checkbox id="values" label="Yes / no" trueValue="yes" falseValue="no" [(ngModel)]="answer" />
    <tx-checkbox id="mixed" label="Mixed" [(indeterminate)]="mixed" [readonly]="readonly()" />
    <tx-checkbox id="array" value="b" [formControl]="letters" ariaLabel="B" [tile]="true" [dt]="{ root: { size: '24px' } }" [pt]="{ label: { class: 'own-label' } }" />
    <tx-checkbox id="own-icon" [binary]="true" ariaLabel="Star">
      <ng-template txCheckboxIcon let-checked><b class="own-icon">{{ checked ? '★' : '☆' }}</b></ng-template>
    </tx-checkbox>
    <tx-checkbox-group id="group" [formControl]="permissions" [selectAll]="true" ariaLabel="Permissions" size="small">
      <tx-checkbox value="read" label="Read" />
      <tx-checkbox value="write" label="Write" />
      <tx-checkbox value="delete" label="Delete" />
    </tx-checkbox-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly terms = new FormControl(false, Validators.requiredTrue);
  readonly letters = new FormControl<string[]>(['a']);
  readonly permissions = new FormControl<string[]>(['read']);
  answer = 'no';
  mixed = true;
  readonly readonly = signal(false);
  events: TxCheckboxChangeEvent[] = [];
}

describe('TxCheckbox', () => {
  let fixture: ComponentFixture<Host>;
  const host = () => fixture.componentInstance;
  const input = (id: string) => fixture.nativeElement.querySelector(`#${id} input`) as HTMLInputElement;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const click = async (id: string) => {
    input(id).click();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('is a native checkbox named by its label and described by its description', () => {
    const native = input('terms');
    expect(native.type).toBe('checkbox');
    expect(el(`label[for="${native.id}"]`).textContent).toContain('I agree');
    expect(el(`#${native.getAttribute('aria-describedby')}`).textContent).toContain('Read the terms first');
  });

  it('drops the text and its gap when there is no label, description or content', () => {
    expect(getComputedStyle(el('#own-icon .tx-checkbox__text')).display).toBe('none');
    expect(getComputedStyle(el('#array .tx-checkbox__text')).display).toBe('none');
    expect(getComputedStyle(el('#terms .tx-checkbox__text')).display).not.toBe('none');
    expect(getComputedStyle(el('#values .tx-checkbox__text')).display).not.toBe('none');
  });

  it('toggles a binary form control and reports the change', async () => {
    await click('terms');
    expect(host().terms.value).toBe(true);
    expect(el('#terms').classList).toContain('tx-checkbox--checked');
    expect(host().events[0].checked).toBe(true);
    await click('terms');
    expect(host().terms.value).toBe(false);
  });

  it('uses trueValue and falseValue with ngModel', async () => {
    await click('values');
    expect(host().answer).toBe('yes');
    await click('values');
    expect(host().answer).toBe('no');
  });

  it('adds and removes its value in an array', async () => {
    await click('array');
    expect(host().letters.value).toEqual(['a', 'b']);
    await click('array');
    expect(host().letters.value).toEqual(['a']);
  });

  it('shows the mixed state and clears it on click', async () => {
    expect(input('mixed').indeterminate).toBe(true);
    expect(el('#mixed').classList).toContain('tx-checkbox--indeterminate');
    await click('mixed');
    expect(host().mixed).toBe(false);
    expect(input('mixed').checked).toBe(true);
  });

  it('ignores clicks when readonly', async () => {
    host().readonly.set(true);
    await fixture.whenStable();
    await click('mixed');
    expect(input('mixed').checked).toBe(false);
    expect(input('mixed').getAttribute('aria-readonly')).toBe('true');
  });

  it('marks itself invalid from the form control', async () => {
    host().terms.markAsTouched();
    await fixture.whenStable();
    expect(input('terms').getAttribute('aria-invalid')).toBe('true');
    expect(el('#terms').classList).toContain('tx-checkbox--invalid');
  });

  it('disables from the form control', async () => {
    host().terms.disable();
    await fixture.whenStable();
    expect(input('terms').disabled).toBe(true);
  });

  it('renders the tile, dt, pt and an own icon', async () => {
    expect(el('#array').classList).toContain('tx-checkbox--tile');
    expect(el('#array').style.getPropertyValue('--tx-checkbox-size')).toBe('24px');
    expect(el('#array label').classList).toContain('own-label');
    expect(el('#own-icon .own-icon').textContent).toBe('☆');
    await click('own-icon');
    expect(el('#own-icon .own-icon').textContent).toBe('★');
  });

  it('toggles a tile from anywhere on the card', async () => {
    el('#array').click();
    await fixture.whenStable();
    expect(host().letters.value).toEqual(['a', 'b']);
  });
});

describe('TxCheckboxGroup', () => {
  let fixture: ComponentFixture<Host>;
  const group = () => fixture.nativeElement.querySelector('#group') as HTMLElement;
  const boxes = () => Array.from(group().querySelectorAll('input')) as HTMLInputElement[];

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('is a named group whose checkboxes follow the array', () => {
    expect(group().getAttribute('role')).toBe('group');
    expect(group().getAttribute('aria-label')).toBe('Permissions');
    const [all, read, write] = boxes();
    expect(all.indeterminate).toBe(true);
    expect(read.checked).toBe(true);
    expect(write.checked).toBe(false);
    expect(group().querySelector('tx-checkbox[value="read"]')?.getAttribute('data-size')).toBe('small');
  });

  it('updates the array from the checkboxes and from select all', async () => {
    const control = fixture.componentInstance.permissions;
    boxes()[2].click();
    await fixture.whenStable();
    expect(control.value).toEqual(['read', 'write']);
    boxes()[0].click();
    await fixture.whenStable();
    expect(control.value).toEqual(['read', 'write', 'delete']);
    expect(boxes()[0].checked).toBe(true);
    expect(boxes()[0].indeterminate).toBe(false);
    boxes()[0].click();
    await fixture.whenStable();
    expect(control.value).toEqual([]);
  });

  it('disables every checkbox with the group', async () => {
    fixture.componentInstance.permissions.disable();
    await fixture.whenStable();
    expect(boxes().every((box) => box.disabled)).toBe(true);
  });
});

@Component({
  imports: [TxCheckbox, TxCheckboxGroup, ReactiveFormsModule],
  template: `
    <tx-checkbox id="classes" label="Classes" icon="own-check" indeterminateIcon="own-dash" [(indeterminate)]="mixed" />
    <tx-checkbox id="empty-array" value="x" label="X" [formControl]="list" />
    <tx-checkbox-group id="plain-group" [formControl]="roles" ariaLabel="Roles">
      <tx-checkbox value="admin" label="Admin" />
      <tx-checkbox value="guest" label="Guest" />
    </tx-checkbox-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainHost {
  readonly list = new FormControl<string[] | null>(null);
  readonly roles = new FormControl<string[] | null>(null);
  mixed = true;
}

describe('TxCheckbox edge cases', () => {
  let fixture: ComponentFixture<PlainHost>;
  const input = (selector: string) => fixture.nativeElement.querySelector(`${selector} input`) as HTMLInputElement;
  const indicator = () => fixture.nativeElement.querySelector('#classes .tx-checkbox__indicator') as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(PlainHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('draws unregistered icon names as classes for the mixed and checked states', async () => {
    expect(indicator().querySelector('span.own-dash')).not.toBeNull();
    input('#classes').click();
    await fixture.whenStable();
    expect(indicator().querySelector('span.own-check')).not.toBeNull();
  });

  it('starts an array from an empty value and focuses its input', async () => {
    input('#empty-array').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.list.value).toEqual(['x']);
    const checkbox = fixture.debugElement.query((node) => node.nativeElement.id === 'empty-array').componentInstance as TxCheckbox;
    checkbox.focus();
    expect(document.activeElement).toBe(input('#empty-array'));
  });

  it('fills an empty group, unchecks a member and is touched when a member loses focus', async () => {
    const boxes = () => Array.from(fixture.nativeElement.querySelectorAll('#plain-group input')) as HTMLInputElement[];
    expect(boxes()).toHaveLength(2);
    expect(boxes().some((box) => box.checked)).toBe(false);
    boxes()[1].click();
    await fixture.whenStable();
    boxes()[0].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.roles.value).toEqual(['guest', 'admin']);
    boxes()[1].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.roles.value).toEqual(['admin']);
    boxes()[0].dispatchEvent(new FocusEvent('blur'));
    expect(fixture.componentInstance.roles.touched).toBe(true);
  });
});

describe('TxCheckbox recompiled by TestBed', () => {
  it('still finds its icon template when a test overrides the component', async () => {
    TestBed.overrideComponent(TxCheckbox, { set: { styles: [] } });
    TestBed.overrideComponent(TxCheckboxGroup, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#own-icon .own-icon').textContent).toBe('☆');
    (fixture.nativeElement.querySelectorAll('#group input')[2] as HTMLInputElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.permissions.value).toEqual(['read', 'write']);
  });
});

describe('checkbox template directive', () => {
  it('narrows its template context', () => {
    expect(TxCheckboxIconTemplate.ngTemplateContextGuard({} as TxCheckboxIconTemplate, { $implicit: true, indeterminate: false })).toBe(true);
    expect(TxCheckboxIconTemplate.ngTemplateContextGuard({} as TxCheckboxIconTemplate, undefined)).toBe(false);
  });
});
