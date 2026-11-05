import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Type, effect, input, signal } from '@angular/core';
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

  component = signal<Type<unknown> | null>(null);
  isCodeVisible = signal(false);

  constructor() {
    effect(() => {
      const example = this.example();
      this.component.set(null);
      example.load().then((component) => this.component.set(component));
    });
  }

  toggleCode(): void {
    this.isCodeVisible.update((visible) => !visible);
  }
}
