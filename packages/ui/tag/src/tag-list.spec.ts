import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxTagList } from './tag-list.component';
import { TxTagListItem } from './tag.types';

@Component({
  imports: [TxTagList],
  template: `<tx-tag-list [tags]="tags()" [limit]="limit()" ariaLabel="Topics" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly tags = signal<TxTagListItem[] | null>([{ value: 'One', severity: 'success' }, { value: 'Two' }, { value: 'Three' }, { value: 'Four' }]);
  readonly limit = signal<number | undefined>(2);
}

describe('TxTagList', () => {
  it('shows the first tags and a +N button for the rest', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-tag-list') as HTMLElement;
    const values = () => [...root.querySelectorAll('tx-tag')].map((tag) => tag.textContent?.trim());
    expect(root.getAttribute('role')).toBe('list');
    expect(root.getAttribute('aria-label')).toBe('Topics');
    expect(values()).toEqual(['One', 'Two', '+2']);
    expect(root.querySelector('tx-tag')?.getAttribute('data-severity')).toBe('success');
    expect(root.querySelector('.tx-tag-list__more')?.getAttribute('aria-label')).toBe('2 more');
    fixture.componentInstance.limit.set(undefined);
    await fixture.whenStable();
    expect(values()).toEqual(['One', 'Two', 'Three', 'Four']);
    expect(root.querySelector('.tx-tag-list__more')).toBeNull();
  });

  it('shows the empty text without tags', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.tags.set([]);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-tag-list') as HTMLElement;
    expect(root.querySelector('.tx-tag-list__empty')?.textContent).toBe('-');
    expect(root.classList).toContain('tx-tag-list--empty');
  });

  it('treats missing tags as empty', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.tags.set(null);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-tag-list') as HTMLElement;
    expect(root.querySelectorAll('tx-tag')).toHaveLength(0);
    expect(root.classList).toContain('tx-tag-list--empty');
  });
});

