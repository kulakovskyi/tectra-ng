import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxFluid } from '@tectra-ng/core/fluid';
import { TX_ICONS, provideTxIcons } from '@tectra-ng/icons';
import { TxSelectButton } from './select-button.component';
import { TxSelectButtonItemTemplate } from './select-button-item.directive';
import { TxSelectButtonChangeEvent } from './select-button.types';

interface Plan {
  name: string;
  code: string;
  icon?: string;
  off?: boolean;
}

const PLANS: Plan[] = [
  { name: 'Free', code: 'free', icon: 'user' },
  { name: 'Team', code: 'team', icon: 'users' },
  { name: 'Legacy', code: 'legacy', icon: 'pi pi-clock', off: true },
  { name: 'Enterprise', code: 'enterprise', icon: 'building' },
];

@Component({
  imports: [TxSelectButton, TxSelectButtonItemTemplate, ReactiveFormsModule, FormsModule, TxFluid],
  template: `
    <tx-select-button
      id="single"
      ariaLabel="Plan"
      optionLabel="name"
      optionValue="code"
      optionDisabled="off"
      [options]="plans"
      [formControl]="plan"
      [allowEmpty]="allowEmpty()"
      [readonly]="readonly()"
      [required]="true"
      size="small"
      [dt]="{ root: { gap: '9px' } }"
      [pt]="{ item: { class: 'own-item' }, root: { style: { margin: '1px' } }, label: { class: 'own-label' } }"
      (changed)="events.push($event)"
      (focused)="focusEvents.push('in')"
      (blurred)="focusEvents.push('out')"
    />
    <tx-select-button
      id="multiple"
      ariaLabelledBy="multiple-label"
      [multiple]="true"
      [options]="days"
      [allowEmpty]="allowEmpty()"
      [(ngModel)]="picked"
    />
    <tx-select-button id="icons" ariaLabel="Align" [iconOnly]="true" [options]="aligns" [(value)]="align" />
    <tx-select-button id="disabled" ariaLabel="Off" [options]="days" [disabled]="disabled()" [invalid]="true" [unstyled]="true" />
    <tx-select-button id="keyed" ariaLabel="Keyed" dataKey="id" [options]="keyedOptions" [value]="keyed" />
    <tx-fluid>
      <tx-select-button id="fluid" ariaLabel="Fluid" [options]="days">
        <ng-template txSelectButtonItem [txSelectButtonItemOf]="days" let-day let-selected="selected" let-index="index">
          <b class="own">{{ day }}-{{ index }}-{{ selected }}</b>
        </ng-template>
      </tx-select-button>
    </tx-fluid>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly plans = PLANS;
  readonly days = ['Mon', 'Tue', 'Wed'];
  readonly aligns = [
    { label: 'Left', value: 'left', icon: 'align-left' },
    { label: 'Center', value: 'center', icon: '' },
  ];
  readonly plan = new FormControl<string | null>('team', Validators.required);
  readonly allowEmpty = signal(true);
  readonly readonly = signal(false);
  readonly disabled = signal(false);
  readonly align = signal<unknown>('left');
  readonly keyedOptions = [
    { label: 'One', value: { id: 1 } },
    { label: 'Two', value: { id: 2 } },
    { value: { id: 3 } },
  ];
  readonly keyed = { id: 2 };
  picked: string[] | null = null;
  readonly events: TxSelectButtonChangeEvent[] = [];
  readonly focusEvents: string[] = [];
  readonly single = viewChild.required(TxSelectButton);
}

describe('TxSelectButton', () => {
  let fixture: ComponentFixture<Host>;
  const root = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
  const items = (id: string) => Array.from(root(id).querySelectorAll<HTMLButtonElement>('.tx-select-button__item'));
  const key = async (target: HTMLElement, name: string) => {
    const event = new KeyboardEvent('keydown', { key: name, cancelable: true, bubbles: true });
    target.dispatchEvent(event);
    await fixture.whenStable();
    return event;
  };
  const settle = () => fixture.whenStable();

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTxIcons(TX_ICONS)] });
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await settle();
  });

  it('renders a labelled radio group with one tab stop on the selected option', () => {
    const host = root('single');
    expect(host.getAttribute('role')).toBe('radiogroup');
    expect(host.getAttribute('aria-label')).toBe('Plan');
    expect(host.getAttribute('aria-required')).toBe('true');
    expect(host.getAttribute('data-size')).toBe('small');
    expect(host.getAttribute('data-styled')).toBe('true');
    expect(host.style.getPropertyValue('--tx-select-button-gap')).toBe('9px');
    expect(host.style.margin).toBe('1px');
    const buttons = items('single');
    expect(buttons.map((button) => button.getAttribute('role'))).toEqual(['radio', 'radio', 'radio', 'radio']);
    expect(buttons.map((button) => button.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false', 'false']);
    expect(buttons.map((button) => button.tabIndex)).toEqual([-1, 0, -1, -1]);
    expect(buttons[2].disabled).toBe(true);
    expect(buttons[1].classList).toContain('tx-select-button__item--selected');
    expect(buttons[2].classList).toContain('tx-select-button__item--disabled');
    expect(buttons[0].classList).toContain('own-item');
    expect(buttons[0].textContent?.trim()).toBe('Free');
    expect(buttons[0].querySelector('tx-icon')).not.toBeNull();
    expect(buttons[2].querySelector('.tx-select-button__icon .pi.pi-clock')).not.toBeNull();
    expect(buttons[0].querySelector('.own-label')).not.toBeNull();
  });

  it('selects with a click, clears the selected option and tells the form', async () => {
    const host = fixture.componentInstance;
    items('single')[0].click();
    await settle();
    expect(host.plan.value).toBe('free');
    expect(host.events.at(-1)).toMatchObject({ value: 'free', option: PLANS[0] });
    items('single')[0].click();
    await settle();
    expect(host.plan.value).toBeNull();
    expect(items('single').map((button) => button.tabIndex)).toEqual([0, -1, -1, -1]);
    host.allowEmpty.set(false);
    items('single')[1].click();
    await settle();
    items('single')[1].click();
    await settle();
    expect(host.plan.value).toBe('team');
    expect(host.events).toHaveLength(3);
  });

  it('moves and selects with the arrow keys, skipping disabled options', async () => {
    const host = fixture.componentInstance;
    const buttons = items('single');
    buttons[1].focus();
    const event = await key(buttons[1], 'ArrowRight');
    expect(event.defaultPrevented).toBe(true);
    expect(host.plan.value).toBe('enterprise');
    expect(document.activeElement).toBe(buttons[3]);
    await key(buttons[3], 'ArrowDown');
    expect(host.plan.value).toBe('free');
    await key(buttons[0], 'ArrowLeft');
    expect(host.plan.value).toBe('enterprise');
    await key(buttons[3], 'Home');
    expect(host.plan.value).toBe('free');
    await key(buttons[0], 'End');
    expect(host.plan.value).toBe('enterprise');
    await key(buttons[3], 'ArrowUp');
    expect(host.plan.value).toBe('team');
    const other = await key(buttons[1], 'a');
    expect(other.defaultPrevented).toBe(false);
    const end = await key(buttons[3], 'End');
    expect(end.defaultPrevented).toBe(true);
  });

  it('keeps the value when readonly but still moves focus', async () => {
    const host = fixture.componentInstance;
    host.readonly.set(true);
    await settle();
    expect(root('single').getAttribute('aria-readonly')).toBe('true');
    expect(root('single').classList).toContain('tx-select-button--readonly');
    items('single')[0].click();
    await key(items('single')[1], 'ArrowRight');
    expect(host.plan.value).toBe('team');
    expect(document.activeElement).toBe(items('single')[3]);
  });

  it('shows the invalid state from the form control and disables with it', async () => {
    const host = fixture.componentInstance;
    host.plan.setValue(null);
    host.plan.markAsTouched();
    await settle();
    expect(root('single').getAttribute('aria-invalid')).toBe('true');
    expect(root('single').classList).toContain('tx-select-button--invalid');
    host.plan.disable();
    await settle();
    expect(root('single').getAttribute('aria-disabled')).toBe('true');
    expect(items('single').every((button) => button.disabled)).toBe(true);
  });

  it('reports focus coming in and leaving, and marks the control touched', async () => {
    const host = fixture.componentInstance;
    const [first, second] = items('single');
    first.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: null }));
    second.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: first }));
    first.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: second }));
    expect(host.focusEvents).toEqual(['in']);
    expect(host.plan.touched).toBe(false);
    second.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }));
    expect(host.focusEvents).toEqual(['in', 'out']);
    expect(host.plan.touched).toBe(true);
  });

  it('focuses the tab stop through focus()', () => {
    fixture.componentInstance.single().focus();
    expect(document.activeElement).toBe(items('single')[1]);
  });

  it('toggles several values as pressed buttons with ngModel', async () => {
    const host = fixture.componentInstance;
    expect(root('multiple').getAttribute('role')).toBe('group');
    expect(root('multiple').getAttribute('aria-labelledby')).toBe('multiple-label');
    expect(root('multiple').hasAttribute('aria-required')).toBe(false);
    expect(root('multiple').classList).toContain('tx-select-button--multiple');
    const buttons = items('multiple');
    expect(buttons.map((button) => button.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'false']);
    expect(buttons[0].hasAttribute('role')).toBe(false);
    buttons[2].click();
    await settle();
    buttons[0].click();
    await settle();
    expect(host.picked).toEqual(['Wed', 'Mon']);
    expect(buttons.map((button) => button.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'true']);
    buttons[2].click();
    await settle();
    expect(host.picked).toEqual(['Mon']);
    host.allowEmpty.set(false);
    await settle();
    buttons[0].click();
    await settle();
    expect(host.picked).toEqual(['Mon']);
  });

  it('moves focus without selecting in multiple mode and keeps the tab stop where focus was', async () => {
    const host = fixture.componentInstance;
    const buttons = items('multiple');
    buttons[0].focus();
    await key(buttons[0], 'ArrowRight');
    expect(document.activeElement).toBe(buttons[1]);
    expect(host.picked).toBeNull();
    expect(buttons.map((button) => button.tabIndex)).toEqual([-1, 0, -1]);
  });

  it('shows icons alone with the label as the accessible name and binds [(value)]', async () => {
    const host = fixture.componentInstance;
    expect(root('icons').classList).toContain('tx-select-button--icon-only');
    const [left, center] = items('icons');
    expect(left.getAttribute('aria-label')).toBe('Left');
    expect(left.querySelector('.tx-select-button__label')).toBeNull();
    expect(center.hasAttribute('aria-label')).toBe(false);
    expect(center.textContent?.trim()).toBe('Center');
    center.click();
    await settle();
    expect(host.align()).toBe('center');
  });

  it('disables every option, keeps behaviour without styles', async () => {
    const host = fixture.componentInstance;
    expect(root('disabled').hasAttribute('data-styled')).toBe(false);
    expect(root('disabled').getAttribute('aria-invalid')).toBe('true');
    host.disabled.set(true);
    await settle();
    expect(items('disabled').every((button) => button.disabled)).toBe(true);
    expect(items('disabled').every((button) => button.tabIndex === -1)).toBe(true);
    expect(root('disabled').classList).toContain('tx-select-button--disabled');
  });

  it('matches object values by dataKey and plain options by themselves', () => {
    expect(items('keyed').map((button) => button.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false']);
    expect(items('keyed')[2].textContent?.trim()).toBe('');
    expect(items('keyed')[0].textContent?.trim()).toBe('One');
    expect(items('multiple')[0].textContent?.trim()).toBe('Mon');
  });

  it('renders the item template and takes the full width inside tx-fluid', () => {
    expect(root('fluid').classList).toContain('tx-select-button--fluid');
    expect(items('fluid').map((button) => button.querySelector('.own')?.textContent)).toEqual(['Mon-0-false', 'Tue-1-false', 'Wed-2-false']);
    expect(items('fluid')[0].querySelector('.tx-select-button__label')).toBeNull();
    expect(TxSelectButtonItemTemplate.ngTemplateContextGuard({} as TxSelectButtonItemTemplate<string>, { $implicit: 'Mon' })).toBe(true);
  });
});
