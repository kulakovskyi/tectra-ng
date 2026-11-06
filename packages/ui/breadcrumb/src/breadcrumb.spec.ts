import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TxBreadcrumb } from './breadcrumb.component';
import { TxBreadcrumbItemTemplate, TxBreadcrumbSeparatorTemplate } from './breadcrumb.templates';
import { TxBreadcrumbItem, TxBreadcrumbItemEvent, TxBreadcrumbSeparator } from './breadcrumb.types';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class Page {}

@Component({
  imports: [TxBreadcrumb],
  template: `
    <tx-breadcrumb
      id="crumbs"
      [home]="home"
      [model]="items()"
      [separator]="separator()"
      [dt]="{ item: { gap: '4px' } }"
      [pt]="{ label: { class: 'own-label' } }"
      (itemClick)="clicked.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly separator = signal<TxBreadcrumbSeparator>('chevron');
  readonly clicks: string[] = [];
  readonly clicked: TxBreadcrumbItemEvent[] = [];
  readonly home: TxBreadcrumbItem = { icon: 'home', routerLink: '/', ariaLabel: 'Home' };
  readonly items = signal<TxBreadcrumbItem[]>([
    { label: 'Projects', routerLink: ['/projects'], queryParams: { page: 2 } },
    { label: 'Docs', url: 'https://example.com/docs', target: '_blank' },
    { label: 'Archive', disabled: true, routerLink: '/archive' },
    { label: 'Filter', command: (event) => this.clicks.push(event.item.label ?? '') },
    { label: 'Website', routerLink: '/website' },
  ]);
}

@Component({
  imports: [TxBreadcrumb, TxBreadcrumbItemTemplate, TxBreadcrumbSeparatorTemplate],
  template: `
    <tx-breadcrumb id="own" [model]="items" unstyled ariaLabel="Path">
      <ng-template txBreadcrumbItem let-item let-current="current">
        <b class="own-item">{{ item.label }}{{ current ? '!' : '' }}</b>
      </ng-template>
      <ng-template txBreadcrumbSeparator><i class="own-separator">»</i></ng-template>
    </tx-breadcrumb>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TemplateHost {
  readonly items: TxBreadcrumbItem[] = [{ label: 'Team', url: '/team' }, { label: 'Members' }];
}

describe('TxBreadcrumb', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', component: Page }])] });
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('is a labelled nav with an ordered list, home first and the last item as the current page', () => {
    const nav = el('#crumbs nav');
    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb');
    const items = all('#crumbs ol > li');
    expect(items).toHaveLength(6);
    expect(items[0].querySelector('a')?.getAttribute('aria-label')).toBe('Home');
    expect(items[0].querySelector('tx-icon')?.getAttribute('data-icon')).toBe('home');
    const current = items[5].querySelector('.tx-breadcrumb__link') as HTMLElement;
    expect(current.tagName).toBe('SPAN');
    expect(current.getAttribute('aria-current')).toBe('page');
    expect(items[5].classList).toContain('tx-breadcrumb__item--current');
  });

  it('draws hidden separators between items', async () => {
    const separators = all('#crumbs .tx-breadcrumb__separator');
    expect(separators).toHaveLength(5);
    expect(separators.every((separator) => separator.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(separators[0].querySelector('tx-icon')?.getAttribute('data-icon')).toBe('chevron-right');
    fixture.componentInstance.separator.set('slash');
    await fixture.whenStable();
    expect(el('#crumbs').getAttribute('data-separator')).toBe('slash');
    expect(el('#crumbs .tx-breadcrumb__separator').textContent?.trim()).toBe('/');
  });

  it('renders router links, urls, commands and disabled items', async () => {
    const items = all('#crumbs ol > li');
    const router = items[1].querySelector('a') as HTMLAnchorElement;
    expect(router.getAttribute('href')).toBe('/projects?page=2');
    const url = items[2].querySelector('a') as HTMLAnchorElement;
    expect(url.getAttribute('href')).toBe('https://example.com/docs');
    expect(url.getAttribute('target')).toBe('_blank');
    expect(url.getAttribute('rel')).toBe('noopener noreferrer');
    const disabled = items[3].querySelector('.tx-breadcrumb__link') as HTMLElement;
    expect(disabled.tagName).toBe('SPAN');
    expect(disabled.getAttribute('aria-disabled')).toBe('true');
    const command = items[4].querySelector('button') as HTMLButtonElement;
    command.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.clicks).toEqual(['Filter']);
    expect(fixture.componentInstance.clicked.map((event) => event.item.label)).toEqual(['Filter']);
  });

  it('applies dt and pt', () => {
    expect(el('#crumbs').style.getPropertyValue('--tx-breadcrumb-item-gap')).toBe('4px');
    expect(el('#crumbs').hasAttribute('data-styled')).toBe(true);
    expect(all('#crumbs .tx-breadcrumb__label.own-label')).toHaveLength(5);
  });

  it('uses own item and separator templates and drops the styles when unstyled', async () => {
    const own = TestBed.createComponent(TemplateHost);
    own.autoDetectChanges();
    await own.whenStable();
    const root = own.nativeElement.querySelector('#own') as HTMLElement;
    expect(root.hasAttribute('data-styled')).toBe(false);
    expect(root.querySelector('nav')?.getAttribute('aria-label')).toBe('Path');
    expect(Array.from(root.querySelectorAll('.own-item')).map((item) => item.textContent)).toEqual(['Team', 'Members!']);
    expect(root.querySelector('a')?.getAttribute('href')).toBe('/team');
    expect(root.querySelectorAll('.own-separator')).toHaveLength(1);
  });
});
