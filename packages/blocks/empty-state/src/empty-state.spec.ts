import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxEmptyState } from './empty-state.component';
import { TxEmptyStateSize, TxEmptyStateTone, TxEmptyStateVariant } from './empty-state.types';

@Component({
  imports: [TxEmptyState],
  template: `
    <tx-empty-state
      icon="bolt"
      [title]="title()"
      [text]="text()"
      [variant]="variant()"
      [size]="size()"
      [tone]="tone()"
      [dt]="{ icon: { size: '50px' } }"
      [pt]="{ title: { class: 'own-title' } }"
    >
      <button type="button" class="create">Create</button>
    </tx-empty-state>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly title = signal<string | undefined>('No workers yet');
  readonly text = signal<string | undefined>('Create the first worker to start.');
  readonly variant = signal<TxEmptyStateVariant>('plain');
  readonly size = signal<TxEmptyStateSize>('normal');
  readonly tone = signal<TxEmptyStateTone>('primary');
}

@Component({
  imports: [TxEmptyState],
  template: `<tx-empty-state title="Nothing here" unstyled />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainHost {}

describe('TxEmptyState', () => {
  it('renders the icon, title, text and actions in a status region', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-empty-state') as HTMLElement;
    expect(root.getAttribute('role')).toBe('status');
    expect(root.hasAttribute('data-styled')).toBe(true);
    expect(root.style.getPropertyValue('--tx-empty-state-icon-size')).toBe('50px');
    expect(root.querySelector('.tx-empty-state__icon')?.getAttribute('aria-hidden')).toBe('true');
    expect(root.querySelector('.tx-empty-state__icon tx-icon')?.getAttribute('data-icon')).toBe('bolt');
    const title = root.querySelector('.tx-empty-state__title') as HTMLElement;
    expect(title.textContent?.trim()).toBe('No workers yet');
    expect(title.classList).toContain('own-title');
    expect(root.querySelector('.tx-empty-state__text')?.textContent?.trim()).toBe('Create the first worker to start.');
    expect(root.querySelector('.create')).not.toBeNull();
  });

  it('reflects variant, size and tone and drops empty lines', async () => {
    const fixture = TestBed.createComponent(Host);
    const host = fixture.componentInstance;
    host.variant.set('framed');
    host.size.set('compact');
    host.tone.set('danger');
    host.title.set(undefined);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-empty-state') as HTMLElement;
    expect(root.getAttribute('data-variant')).toBe('framed');
    expect(root.getAttribute('data-size')).toBe('compact');
    expect(root.getAttribute('data-tone')).toBe('danger');
    expect(root.querySelector('.tx-empty-state__title')).toBeNull();
    expect(root.querySelector('.tx-empty-state__text')).not.toBeNull();
    host.text.set(undefined);
    await fixture.whenStable();
    expect(root.querySelector('.tx-empty-state__body')).toBeNull();
  });

  it('shows the inbox icon by default and drops the styles when unstyled', async () => {
    const fixture = TestBed.createComponent(PlainHost);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-empty-state') as HTMLElement;
    expect(root.hasAttribute('data-styled')).toBe(false);
    expect(root.getAttribute('data-variant')).toBe('plain');
    expect(root.hasAttribute('title')).toBe(false);
    expect(root.querySelector('.tx-empty-state__title')?.textContent?.trim()).toBe('Nothing here');
    expect(root.querySelector('tx-icon')?.getAttribute('data-icon')).toBe('inbox');
  });
});

describe('TxEmptyState title only', () => {
  it('renders the title without a text line', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.text.set(undefined);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-empty-state') as HTMLElement;
    expect(root.querySelector('.tx-empty-state__title')?.textContent?.trim()).toBe('No workers yet');
    expect(root.querySelector('.tx-empty-state__text')).toBeNull();
  });
});
