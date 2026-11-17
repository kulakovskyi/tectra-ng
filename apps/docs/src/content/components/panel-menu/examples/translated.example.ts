import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxPanelMenu, TxPanelMenuItem, TxPanelMenuTranslate } from '@tectra-ng/ui/panel-menu';
import { TxSelectButton } from '@tectra-ng/ui/select-button';

const TEXTS: Record<string, Record<string, string>> = {
  en: {
    mail: 'Mail',
    inbox: 'Inbox',
    drafts: 'Drafts',
    archive: 'Archive',
    newest: 'Newest first',
  },
  uk: {
    mail: 'Пошта',
    inbox: 'Вхідні',
    drafts: 'Чернетки',
    archive: 'Архів',
    newest: 'Спершу нові',
  },
};

@Component({
  selector: 'panel-menu-translated-example',
  imports: [TxPanelMenu, TxSelectButton, TxButton],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <tx-panel-menu variant="sidebar" ariaLabel="Mail" [model]="items" [translate]="translate" />
      </aside>
      <div class="controls">
        <tx-select-button
          ariaLabel="Language"
          [options]="languages"
          [allowEmpty]="false"
          [(value)]="language"
        />
        <div class="actions">
          <button txButton size="small" (click)="unread.set(unread() + 1)">New message</button>
          <button txButton size="small" severity="secondary" outlined (click)="unread.set(0)">
            Read all
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .layout {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      align-items: flex-start;
      width: 100%;
    }
    .sidebar {
      flex: 1 1 220px;
      max-width: 256px;
      padding-bottom: 12px;
      border: 1px solid var(--tx-surface-border);
      border-radius: 12px;
      background: var(--tx-surface-card);
    }
    .controls {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PanelMenuTranslatedExample {
  readonly languages = [
    { label: 'English', value: 'en' },
    { label: 'Українська', value: 'uk' },
  ];
  readonly language = signal<unknown>('en');
  readonly unread = signal(3);
  readonly translate: TxPanelMenuTranslate = (key) => TEXTS[String(this.language())]?.[key] ?? key;
  readonly items: TxPanelMenuItem[] = [
    {
      label: 'mail',
      items: [
        { label: 'inbox', icon: 'inbox', title: 'newest', badge: this.unread },
        { label: 'drafts', icon: 'file-edit' },
        { label: 'archive', icon: 'box' },
      ],
    },
  ];
}
