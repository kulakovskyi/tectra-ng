import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { TxButton, TxButtonIconTemplate, TxButtonSize } from '@tectra-ng/ui/button';
import { DocsClipboard } from './clipboard.service';
import { DocsCopyIcon } from './copy-icon';

@Component({
  selector: 'docs-copy-button',
  imports: [TxButton, TxButtonIconTemplate, DocsCopyIcon],
  template: `
    <button
      txButton
      type="button"
      iconOnly
      text
      severity="secondary"
      [size]="size()"
      [class.copy-button--done]="copied()"
      [attr.aria-label]="label()"
      [title]="copied() ? 'Copied' : label()"
      (click)="copy()"
    >
      <ng-template txButtonIcon><docs-copy-icon [copied]="copied()" /></ng-template>
    </button>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .copy-button--done {
      --tx-button-text-secondary-color: var(--docs-copy-done, var(--tx-success-base));
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsCopyButton {
  private readonly clipboard = inject(DocsClipboard);
  private timer?: ReturnType<typeof setTimeout>;

  readonly text = input.required<string>();
  readonly label = input('Copy');
  readonly message = input('Copied to the clipboard');
  readonly size = input<TxButtonSize>('small');

  readonly copied = signal(false);

  copy(): void {
    this.clipboard.copy(this.text(), this.message());
    this.copied.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.copied.set(false), 1600);
  }
}
