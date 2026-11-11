import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TxButton } from '@tectra-ng/ui/button';
import { TxInputNumber } from '@tectra-ng/ui/input-number';
import { TxTitle, provideTxTitle } from '@tectra-ng/utils/title';

@Component({
  selector: 'title-prefix-example',
  imports: [FormsModule, TxButton, TxInputNumber],
  providers: [provideTxTitle({ appName: 'tectra' })],
  template: `
    <div class="stack">
      <tx-input-number
        ariaLabel="Unread messages"
        [showButtons]="true"
        [min]="0"
        [(ngModel)]="unread"
      />
      <div class="flex">
        <button txButton label="Show in the tab" (click)="show()"></button>
        <button txButton label="Clear" severity="secondary" (click)="clear()"></button>
      </div>
      <span class="hint">Tab title: {{ current() }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TitlePrefixExample {
  private readonly txTitle = inject(TxTitle);
  private readonly title = inject(Title);

  readonly unread = signal<number | null>(3);
  readonly current = signal('');

  show(): void {
    this.txTitle.setPage('Inbox');
    this.txTitle.setPrefix(this.unread() ? `(${this.unread()})` : '');
    this.current.set(this.title.getTitle());
  }

  clear(): void {
    this.txTitle.setPrefix('');
    this.current.set(this.title.getTitle());
  }
}
