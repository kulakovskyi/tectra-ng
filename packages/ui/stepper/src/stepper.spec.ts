import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxStepItem } from './step-item.component';
import { TxStepList } from './step-list.component';
import { TxStepPanel } from './step-panel.component';
import { TxStepPanels } from './step-panels.component';
import { TxStep } from './step.component';
import { TxStepper } from './stepper.component';
import { TxStepContent, TxStepPanelContent, TxStepsItemTemplate } from './stepper.templates';
import { TxSteps } from './steps.component';
import { TxStepValue, TxStepsCommandEvent, TxStepsItem, TxStepsVariant } from './stepper.types';

@Component({
  imports: [TxStepper, TxStepList, TxStep, TxStepPanels, TxStepPanel, TxStepPanelContent],
  template: `
    <tx-stepper
      [(value)]="value"
      [linear]="linear()"
      [dt]="{ stepNumber: { size: '40px' } }"
      [pt]="{ step: { class: 'own-step' }, panel: { style: { color: 'red' } } }"
    >
      <tx-step-list>
        <tx-step [value]="1">Account</tx-step>
        <tx-step [value]="2">Profile</tx-step>
        <tx-step [value]="3" [disabled]="lockLast()">Review</tx-step>
      </tx-step-list>
      <tx-step-panels>
        <tx-step-panel [value]="1">
          <ng-template txStepPanelContent let-activate>
            <p class="content-1">Account form</p>
            <button type="button" class="next-1" (click)="activate(2)">Next</button>
          </ng-template>
        </tx-step-panel>
        <tx-step-panel [value]="2">
          <ng-template txStepPanelContent let-activate let-index="index">
            <p class="content-2">Profile {{ index }}</p>
            <button type="button" class="back-2" (click)="activate(1)">Back</button>
          </ng-template>
        </tx-step-panel>
        <tx-step-panel [value]="3"><p class="content-3">Review</p></tx-step-panel>
      </tx-step-panels>
    </tx-stepper>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StepperHost {
  readonly value = signal<TxStepValue | undefined>(1);
  readonly linear = signal(false);
  readonly lockLast = signal(false);
}

@Component({
  imports: [TxStepper, TxStepItem, TxStep, TxStepPanel, TxStepContent],
  template: `
    <tx-stepper [(value)]="value" unstyled>
      <tx-step-item value="a">
        <tx-step>Header A</tx-step>
        <tx-step-panel><p class="a">Content A</p></tx-step-panel>
      </tx-step-item>
      <tx-step-item value="b">
        <tx-step>
          <ng-template txStepContent let-value let-active="active" let-activate="activate" let-index="index">
            <button type="button" class="own-header" [attr.data-active]="active" (click)="activate(value)">{{ index }}:{{ value }}</button>
          </ng-template>
        </tx-step>
        <tx-step-panel><p class="b">Content B</p></tx-step-panel>
      </tx-step-item>
    </tx-stepper>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class VerticalHost {
  readonly value = signal<TxStepValue | undefined>('a');
}

@Component({
  imports: [TxSteps],
  template: `
    <tx-steps
      ariaLabel="Checkout"
      [items]="items"
      [(activeIndex)]="active"
      [readonly]="readonly()"
      [variant]="variant()"
      [pt]="{ label: { class: 'own-label' } }"
      [dt]="{ track: { markerSize: '40px' } }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StepsHost {
  readonly commands: TxStepsCommandEvent[] = [];
  readonly items: TxStepsItem[] = [
    { label: 'Cart', command: (event) => this.commands.push(event) },
    { label: 'Shipping', description: 'Address and date', icon: 'truck', command: (event) => this.commands.push(event) },
    { label: 'Payment', disabled: true },
    { label: 'Confirm', icon: 'own-icon', command: (event) => this.commands.push(event) },
    { label: 'Review' },
  ];
  readonly active = signal(1);
  readonly readonly = signal(true);
  readonly variant = signal<TxStepsVariant>('default');
}

@Component({
  imports: [TxSteps, TxStepsItemTemplate],
  template: `
    <tx-steps [items]="items" [activeIndex]="1">
      <ng-template txStepsItem let-item let-index="index" let-done="done" let-active="active">
        <b class="own">{{ index }}:{{ item.label }}:{{ done }}:{{ active }}</b>
      </ng-template>
    </tx-steps>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StepsTemplateHost {
  readonly items: TxStepsItem[] = [{ label: 'One' }, { label: 'Two' }];
}

function setup<T>(component: new () => T): ComponentFixture<T> {
  const fixture = TestBed.createComponent(component);
  fixture.autoDetectChanges();
  return fixture;
}

describe('TxStepper', () => {
  let fixture: ComponentFixture<StepperHost>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const headers = () => all('.tx-step__header') as HTMLButtonElement[];

  beforeEach(async () => {
    fixture = setup(StepperHost);
    await fixture.whenStable();
  });

  it('numbers the steps, wires tabs to panels and draws separators between steps', () => {
    expect(el('tx-step-list').getAttribute('role')).toBe('tablist');
    expect(all('.tx-step__number').map((node) => node.textContent?.trim())).toEqual(['1', '2', '3']);
    expect(all('.tx-step__title').map((node) => node.textContent?.trim())).toEqual(['Account', 'Profile', 'Review']);
    expect(all('.tx-stepper__separator')).toHaveLength(2);
    const [first, second] = headers();
    expect(first.getAttribute('role')).toBe('tab');
    expect(first.getAttribute('aria-selected')).toBe('true');
    expect(first.getAttribute('aria-current')).toBe('step');
    expect(second.getAttribute('aria-selected')).toBe('false');
    const panel = document.getElementById(first.getAttribute('aria-controls') ?? '');
    expect(panel?.getAttribute('role')).toBe('tabpanel');
    expect(panel?.getAttribute('aria-labelledby')).toBe(first.id);
    expect(first.tabIndex).toBe(0);
    expect(second.tabIndex).toBe(-1);
  });

  it('shows only the active panel and renders panel templates on the first visit', async () => {
    expect(el('.content-1')).toBeTruthy();
    expect(el('.content-2')).toBeNull();
    expect(all('tx-step-panel')[1].hasAttribute('hidden')).toBe(true);
    el('.next-1').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe(2);
    expect(el('.content-2').textContent).toBe('Profile 1');
    expect(all('tx-step-panel')[0].hasAttribute('hidden')).toBe(true);
    expect(el('.content-1')).toBeTruthy();
    expect(all('tx-step')[0].classList).toContain('tx-step--completed');
  });

  it('activates a step on click unless it is disabled', async () => {
    headers()[2].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe(3);
    fixture.componentInstance.lockLast.set(true);
    fixture.componentInstance.value.set(1);
    await fixture.whenStable();
    expect(headers()[2].disabled).toBe(true);
    expect(all('tx-step')[2].classList).toContain('tx-step--disabled');
  });

  it('moves focus with the arrows, Home and End and skips disabled steps', async () => {
    fixture.componentInstance.lockLast.set(true);
    await fixture.whenStable();
    const [first, second] = headers();
    first.focus();
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(second);
    second.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(first);
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(second);
    second.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).toBe(first);
    expect(fixture.componentInstance.value()).toBe(1);
  });

  it('locks the headers in linear mode so only the panels move on', async () => {
    fixture.componentInstance.linear.set(true);
    await fixture.whenStable();
    expect(headers().map((header) => header.disabled)).toEqual([false, true, true]);
    headers()[1].click();
    expect(fixture.componentInstance.value()).toBe(1);
    el('.next-1').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe(2);
    expect(el('tx-stepper').classList).toContain('tx-stepper--linear');
  });

  it('applies dt, pt and the styled marker', () => {
    const root = el('tx-stepper');
    expect(root.getAttribute('data-styled')).toBe('true');
    expect(root.style.getPropertyValue('--tx-stepper-step-number-size')).toBe('40px');
    expect(all('tx-step')[0].classList).toContain('own-step');
    expect(all('tx-step-panel')[0].style.color).toBe('red');
  });
});

describe('TxStepper vertical', () => {
  let fixture: ComponentFixture<VerticalHost>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];

  beforeEach(async () => {
    fixture = setup(VerticalHost);
    await fixture.whenStable();
  });

  it('lays the items out vertically, inherits the item value and collapses inactive panels', async () => {
    const stepper = el('tx-stepper');
    expect(stepper.classList).toContain('tx-stepper--vertical');
    expect(stepper.hasAttribute('data-styled')).toBe(false);
    const header = el('.tx-step__header');
    expect(header.getAttribute('role')).toBeNull();
    expect(header.getAttribute('aria-expanded')).toBe('true');
    const [first, second] = all('tx-step-panel');
    expect(first.getAttribute('role')).toBe('region');
    expect(first.hasAttribute('inert')).toBe(false);
    expect(second.hasAttribute('inert')).toBe(true);
    expect(all('tx-step-item')[1].classList).toContain('tx-step-item--last');
    expect(el('.own-header').textContent).toBe('1:b');
    el('.own-header').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('b');
    expect(el('.own-header').getAttribute('data-active')).toBe('true');
    expect(all('tx-step-item')[0].classList).toContain('tx-step-item--completed');
    expect(first.hasAttribute('inert')).toBe(true);
  });
});

describe('TxSteps', () => {
  let fixture: ComponentFixture<StepsHost>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];

  beforeEach(async () => {
    fixture = setup(StepsHost);
    await fixture.whenStable();
  });

  it('renders a named list with done, current and disabled steps', () => {
    expect(el('ol').getAttribute('aria-label')).toBe('Checkout');
    const items = all('li');
    expect(items).toHaveLength(5);
    expect(items[0].classList).toContain('tx-steps__item--done');
    expect(items[1].classList).toContain('tx-steps__item--active');
    expect(items[2].classList).toContain('tx-steps__item--disabled');
    expect(items[1].querySelector('.tx-steps__link')?.getAttribute('aria-current')).toBe('step');
    expect(items[0].textContent).toContain('completed');
    expect(all('.tx-steps__number').map((node) => node.textContent?.trim())).toEqual(['1', '2', '3', '4', '5']);
    expect(all('button')).toHaveLength(0);
    expect(el('.tx-steps__label').classList).toContain('own-label');
  });

  it('lets enabled steps with a command be clicked when not readonly', async () => {
    fixture.componentInstance.readonly.set(false);
    await fixture.whenStable();
    const buttons = all('button.tx-steps__link') as HTMLButtonElement[];
    expect(buttons).toHaveLength(3);
    buttons[0].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.active()).toBe(0);
    expect(fixture.componentInstance.commands).toHaveLength(1);
    expect(fixture.componentInstance.commands[0].index).toBe(0);
    expect(fixture.componentInstance.commands[0].item.label).toBe('Cart');
    expect(all('li')[2].querySelector('button')).toBeNull();
    expect(all('li')[4].querySelector('button')).toBeNull();
  });

  it('moves focus between clickable steps with the arrows', async () => {
    fixture.componentInstance.readonly.set(false);
    await fixture.whenStable();
    const buttons = all('button.tx-steps__link') as HTMLButtonElement[];
    buttons[0].focus();
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(buttons[1]);
    buttons[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(buttons[2]);
    buttons[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('shows checks, icons, descriptions and lines in the track variant', async () => {
    fixture.componentInstance.variant.set('track');
    await fixture.whenStable();
    const host = el('tx-steps');
    expect(host.getAttribute('data-variant')).toBe('track');
    expect(host.style.getPropertyValue('--tx-steps-track-marker-size')).toBe('40px');
    const numbers = all('.tx-steps__number');
    expect(numbers[0].querySelector('tx-icon')).toBeTruthy();
    expect(numbers[1].querySelector('tx-icon')).toBeTruthy();
    expect(numbers[2].textContent?.trim()).toBe('3');
    expect(numbers[3].querySelector('.own-icon')).toBeTruthy();
    expect(el('.tx-steps__description').textContent).toBe('Address and date');
    expect(all('.tx-steps__line')).toHaveLength(4);
  });

  it('renders an own item template', async () => {
    const templated = TestBed.createComponent(StepsTemplateHost);
    templated.autoDetectChanges();
    await templated.whenStable();
    const own = Array.from(templated.nativeElement.querySelectorAll('.own')).map((node) => (node as HTMLElement).textContent);
    expect(own).toEqual(['0:One:true:false', '1:Two:false:true']);
  });
});
