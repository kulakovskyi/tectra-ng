import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Type, computed, input, signal } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { DocExample } from '../../types/doc-component.interface';

@Component({
  selector: 'docs-example-frame',
  imports: [NgComponentOutlet, TxButton],
  templateUrl: './example-frame.html',
  styleUrl: './example-frame.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleFrame {
  example = input.required<DocExample>();
  component = input<Type<unknown> | null>(null);

  isCodeVisible = signal(false);
  isCopied = signal(false);
  activeFileIndex = signal(0);
  isTemplateExpanded = signal(false);
  activeFile = computed(() => this.example().files[this.activeFileIndex()]);
  lineCount = computed(() => this.activeFile().source.split('\n').length);

  toggleCode(): void {
    this.isCodeVisible.update((visible) => !visible);
  }

  copyCode(): void {
    navigator.clipboard?.writeText(this.activeFile().source);
    this.isCopied.set(true);
    setTimeout(() => this.isCopied.set(false), 1600);
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
