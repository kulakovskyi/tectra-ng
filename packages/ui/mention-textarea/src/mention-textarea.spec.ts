import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { caretPoint } from './caret';
import { TxMentionTextarea } from './mention-textarea.component';
import { TxMentionItem } from './mention-textarea.types';

@Component({
  imports: [TxMentionTextarea, ReactiveFormsModule],
  template: `<tx-mention-textarea
    [formControl]="control"
    [suggestions]="people"
    [ariaLabel]="'Comment'"
    (mentionsChange)="mentions = $event"
    (filtered)="queries.push($event.query)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly people: TxMentionItem[] = [
    { label: 'Olena', value: 'u1', description: 'Design' },
    { label: 'Oleh', value: 'u2' },
    { label: 'Taras', value: 'u3' },
  ];
  control = new FormControl<string | null>('');
  mentions: string[] = [];
  queries: string[] = [];
}

describe('TxMentionTextarea', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const textarea = () => fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
  const options = () => Array.from(document.querySelectorAll('.tx-select__option[role="option"]')) as HTMLElement[];
  const render = () => fixture.detectChanges();
  const type = (text: string) => {
    textarea().value = text;
    textarea().setSelectionRange(text.length, text.length);
    textarea().dispatchEvent(new Event('input'));
    render();
  };
  const key = (name: string) => {
    textarea().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
    render();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    render();
  });

  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('suggests people after the trigger and inserts the chosen one', () => {
    type('Hi @ole');
    expect(options().map((option) => option.querySelector('.tx-mention-textarea__label')?.textContent)).toEqual(['Olena', 'Oleh']);
    expect(textarea().getAttribute('aria-activedescendant')).toBe(options()[0].id);
    key('ArrowDown');
    key('Enter');
    expect(host.control.value).toBe('Hi @Oleh ');
    expect(options()).toHaveLength(0);
    expect(host.mentions).toEqual(['u2']);
    expect(host.queries).toEqual(['ole']);
  });

  it('ignores the trigger inside a word and closes on Escape', () => {
    type('mail@ol');
    expect(options()).toHaveLength(0);
    type('@t');
    expect(options()).toHaveLength(1);
    key('Escape');
    expect(options()).toHaveLength(0);
  });

  it('picks with a click and reports mentions removed from the text', () => {
    type('@');
    options()[2].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    render();
    expect(host.control.value).toBe('@Taras ');
    expect(host.mentions).toEqual(['u3']);
    type('');
    expect(host.mentions).toEqual([]);
  });

  it('closes when the caret moves away from the mention and is touched on blur', () => {
    textarea().dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }));
    type('Hi @ol');
    textarea().dispatchEvent(new MouseEvent('click'));
    render();
    expect(options()).toHaveLength(2);
    textarea().setSelectionRange(2, 2);
    textarea().dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }));
    render();
    expect(options()).toHaveLength(0);
    type('Hi @ol');
    textarea().dispatchEvent(new FocusEvent('blur'));
    render();
    expect(options()).toHaveLength(0);
    expect(host.control.touched).toBe(true);
  });

  it('keeps the text focused when the panel is pressed and ignores other keys', () => {
    key('ArrowDown');
    type('@ta');
    const panel = document.querySelector('.tx-mention-textarea__panel') as HTMLElement;
    const press = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    panel.dispatchEvent(press);
    expect(press.defaultPrevented).toBe(true);
    key('a');
    expect(options()).toHaveLength(1);
    key('Tab');
    expect(host.control.value).toBe('@Taras ');
  });

  it('shows an empty value for a null control value', () => {
    host.control.setValue(null);
    render();
    expect(textarea().value).toBe('');
  });

  it('remembers a mention once even when it is picked twice', () => {
    type('@ta');
    key('Enter');
    type(`${textarea().value}@ta`);
    key('Enter');
    expect(host.control.value).toBe('@Taras @Taras ');
    expect(host.mentions).toEqual(['u3']);
  });
});

@Component({
  imports: [TxMentionTextarea],
  template: `<div class="scroller" style="overflow: auto">
    <tx-mention-textarea [suggestions]="people()" [localSearch]="localSearch()" [loading]="loading()" (filtered)="queries.push($event.query)" />
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class RemoteHost {
  readonly people = signal<TxMentionItem[]>([]);
  readonly localSearch = signal(false);
  readonly loading = signal(true);
  queries: string[] = [];
}

describe('TxMentionTextarea with remote suggestions', () => {
  let fixture: ComponentFixture<RemoteHost>;
  const textarea = () => fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
  const panel = () => document.querySelector('.tx-mention-textarea__panel');
  const type = (text: string) => {
    textarea().value = text;
    textarea().setSelectionRange(text.length, text.length);
    textarea().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoteHost);
    fixture.detectChanges();
  });

  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('opens a loading panel, keeps the server results unfiltered and closes when its container scrolls', () => {
    type('@zz');
    expect(panel()).not.toBeNull();
    expect(textarea().getAttribute('aria-activedescendant')).toBeNull();
    textarea().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.componentInstance.people.set([{ label: 'Olena', value: 'u1' }]);
    fixture.componentInstance.loading.set(false);
    fixture.detectChanges();
    expect(document.querySelectorAll('.tx-select__option[role="option"]')).toHaveLength(1);
    expect(fixture.componentInstance.queries).toEqual(['zz']);
    document.dispatchEvent(new Event('scroll'));
    expect(panel()).not.toBeNull();
    fixture.nativeElement.querySelector('.scroller').dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });
});

describe('TxMentionTextarea recompiled by TestBed', () => {
  it('still reads its textarea when a test overrides the component', () => {
    TestBed.overrideComponent(TxMentionTextarea, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'Hello';
    textarea.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.control.value).toBe('Hello');
  });
});

describe('caretPoint', () => {
  it('measures a caret at the end of the text and cleans up its mirror', () => {
    const textarea = document.createElement('textarea');
    textarea.style.lineHeight = '20px';
    textarea.value = 'Hello';
    document.body.appendChild(textarea);
    const children = document.body.childElementCount;
    expect(caretPoint(textarea, 5)).toEqual({ top: 0, left: 0, height: 20 });
    expect(document.body.childElementCount).toBe(children);
    textarea.remove();
  });
});

