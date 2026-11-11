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

  it('matches files against accept rules', () => {
    expect(acceptsFile(file('a.PNG', ''), '.png')).toBe(true);
    expect(acceptsFile(file('a.webp', 'image/webp'), 'image/*')).toBe(true);
    expect(acceptsFile(file('a.pdf', 'application/pdf'), 'image/*')).toBe(false);
    expect(acceptsFile(file('a.pdf', 'application/pdf'), '')).toBe(true);
  });
});
