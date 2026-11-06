import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  TxTree,
  TxTreeFooter,
  TxTreeHeader,
  TxTreeNode,
  TxTreeNodeTemplate,
  TxTreeToggleIcon,
} from '@tectra-ng/ui/tree';
import { TxIcon } from '@tectra-ng/icons';

@Component({
  selector: 'tree-templates-example',
  imports: [TxTree, TxTreeNodeTemplate, TxTreeHeader, TxTreeFooter, TxTreeToggleIcon, TxIcon],
  template: `
    <tx-tree ariaLabel="Links" [value]="links" [expandedKeys]="['guides', 'tools']">
      <ng-template txTreeHeader><strong>Bookmarks</strong></ng-template>
      <ng-template txTreeNode let-node>{{ node.label }}</ng-template>
      <ng-template txTreeNode="link" let-node>
        <a class="link" [href]="node.data" target="_blank" rel="noopener">{{ node.label }}</a>
      </ng-template>
      <ng-template txTreeToggleIcon let-expanded>
        <tx-icon [name]="expanded ? 'minus' : 'plus'" />
      </ng-template>
      <ng-template txTreeFooter
        ><span class="hint">{{ links.length }} groups</span></ng-template
      >
    </tx-tree>
  `,
  styles: `
    tx-tree {
      max-width: 360px;
    }
    .link {
      color: var(--tx-primary-base);
    }
    .hint {
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreeTemplatesExample {
  readonly links: TxTreeNode<string>[] = [
    {
      key: 'guides',
      label: 'Guides',
      icon: 'book',
      children: [
        {
          key: 'angular',
          label: 'Angular',
          type: 'link',
          icon: 'link',
          data: 'https://angular.dev',
        },
        {
          key: 'mdn',
          label: 'MDN',
          type: 'link',
          icon: 'link',
          data: 'https://developer.mozilla.org',
        },
      ],
    },
    {
      key: 'tools',
      label: 'Tools',
      icon: 'wrench',
      children: [
        {
          key: 'wai',
          label: 'WAI-ARIA patterns',
          type: 'link',
          icon: 'link',
          data: 'https://www.w3.org/WAI/ARIA/apg/',
        },
      ],
    },
  ];
}
