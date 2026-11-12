import { DOCUMENT, NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Type, computed, inject, input, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TxButton } from '@tectra-ng/ui/button';
import { DocsCopyButton } from '../copy/copy-button';
import { DocExample } from '../../types/doc-component.interface';
import { jumpToAnchor, routePath } from '../../page-scroll';
import { DocsStackblitz } from '../stackblitz/stackblitz';

@Component({
  selector: 'docs-example-frame',
  imports: [NgComponentOutlet, TxButton, DocsCopyButton],
  templateUrl: './example-frame.html',
  styleUrl: './example-frame.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleFrame {
  example = input.required<DocExample>();
  component = input<Type<unknown> | null>(null);
  page = input('');

  isCodeVisible = signal(false);
  activeFileIndex = signal(0);
  isTemplateExpanded = signal(false);
  activeFile = computed(() => this.example().files[this.activeFileIndex()]);
  lineCount = computed(() => this.activeFile().source.split('\n').length);

  private readonly document = inject(DOCUMENT);
  private readonly stackblitz = inject(DocsStackblitz);
  private readonly path = routePath(inject(ActivatedRoute));
  readonly anchorHref = computed(() => `${this.path}#${this.example().id}`);

  jump(event: MouseEvent): void {
    jumpToAnchor(event, this.document, this.anchorHref(), this.example().id);
  }

  openInStackblitz(): void {
    const { id, title, files } = this.example();
    const source = files.find((file) => file.label === 'TypeScript')?.source ?? files[0].source;
    void this.stackblitz.open({ id, title, page: this.page(), source });
  }

  toggleCode(): void {
    this.isCodeVisible.update((visible) => !visible);
  }

  moveTab(event: KeyboardEvent): void {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) {
      return;
    }
    event.preventDefault();
    const count = this.example().files.length;
    this.activeFileIndex.update((index) => (index + step + count) % count);
    const tabs = (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLElement>('[role="tab"]');
    tabs?.[this.activeFileIndex()].focus();
  }
}
