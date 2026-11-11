import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxChip } from '@tectra-ng/ui/chip';
import { pickRandom, pickRandomN } from '@tectra-ng/utils/random';

const TIPS = [
  'Press / to search anywhere.',
  'Drag a column header to reorder it.',
  'Ctrl+K opens the command palette.',
  'Star a page to pin it to the sidebar.',
];
const TEAM = ['Ann', 'Mark', 'Olena', 'Zoë', 'Taras', 'Ivy'];

@Component({
  selector: 'random-basic-example',
  imports: [TxButton, TxChip],
  template: `
    <div class="stack wide">
      <div class="flex">
        <button
          txButton
          label="Another tip"
          severity="secondary"
          (click)="tip.set(pickRandom(tips) ?? tip())"
        ></button>
        <span class="hint">{{ tip() }}</span>
      </div>
      <div class="flex">
        <button
          txButton
          label="Pick 3 reviewers"
          severity="secondary"
          (click)="reviewers.set(pickRandomN(team, 3))"
        ></button>
        @for (person of reviewers(); track person) {
          <tx-chip [label]="person" />
        }
      </div>
    </div>
  `,
  styles: `
    .wide {
      max-width: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RandomBasicExample {
  readonly tips = TIPS;
  readonly team = TEAM;
  readonly pickRandom = pickRandom;
  readonly pickRandomN = pickRandomN;
  readonly tip = signal(TIPS[0]);
  readonly reviewers = signal<string[]>([]);
}
