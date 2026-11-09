import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxPageHeader } from './page-header.component';
import { TxPageHeaderLevel } from './page-header.types';

@Component({
  imports: [TxPageHeader],
  template: `
    <tx-page-header
      [title]="title()"
      [subtitle]="subtitle()"
      [headingLevel]="level()"
      [dt]="{ title: { fontSize: '20px' } }"
      [pt]="{ actions: { class: 'own-actions' }, subtitle: { style: { color: 'red' } } }"
    >
      <button type="button" class="create">Create</button>
    </tx-page-header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly title = signal('Payments');
  readonly subtitle = signal<string | undefined>('24 payments');
  readonly level = signal<TxPageHeaderLevel>(1);
}

@Component({
  imports: [TxPageHeader],
  template: `<tx-page-header title="Profile" unstyled />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainHost {}

describe('TxPageHeader', () => {
  it('renders the heading, subtitle, actions, tokens and parts', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-page-header') as HTMLElement;
    expect(root.hasAttribute('data-styled')).toBe(true);
    expect(root.style.getPropertyValue('--tx-page-header-title-font-size')).toBe('20px');
    expect(root.querySelector('h1.tx-page-header__title')?.textContent?.trim()).toBe('Payments');
    const subtitle = root.querySelector('.tx-page-header__subtitle') as HTMLElement;
    expect(subtitle.textContent?.trim()).toBe('24 payments');
    expect(subtitle.style.color).toBe('red');
    const actions = root.querySelector('.tx-page-header__actions') as HTMLElement;
    expect(actions.classList).toContain('own-actions');
    expect(actions.querySelector('.create')).not.toBeNull();
  });

  it('changes the heading level and drops an empty subtitle', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.level.set(3);
    fixture.componentInstance.subtitle.set(undefined);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-page-header') as HTMLElement;
    expect(root.querySelector('h1')).toBeNull();
    expect(root.querySelector('h3.tx-page-header__title')?.textContent?.trim()).toBe('Payments');
    expect(root.querySelector('.tx-page-header__subtitle')).toBeNull();
  });

  it('keeps an empty actions area and drops the styles when unstyled', async () => {
    const fixture = TestBed.createComponent(PlainHost);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-page-header') as HTMLElement;
    expect(root.hasAttribute('data-styled')).toBe(false);
    expect(root.querySelector('.tx-page-header__actions')?.children).toHaveLength(0);
  });
});
