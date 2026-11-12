import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxConfirmService } from '@tectra-ng/ui/confirm';
import { TxAvatarEditor, acceptsFile } from './avatar-editor.component';
import { TxAvatarEditorRejection } from './avatar.types';

@Component({
  imports: [TxAvatarEditor],
  template: `
    <tx-avatar-editor
      name="Olena Kovalenko"
      accept="image/png,.jpg"
      [maxFileSize]="100"
      [image]="image()"
      [loading]="loading()"
      [hint]="hint()"
      (photoChange)="changes.push($event)"
      (rejected)="rejections.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly image = signal<string | null>(null);
  readonly loading = signal(false);
  readonly hint = signal('PNG up to 100 bytes');
  readonly changes: (File | null)[] = [];
  readonly rejections: TxAvatarEditorRejection[] = [];
}


@Component({
  imports: [TxAvatarEditor],
  template: `
    <tx-avatar-editor
      [image]="image()"
      [size]="96"
      [disabled]="disabled()"
      [confirmRemove]="false"
      changeLabel="Replace"
      removeLabel="Drop"
      [pt]="{ root: { style: { color: 'red' } } }"
      (photoChange)="changes.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CustomHost {
  readonly image = signal<string | null>(null);
  readonly disabled = signal(false);
  readonly changes: (File | null)[] = [];
}

function dragEvent(type: string, files: File[] | null, types: string[] = ['Files']): DragEvent {
  const event = new Event(type, { bubbles: true, cancelable: true }) as DragEvent;
  const dataTransfer = files === null ? null : { types, files, dropEffect: 'none' };
  Object.defineProperty(event, 'dataTransfer', { value: dataTransfer });
  return event;
}

function file(name: string, type: string, size = 10): File {
  return new File(['x'.repeat(size)], name, { type });
}

describe('TxAvatarEditor', () => {
  async function setup() {
    const confirm = { dialog: vi.fn().mockResolvedValue(true) };
    TestBed.configureTestingModule({ providers: [{ provide: TxConfirmService, useValue: confirm }] });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-avatar-editor') as HTMLElement;
    const editor = fixture.debugElement.children[0].componentInstance as TxAvatarEditor;
    const input = root.querySelector('input[type="file"]') as HTMLInputElement;
    return { fixture, root, editor, input, confirm, host: fixture.componentInstance };
  }

  function choose(input: HTMLInputElement, chosen: File): void {
    Object.defineProperty(input, 'files', { value: [chosen], configurable: true });
    input.dispatchEvent(new Event('change'));
  }

  it('reports a chosen file and rejects the wrong type or size', async () => {
    const { input, host } = await setup();
    choose(input, file('me.png', 'image/png'));
    choose(input, file('me.gif', 'image/gif'));
    choose(input, file('big.jpg', 'image/jpeg', 500));
    expect(host.changes.map((change) => change?.name)).toEqual(['me.png']);
    expect(host.rejections.map(({ file: rejected, reason }) => `${rejected.name}:${reason}`)).toEqual(['me.gif:type', 'big.jpg:size']);
  });

  it('removes the photo after the confirm', async () => {
    const { fixture, editor, host, confirm } = await setup();
    host.image.set('photo.png');
    await fixture.whenStable();
    await editor.remove();
    expect(confirm.dialog).toHaveBeenCalledWith(expect.objectContaining({ title: 'Delete photo', severity: 'danger' }));
    expect(host.changes).toEqual([null]);
    confirm.dialog.mockResolvedValue(false);
    await editor.remove();
    expect(host.changes).toEqual([null]);
  });

  it('shows the hint and the loader, and blocks the button while loading', async () => {
    const { fixture, root, host } = await setup();
    expect(root.querySelector('.tx-avatar-editor__hint')?.textContent).toBe('PNG up to 100 bytes');
    const button = root.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Upload photo');
    host.image.set('photo.png');
    await fixture.whenStable();
    expect(button.getAttribute('aria-label')).toBe('Photo actions');
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    host.loading.set(true);
    await fixture.whenStable();
    expect(root.querySelector('.tx-avatar-editor__loader')).not.toBeNull();
    expect(root.getAttribute('aria-busy')).toBe('true');
    expect(button.disabled).toBe(true);
  });

  it('sizes the photo, skips the confirm and uses custom labels', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: TxConfirmService, useValue: { dialog: vi.fn() } }] });
    const fixture = TestBed.createComponent(CustomHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-avatar-editor') as HTMLElement;
    const editor = fixture.debugElement.children[0].componentInstance as TxAvatarEditor;
    expect(root.style.getPropertyValue('--tx-avatar-editor-size')).toBe('96px');
    expect(root.style.color).toBe('red');
    expect(root.querySelector('button')?.getAttribute('aria-label')).toBe('Replace');
    await editor.remove();
    expect(fixture.componentInstance.changes).toEqual([]);
    fixture.componentInstance.image.set('photo.png');
    await fixture.whenStable();
    await editor.remove();
    expect(fixture.componentInstance.changes).toEqual([null]);
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    await editor.remove();
    expect(fixture.componentInstance.changes).toEqual([null]);
  });

  it('opens the file picker from the badge without a photo and not while blocked', async () => {
    const { fixture, root, host, input } = await setup();
    const click = vi.spyOn(input, 'click').mockImplementation(() => undefined);
    input.value = '';
    (root.querySelector('button') as HTMLButtonElement).click();
    expect(click).toHaveBeenCalledTimes(1);
    host.loading.set(true);
    await fixture.whenStable();
    const editor = fixture.debugElement.children[0].componentInstance as TxAvatarEditor;
    editor.pick();
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('opens the photo menu with change and remove actions', async () => {
    const { fixture, root, host, input, confirm } = await setup();
    const click = vi.spyOn(input, 'click').mockImplementation(() => undefined);
    host.image.set('photo.png');
    await fixture.whenStable();
    (root.querySelector('button') as HTMLButtonElement).click();
    await fixture.whenStable();
    const items = () => Array.from(document.querySelectorAll<HTMLElement>('.tx-menu__item'));
    expect(items().map((item) => item.textContent?.trim())).toEqual(['Change photo', 'Remove']);
    items()[0].click();
    await fixture.whenStable();
    expect(click).toHaveBeenCalledTimes(1);
    (root.querySelector('button') as HTMLButtonElement).click();
    await fixture.whenStable();
    items()[1].click();
    await fixture.whenStable();
    await Promise.resolve();
    expect(confirm.dialog).toHaveBeenCalled();
    expect(host.changes).toEqual([null]);
    fixture.destroy();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('accepts a dropped file and marks the drop zone while dragging files', async () => {
    const { fixture, root, host } = await setup();
    const zone = root.querySelector('.tx-avatar-editor__photo') as HTMLElement;
    const over = dragEvent('dragover', []);
    zone.dispatchEvent(over);
    await fixture.whenStable();
    expect(over.defaultPrevented).toBe(true);
    expect(over.dataTransfer?.dropEffect).toBe('copy');
    expect(root.classList).toContain('tx-avatar-editor--dragover');
    zone.dispatchEvent(dragEvent('dragleave', []));
    await fixture.whenStable();
    expect(root.classList).not.toContain('tx-avatar-editor--dragover');
    const text = dragEvent('dragover', [], ['text/plain']);
    zone.dispatchEvent(text);
    expect(text.defaultPrevented).toBe(false);
    const none = dragEvent('dragover', null);
    zone.dispatchEvent(none);
    expect(none.defaultPrevented).toBe(false);
    const drop = dragEvent('drop', [file('me.png', 'image/png')]);
    zone.dispatchEvent(drop);
    expect(drop.defaultPrevented).toBe(true);
    expect(host.changes.map((change) => change?.name)).toEqual(['me.png']);
    const empty = dragEvent('drop', null);
    zone.dispatchEvent(empty);
    expect(empty.defaultPrevented).toBe(false);
    host.loading.set(true);
    await fixture.whenStable();
    const blocked = dragEvent('drop', [file('me.png', 'image/png')]);
    zone.dispatchEvent(blocked);
    expect(blocked.defaultPrevented).toBe(false);
    const blockedOver = dragEvent('dragover', []);
    zone.dispatchEvent(blockedOver);
    expect(blockedOver.defaultPrevented).toBe(false);
    expect(host.changes).toHaveLength(1);
  });

  it('ignores a change event without a file', async () => {
    const { input, host } = await setup();
    Object.defineProperty(input, 'files', { value: [], configurable: true });
    input.dispatchEvent(new Event('change'));
    expect(host.changes).toEqual([]);
  });

  it('matches files against accept rules', () => {
    expect(acceptsFile(file('a.PNG', ''), '.png')).toBe(true);
    expect(acceptsFile(file('a.webp', 'image/webp'), 'image/*')).toBe(true);
    expect(acceptsFile(file('a.pdf', 'application/pdf'), 'image/*')).toBe(false);
    expect(acceptsFile(file('a.pdf', 'application/pdf'), '')).toBe(true);
  });
});
