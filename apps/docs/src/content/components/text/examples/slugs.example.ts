import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxInput } from '@tectra-ng/ui/input';
import { slugify, transliterate } from '@tectra-ng/utils/text';

@Component({
  selector: 'text-slugs-example',
  imports: [FormsModule, TxInput],
  template: `
    <div class="stack">
      <input txInput aria-label="Heading" [(ngModel)]="heading" />
      <span class="hint">transliterate: {{ latin() }}</span>
      <span class="hint"
        >slugify: <code>/blog/{{ slug() }}</code></span
      >
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TextSlugsExample {
  readonly heading = signal('Новини: Щорічний звіт 2026!');
  readonly latin = computed(() => transliterate(this.heading()));
  readonly slug = computed(() => slugify(this.heading()));
}
