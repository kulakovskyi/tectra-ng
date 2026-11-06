import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'select-loading-example',
  imports: [TxSelect, TxButton],
  template: `
    <div class="stack">
      <tx-select [options]="teams()" [loading]="loading()" [placeholder]="'Team'" />
      <button txButton [variant]="'outlined'" [disabled]="loading()" (click)="reload()">
        Reload teams
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectLoadingExample {
  readonly teams = signal<{ label: string; value: string }[]>([]);
  readonly loading = signal(false);

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.teams.set([]);
    setTimeout(() => {
      this.teams.set([
        { label: 'Design', value: 'design' },
        { label: 'Platform', value: 'platform' },
        { label: 'Support', value: 'support' },
      ]);
      this.loading.set(false);
    }, 1500);
  }
}
