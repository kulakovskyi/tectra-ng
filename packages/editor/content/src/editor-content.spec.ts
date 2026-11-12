import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxEditorContent } from './editor-content.component';
import { TxEditorImageClickEvent } from './editor-content.types';

@Component({
  imports: [TxEditorContent],
  template: `
    <tx-editor-content
      [html]="html()"
      [previewImages]="preview()"
      [unstyled]="unstyled()"
      [dt]="{ link: { color: 'red' } }"
      [pt]="{ root: { class: 'own-root' }, body: { class: 'own-body' } }"
      (imageClick)="clicks.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly html = signal<string | null>('<p class="ql-align-center">Hi <img src="https://a.com/x.png" alt="Chart"><script>alert(1)</script></p>');
  readonly preview = signal(true);
  readonly unstyled = signal<boolean | undefined>(undefined);
  readonly clicks: TxEditorImageClickEvent[] = [];
}

describe('TxEditorContent', () => {
  let fixture: ComponentFixture<Host>;
  const el = <T extends HTMLElement = HTMLElement>(selector: string) => fixture.nativeElement.querySelector(selector) as T;
  const image = () => el<HTMLImageElement>('.tx-editor-content__body img');

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
  });

  afterEach(() => fixture.destroy());

  it('renders clean HTML from Quill markup with the prose styles', () => {
    const body = el('.tx-editor-content__body');
    expect(body.innerHTML).toBe('<p style="text-align: center">Hi <img src="https://a.com/x.png" alt="Chart" tabindex="0" role="button"></p>');
    expect(body.classList).toContain('tx-editor-prose');
    expect(body.classList).toContain('own-body');
    const root = el('tx-editor-content');
    expect(root.classList).toContain('tx-editor-content--zoom');
    expect(root.classList).toContain('own-root');
    expect(root.getAttribute('data-styled')).toBe('true');
    expect(root.style.getPropertyValue('--tx-editor-content-link-color')).toBe('red');
  });

  it('opens a preview of a clicked image and closes it', async () => {
    image().click();
    await fixture.whenStable();
    expect(fixture.componentInstance.clicks).toEqual([expect.objectContaining({ src: 'https://a.com/x.png', alt: 'Chart' })]);
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.textContent).toContain('Chart');
    expect(dialog.querySelector<HTMLImageElement>('.tx-editor-content__preview')?.src).toBe('https://a.com/x.png');
    (dialog.querySelector('button[aria-label]') as HTMLButtonElement).click();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 50));
    await fixture.whenStable();
    expect(document.querySelector('.tx-editor-content__preview')).toBeNull();
  });

  it('opens the preview from the keyboard and names images without text', async () => {
    fixture.componentInstance.html.set('<p><img src="https://a.com/y.png"></p>');
    await fixture.whenStable();
    image().dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    el('.tx-editor-content__body').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    el('.tx-editor-content__body').click();
    expect(fixture.componentInstance.clicks).toHaveLength(0);
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    image().dispatchEvent(event);
    await fixture.whenStable();
    expect(event.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.clicks).toHaveLength(1);
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Image preview');
  });

  it('only reports clicks when previews are off and renders nothing for empty content', async () => {
    fixture.componentInstance.preview.set(false);
    fixture.componentInstance.unstyled.set(true);
    await fixture.whenStable();
    expect(image().hasAttribute('tabindex')).toBe(false);
    expect(image().hasAttribute('role')).toBe(false);
    expect(el('.tx-editor-content__body').classList).not.toContain('tx-editor-prose');
    expect(el('tx-editor-content').hasAttribute('data-styled')).toBe(false);
    image().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.clicks).toHaveLength(1);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    fixture.componentInstance.html.set(null);
    await fixture.whenStable();
    expect(el('.tx-editor-content__body').innerHTML).toBe('');
  });
});
