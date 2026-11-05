import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Type, input, signal } from '@angular/core';
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

  toggleCode(): void {
    this.isCodeVisible.update((visible) => !visible);
  }

  copyCode(): void {
    navigator.clipboard?.writeText(this.example().source);
    this.isCopied.set(true);
    setTimeout(() => this.isCopied.set(false), 1600);
  }
}
