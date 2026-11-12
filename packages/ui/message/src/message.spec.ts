import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TECTRA_CONFIG } from '@tectra-ng/core/config';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { Tectra } from '@tectra-ng/themes';
import { TxInput } from '@tectra-ng/ui/input';
import { TxFieldError } from './field-error.component';
import { TxFieldHint } from './field-hint.component';
import { TxMessageCloseIconTemplate, TxMessageIconTemplate } from './message-templates.directive';
import { TxMessage } from './message.component';
import { TxMessageSeverity } from './message.types';
import { TX_ICONS, provideTxIcons } from '@tectra-ng/icons';

@Component({
  imports: [TxMessage, TxMessageIconTemplate, TxMessageCloseIconTemplate],
  template: `
    <tx-message
      id="first"
      [severity]="severity()"
      [text]="text()"
      [icon]="icon()"
      [size]="'small'"
      [variant]="'outlined'"
      [closable]="true"
      [life]="life()"
      [dt]="{ root: { gap: '20px' } }"
      [pt]="{ root: { class: 'own-root' }, content: { class: 'own-content' } }"
      (closed)="closedCount = closedCount + 1"
      >Projected</tx-message
    >
    <tx-message id="templated" [unstyled]="true" [closable]="true" (closed)="closedCount = closedCount + 1">
      <ng-template txMessageIcon><b class="own-icon">!</b></ng-template>
      <ng-template txMessageCloseIcon><b class="own-close">x</b></ng-template>
      Body
    </tx-message>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MessageHost {
  readonly severity = signal<TxMessageSeverity>('warn');
  readonly text = signal<string | undefined>('Domain is not verified');
  readonly icon = signal<string | undefined>('pi-exclamation-triangle');
  readonly life = signal<number | undefined>(undefined);
  closedCount = 0;
}

@Component({
  imports: [TxFieldHint, TxFieldError, TxInput, ReactiveFormsModule],
  template: `
    <input txInput id="email" [formControl]="email" />
    <tx-field-hint for="email" [icon]="'info-circle'">We never share it</tx-field-hint>
    <tx-field-error for="email" [control]="email" [successText]="'Looks good'" [messages]="messages()" />
    <tx-field-error id="code-error" [control]="code" [showImmediately]="true" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FieldHost {
  readonly email = new FormControl('', [Validators.required, Validators.email, Validators.minLength(6)]);
  readonly code = new FormControl('', (control) => (control.value === 'taken' ? { duplicate: { message: 'Already taken' } } : { format: true }));
  readonly messages = signal<Record<string, string | ((error: unknown) => string)> | undefined>(undefined);
}

beforeEach(() => TestBed.configureTestingModule({ providers: [provideTxIcons(TX_ICONS)] }));

describe('TxMessage', () => {
  let fixture: ComponentFixture<MessageHost>;
  const message = (id = 'first') => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(MessageHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('renders severity, size, variant, text and an icon with the pi- prefix', () => {
    const host = message();
    expect(host.getAttribute('data-severity')).toBe('warn');
    expect(host.getAttribute('data-size')).toBe('small');
    expect(host.getAttribute('data-variant')).toBe('outlined');
    expect(host.getAttribute('role')).toBe('alert');
    expect(host.querySelector('.tx-message__content')?.textContent?.trim()).toBe('Domain is not verified');
    expect(host.querySelector('.tx-message__icon tx-icon')?.getAttribute('data-icon')).toBe('pi-exclamation-triangle');
    expect(host.querySelector('.tx-message__icon svg path')).not.toBeNull();
  });

  it('shows projected content without text, an icon class, and status for calm severities', async () => {
    fixture.componentInstance.text.set(undefined);
    fixture.componentInstance.icon.set('fa fa-bell');
    fixture.componentInstance.severity.set('info');
    await fixture.whenStable();
    expect(message().querySelector('.tx-message__content')?.textContent?.trim()).toBe('Projected');
    expect(message().querySelector('.tx-message__icon span')?.className).toBe('fa fa-bell');
    expect(message().getAttribute('role')).toBe('status');
  });

  it('has no icon by default', async () => {
    fixture.componentInstance.icon.set(undefined);
    await fixture.whenStable();
    expect(message().querySelector('.tx-message__icon')).toBeNull();
  });

  it('closes with the button after the leave animation', async () => {
    const close = message().querySelector('.tx-message__close') as HTMLButtonElement;
    expect(close.getAttribute('aria-label')).toBe('Close');
    close.click();
    await fixture.whenStable();
    expect(message().classList).toContain('tx-message--closing');
    expect(fixture.componentInstance.closedCount).toBe(0);
    close.click();
    message().dispatchEvent(Object.assign(new Event('animationend'), { animationName: 'tx-message-in' }));
    await fixture.whenStable();
    expect(fixture.componentInstance.closedCount).toBe(0);
    message().dispatchEvent(Object.assign(new Event('animationend'), { animationName: 'tx-message-out' }));
    await fixture.whenStable();
    expect(message().style.display).toBe('none');
    expect(fixture.componentInstance.closedCount).toBe(1);
  });

  it('closes itself after life', async () => {
    vi.useFakeTimers();
    fixture.componentInstance.life.set(3000);
    fixture.detectChanges();
    vi.advanceTimersByTime(2999);
    fixture.detectChanges();
    expect(message().classList).not.toContain('tx-message--closing');
    vi.advanceTimersByTime(1);
    fixture.detectChanges();
    expect(message().classList).toContain('tx-message--closing');
    vi.useRealTimers();
  });

  it('applies dt and pt', () => {
    expect(message().style.getPropertyValue('--tx-message-gap')).toBe('20px');
    expect(message().classList).toContain('own-root');
    expect(message().querySelector('.tx-message__content')?.classList).toContain('own-content');
  });

  it('renders own icon templates and closes at once when unstyled', async () => {
    const host = message('templated');
    expect(host.hasAttribute('data-styled')).toBe(false);
    expect(host.querySelector('.own-icon')).not.toBeNull();
    (host.querySelector('.own-close')?.closest('button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(host.style.display).toBe('none');
    expect(fixture.componentInstance.closedCount).toBe(1);
  });
});

describe('TxFieldHint and TxFieldError', () => {
  let fixture: ComponentFixture<FieldHost>;
  const query = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const errorText = (selector = 'tx-field-error') => query(selector).querySelector('.tx-field-message__text')?.textContent?.trim() ?? null;

  async function setup() {
    fixture = TestBed.createComponent(FieldHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  }

  it('links the hint and the error to the field', async () => {
    await setup();
    const ids = query('#email').getAttribute('aria-describedby')?.split(' ') ?? [];
    expect(ids).toContain(query('tx-field-hint').id);
    expect(ids).toContain(query('tx-field-error').id);
    expect(query('tx-field-hint').textContent).toContain('We never share it');
    expect(query('tx-field-error').getAttribute('aria-live')).toBe('polite');
  });

  it('shows the first error after touch, then the next one, then the success text', async () => {
    await setup();
    const { email } = fixture.componentInstance;
    expect(errorText()).toBeNull();
    email.markAsTouched();
    await fixture.whenStable();
    expect(errorText()).toBe('This field is required');
    email.setValue('ab');
    await fixture.whenStable();
    expect(errorText()).toBe('Enter a valid email');
    email.setValue('a@b.c');
    await fixture.whenStable();
    expect(errorText()).toBe('At least 6 characters');
    email.setValue('ann@site.dev');
    await fixture.whenStable();
    expect(errorText()).toBe('Looks good');
    expect(query('tx-field-error').getAttribute('data-state')).toBe('success');
  });

  it('uses own messages, functions and error.message', async () => {
    await setup();
    fixture.componentInstance.messages.set({ required: 'Email please', minlength: (error) => `Min {requiredLength}, got ${(error as { actualLength: number }).actualLength}` });
    fixture.componentInstance.email.markAsTouched();
    await fixture.whenStable();
    expect(errorText()).toBe('Email please');
    fixture.componentInstance.email.setValue('a@b.c');
    await fixture.whenStable();
    expect(errorText()).toBe('Min 6, got 5');
    expect(errorText('#code-error')).toBe('Invalid value');
    fixture.componentInstance.code.setValue('taken');
    await fixture.whenStable();
    expect(errorText('#code-error')).toBe('Already taken');
  });

  it('takes global messages and the current locale', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: TECTRA_CONFIG, useValue: { preset: Tectra, validationMessages: { format: 'Wrong code' } } }] });
    await setup();
    expect(errorText('#code-error')).toBe('Wrong code');
    await TestBed.inject(TxLocaleService).setLocale('ua');
    fixture.componentInstance.email.markAsTouched();
    await fixture.whenStable();
    expect(errorText()).toBe("Обов'язкове поле");
  });
});

@Component({
  imports: [TxFieldHint, TxFieldError, ReactiveFormsModule],
  template: `
    <tx-field-hint id="own-hint" icon="own-hint-icon">Own icon</tx-field-hint>
    <tx-field-error id="tags-error" [control]="tags" successText="Saved" [messages]="{ required: 'Need {missing}' }" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ListHost {
  readonly tags = new FormControl<string[]>([], Validators.required);
}

describe('TxFieldError with a list value', () => {
  it('keeps unknown placeholders, shows success for an edited list and draws an unknown hint icon as a class', async () => {
    const fixture = TestBed.createComponent(ListHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const text = () => fixture.nativeElement.querySelector('#tags-error .tx-field-message__text')?.textContent?.trim() ?? null;
    expect(fixture.nativeElement.querySelector('#own-hint span.own-hint-icon')).not.toBeNull();
    const { tags } = fixture.componentInstance;
    tags.markAsDirty();
    tags.setValue([]);
    await fixture.whenStable();
    expect(text()).toBe('Need {missing}');
    tags.setValue(['a']);
    await fixture.whenStable();
    expect(tags.touched).toBe(false);
    expect(text()).toBe('Saved');
  });
});

describe('TxMessage recompiled by TestBed', () => {
  it('still finds its icon templates when a test overrides the component', async () => {
    TestBed.overrideComponent(TxMessage, { set: { styles: [] } });
    const fixture = TestBed.createComponent(MessageHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const templated = fixture.nativeElement.querySelector('#templated') as HTMLElement;
    expect(templated.querySelector('.own-icon')).not.toBeNull();
    expect(templated.querySelector('.own-close')).not.toBeNull();
  });
});

