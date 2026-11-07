import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxToolbar, TxToolbarCenter, TxToolbarEnd, TxToolbarStart } from './toolbar.component';

@Component({
  imports: [TxToolbar, TxToolbarStart, TxToolbarCenter, TxToolbarEnd],
  template: `
    <tx-toolbar
      ariaLabel="Editor"
      [dt]="{ root: { padding: '4px' } }"
      [pt]="{ start: { class: 'own-start' }, end: { style: { color: 'red' } } }"
    >
      <button txToolbarStart type="button" class="new">New</button>
      <button txToolbarStart type="button" class="open">Open</button>
      <span txToolbarCenter class="title">Draft</span>
      <button txToolbarEnd type="button" class="save">Save</button>
    </tx-toolbar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {}

@Component({
  imports: [TxToolbar, TxToolbarEnd],
  template: `
    <h2 id="toolbar-title">Filters</h2>
    <tx-toolbar ariaLabelledBy="toolbar-title" orientation="vertical" unstyled>
      <span class="free">Free</span>
      <button txToolbarEnd type="button">Apply</button>
    </tx-toolbar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainHost {}

describe('TxToolbar', () => {
  it('puts the content into the start, center and end groups', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const toolbar = fixture.nativeElement.querySelector('tx-toolbar') as HTMLElement;
    expect(toolbar.getAttribute('role')).toBe('toolbar');
    expect(toolbar.getAttribute('aria-label')).toBe('Editor');
    expect(toolbar.getAttribute('aria-orientation')).toBe('horizontal');
    expect(toolbar.hasAttribute('data-styled')).toBe(true);
    expect(toolbar.style.getPropertyValue('--tx-toolbar-padding')).toBe('4px');
    const start = toolbar.querySelector('.tx-toolbar__start') as HTMLElement;
    expect(Array.from(start.children).map((child) => child.className)).toEqual(['new', 'open']);
    expect(start.classList).toContain('own-start');
    expect(toolbar.querySelector('.tx-toolbar__center .title')).not.toBeNull();
    const end = toolbar.querySelector('.tx-toolbar__end') as HTMLElement;
    expect(end.querySelector('.save')).not.toBeNull();
    expect(end.style.color).toBe('red');
  });

  it('renders only the used groups, free content and the labelled-by name', async () => {
    const fixture = TestBed.createComponent(PlainHost);
    await fixture.whenStable();
    const toolbar = fixture.nativeElement.querySelector('tx-toolbar') as HTMLElement;
    expect(toolbar.hasAttribute('data-styled')).toBe(false);
    expect(toolbar.getAttribute('aria-labelledby')).toBe('toolbar-title');
    expect(toolbar.getAttribute('aria-orientation')).toBe('vertical');
    expect(toolbar.querySelector('.tx-toolbar__start')).toBeNull();
    expect(toolbar.querySelector('.tx-toolbar__center')).toBeNull();
    expect(toolbar.querySelector('.tx-toolbar__end')).not.toBeNull();
    expect(toolbar.firstElementChild?.className).toBe('free');
  });
});
