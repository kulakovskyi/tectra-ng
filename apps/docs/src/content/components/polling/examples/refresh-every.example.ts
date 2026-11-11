import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';
import { refreshEvery } from '@tectra-ng/utils/polling';
import { defer, delay, of } from 'rxjs';

@Component({
  selector: 'polling-refresh-every-example',
  imports: [FormsModule, TxToggleSwitch],
  template: `
    <div class="stack">
      <div class="flex">
        <tx-toggle-switch inputId="polling-live" [(ngModel)]="live" />
        <label for="polling-live">Live updates</label>
      </div>
      <span class="hint"
        >Active users: <strong>{{ users() }}</strong> · refreshed {{ refreshes() }} times</span
      >
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PollingRefreshEveryExample {
  readonly live = signal(true);
  readonly users = signal(128);
  readonly refreshes = signal(0);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      refreshEvery({
        delay: 2000,
        when: () => this.live(),
        request: () =>
          defer(() => of(this.users() + Math.round(Math.random() * 10 - 5)).pipe(delay(300))),
      })
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe((users) => {
          this.users.set(users);
          this.refreshes.update((count) => count + 1);
        });
    });
  }
}
