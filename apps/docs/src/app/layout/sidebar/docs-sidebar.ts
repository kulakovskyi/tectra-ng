import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, afterRenderEffect, computed, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TxIcon } from '@tectra-ng/icons';
import { TxHighlightText } from '@tectra-ng/ui/highlight-text';
import { TxIconField, TxInputClear, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';
import { DOC_NAVIGATION } from '../../data/navigation.data';
import { DocNavGroup, DocNavSection } from '../../types/navigation.interface';

const STORAGE_KEY = 'tectra-docs-collapsed-groups';

function fold(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

@Component({
  selector: 'docs-sidebar',
  imports: [RouterLink, TxIcon, TxHighlightText, TxIconField, TxInputIcon, TxInputClear, TxInput],
  templateUrl: './docs-sidebar.html',
  styleUrl: './docs-sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
})
export class DocsSidebar {
  private document = inject(DOCUMENT);

  readonly currentUrl = input.required<string>();
  readonly navigate = output<void>();

  readonly search = viewChild.required<ElementRef<HTMLInputElement>>('search');
  readonly results = viewChild.required<ElementRef<HTMLElement>>('results');
  readonly query = signal('');
  readonly collapsed = signal<ReadonlySet<string>>(this.readCollapsed());

  readonly sections = computed<DocNavSection[]>(() => {
    const query = fold(this.query().trim());
    if (!query) {
      return DOC_NAVIGATION;
    }
    return DOC_NAVIGATION.map((section) => ({
      ...section,
      groups: section.groups
        .map((group) => ({ ...group, links: group.links.filter((link) => fold(link.label).includes(query)) }))
        .filter((group) => group.links.length),
    })).filter((section) => section.groups.length);
  });
  readonly matchCount = computed(() => this.sections().reduce((count, section) => count + this.linkCount(section), 0));
  readonly activePath = computed(() => this.currentUrl().split(/[?#]/)[0]);
  readonly activeGroup = computed(() => DOC_NAVIGATION.flatMap((section) => section.groups).find((group) => group.links.some((link) => link.path === this.activePath()))?.title ?? null);

  constructor() {
    effect(() => {
      const active = this.activeGroup();
      if (active && untracked(this.collapsed).has(active)) {
        this.setCollapsed(active, false);
      }
    });
    afterRenderEffect(() => {
      this.activePath();
      this.revealActiveLink();
    });
  }

  linkCount(section: DocNavSection): number {
    return section.groups.reduce((count, group) => count + group.links.length, 0);
  }

  isOpen(group: DocNavGroup): boolean {
    return !!this.query().trim() || !this.collapsed().has(group.title);
  }

  toggle(group: DocNavGroup): void {
    this.setCollapsed(group.title, this.isOpen(group));
  }

  groupId(group: DocNavGroup): string {
    return `docs-nav-${group.title.toLowerCase().replace(/\s+/g, '-')}`;
  }

  onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.query()) {
      event.stopPropagation();
      (event.target as HTMLInputElement).value = '';
      this.query.set('');
    }
    if (event.key === 'Enter') {
      const first = this.sections()[0]?.groups[0]?.links[0];
      const link = first && this.document.querySelector<HTMLAnchorElement>(`.docs-nav__link[href="${first.path}"]`);
      link?.click();
    }
  }

  onDocumentKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const editable = target?.closest('input, textarea, select, [contenteditable="true"]');
    if (event.key === '/' && !editable && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      this.search().nativeElement.focus();
    }
  }

  private revealActiveLink(): void {
    const scroller = this.results().nativeElement;
    const link = scroller.querySelector<HTMLElement>('.docs-nav__link--active');
    if (!link) {
      return;
    }
    const view = scroller.getBoundingClientRect();
    const box = link.getBoundingClientRect();
    if (box.top < view.top + 16 || box.bottom > view.bottom - 16) {
      scroller.scrollTop += box.top - view.top - view.height / 2 + box.height / 2;
    }
  }

  private setCollapsed(title: string, collapsed: boolean): void {
    const next = new Set(this.collapsed());
    if (collapsed) {
      next.add(title);
    } else {
      next.delete(title);
    }
    this.collapsed.set(next);
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      return;
    }
  }

  private readCollapsed(): ReadonlySet<string> {
    try {
      const saved = JSON.parse(this.document.defaultView?.localStorage.getItem(STORAGE_KEY) ?? '[]');
      return new Set(Array.isArray(saved) ? saved.filter((title): title is string => typeof title === 'string') : []);
    } catch {
      return new Set();
    }
  }
}
