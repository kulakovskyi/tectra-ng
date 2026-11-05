import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
});
