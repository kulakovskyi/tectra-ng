import { InteractivityChecker } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';
import { nextTabbable, tabbableElements } from './tabbable';

describe('tabbable', () => {
  let root: HTMLElement;
  let checker: InteractivityChecker;

  beforeEach(() => {
    root = document.createElement('div');
    root.innerHTML = `
      <button id="before">Before</button>
      <button id="trigger">Trigger</button>
      <div inert><button id="hidden">Hidden</button></div>
      <button id="skipped" tabindex="-1">Skipped</button>
      <div id="panel"><input id="inside" /></div>
      <a id="after" href="#">After</a>
    `;
    document.body.appendChild(root);
    checker = TestBed.inject(InteractivityChecker);
    vi.spyOn(checker, 'isVisible').mockReturnValue(true);
  });

  afterEach(() => root.remove());

  it('lists tabbable elements and leaves out inert and negative tabindex ones', () => {
    expect(tabbableElements(root, checker).map((element) => element.id)).toEqual(['before', 'trigger', 'inside', 'after']);
  });

  it('finds the next tabbable element after another one, skipping a part', () => {
    const trigger = root.querySelector('#trigger') as HTMLElement;
    expect(nextTabbable(trigger, checker)?.id).toBe('inside');
    expect(nextTabbable(trigger, checker, root.querySelector('#panel') as HTMLElement)?.id).toBe('after');
  });
});
