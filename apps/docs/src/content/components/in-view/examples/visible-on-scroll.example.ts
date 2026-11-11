import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TxMessage } from '@tectra-ng/ui/message';
import { TxVisibleOnScroll } from '@tectra-ng/utils/in-view';

interface Notice {
  id: string;
  text: string;
  read: boolean;
  pinned: boolean;
}

@Component({
  selector: 'in-view-visible-on-scroll-example',
  imports: [TxMessage, TxVisibleOnScroll],
  template: `
    <div class="stack wide">
      <span class="hint">Unread: {{ unread() }}</span>
      <div
        class="list"
        tabindex="0"
        aria-label="Notifications"
        [txVisibleOnScroll]="items()"
        (itemVisible)="read($event)"
      >
        @for (notice of notices(); track notice.id) {
          <tx-message [severity]="notice.read ? 'secondary' : 'info'" [text]="notice.text" />
        }
      </div>
    </div>
  `,
  styles: `
    .wide {
      max-width: 420px;
    }
    .list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      height: 180px;
      overflow: auto;
      padding-right: 4px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InViewVisibleOnScrollExample {
  readonly notices = signal<Notice[]>(
    Array.from({ length: 8 }, (_, index) => ({
      id: `n${index + 1}`,
      text: index === 0 ? 'Pinned: maintenance on Sunday' : `Notification ${index + 1}`,
      read: false,
      pinned: index === 0,
    })),
  );
  readonly items = computed(() =>
    this.notices().map((notice) => ({ id: notice.id, ignore: notice.read || notice.pinned })),
  );
  readonly unread = computed(() => this.notices().filter((notice) => !notice.read).length);

  read(id: string): void {
    this.notices.update((notices) =>
      notices.map((notice) => (notice.id === id ? { ...notice, read: true } : notice)),
    );
  }
}
