import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTxTooltip } from '@tectra-ng/ui/tooltip';
import { TxTruncateText } from './truncate-text.component';

@Component({
  imports: [TxTruncateText],
  template: `
    <tx-truncate-text id="short" text="Short name" />
    <tx-truncate-text id="long" [text]="long()" [limit]="10" [highlight]="search()" copyable (copied)="copied = $event" [dt]="{ root: { gap: '4px' } }" [pt]="{ text: { class: 'own-text' } }" />
    <tx-truncate-text id="href" text="https://example.com/a/very/long/path" [limit]="12" href="https://example.com/a/very/long/path" ellipsis="…" />
    <tx-truncate-text id="open" text="https://example.org/docs" openLink />
    <tx-truncate-text id="same-tab" text="Inbox" href="/inbox" target="_self" />
    <tx-truncate-text id="number" [text]="12345678901234567890" [limit]="5" unstyled />
    <tx-truncate-text id="empty" [text]="null" copyable />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly long = signal('Quarterly marketing report 2026');
  readonly search = signal('');
  copied = '';
}

describe('TxTruncateText', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const settle = async () => {
    await fixture.whenStable();
    await Promise.resolve();
    fixture.detectChanges();
  };
  const tooltip = () => document.querySelector('.tx-tooltip') as HTMLElement | null;
  const visible = (selector: string) => el(`${selector} .tx-truncate-text__text [aria-hidden="true"]`)?.textContent?.trim() ?? el(`${selector} .tx-truncate-text__text`).textContent?.trim();

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTxTooltip({ showDelay: 0, hideDelay: 0 })] });
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('shows short text as it is, without a tooltip or focus stop', async () => {
    expect(visible('#short')).toBe('Short name');
    expect(el('#short .tx-truncate-text__text').hasAttribute('tabindex')).toBe(false);
    expect(el('#short').classList).not.toContain('tx-truncate-text--truncated');
    el('#short .tx-truncate-text__text').dispatchEvent(new Event('mouseenter'));
    await settle();
    expect(tooltip()).toBeNull();
  });

  it('cuts long text at the limit and shows the full text in a tooltip and to screen readers', async () => {
    const text = el('#long .tx-truncate-text__text');
    expect(visible('#long')).toBe('Quarterly ...');
    expect(el('#long .tx-truncate-text__full').textContent).toBe('Quarterly marketing report 2026');
    expect(text.getAttribute('tabindex')).toBe('0');
    expect(text.hasAttribute('aria-describedby')).toBe(false);
    expect(text.classList).toContain('own-text');
    expect(el('#long').style.getPropertyValue('--tx-truncate-text-gap')).toBe('4px');
    text.dispatchEvent(new Event('mouseenter'));
    await settle();
    expect(tooltip()?.textContent?.trim()).toBe('Quarterly marketing report 2026');
    text.dispatchEvent(new Event('mouseleave'));
    await settle();
  });

  it('marks search matches in the shown text', async () => {
    fixture.componentInstance.search.set('quarter');
    await settle();
    expect(el('#long mark')?.textContent).toBe('Quarter');
  });

  it('copies the full text from the copy button', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const button = el('#long .tx-truncate-text__copy') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Copy');
    expect(button.querySelector('tx-icon')?.getAttribute('data-icon')).toBe('clone');
    button.click();
    await settle();
    expect(writeText).toHaveBeenCalledWith('Quarterly marketing report 2026');
    expect(fixture.componentInstance.copied).toBe('Quarterly marketing report 2026');
    expect(button.getAttribute('aria-label')).toBe('Copied');
    expect(button.classList).toContain('tx-truncate-text__copy--done');
    expect(el('#empty .tx-truncate-text__copy')).toBeNull();
  });

  it('becomes a link that opens a new tab, named by the full text', () => {
    const link = el('#href a');
    expect(link.getAttribute('href')).toBe('https://example.com/a/very/long/path');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.hasAttribute('aria-label')).toBe(false);
    expect(link.querySelector('.tx-truncate-text__full')?.textContent).toBe('https://example.com/a/very/long/path');
    expect(link.hasAttribute('aria-describedby')).toBe(false);
    expect(visible('#href')).toBe('https://exam…');
    const open = el('#open a');
    expect(open.getAttribute('href')).toBe('https://example.org/docs');
    expect(open.hasAttribute('aria-label')).toBe(false);
    expect(visible('#open')).toBe('https://example...');
  });

  it('takes numbers and drops its styles when unstyled', () => {
    expect(visible('#number')).toBe('12345...');
    expect(el('#number').hasAttribute('data-styled')).toBe(false);
    expect(el('#long').hasAttribute('data-styled')).toBe(true);
  });

  it('keeps a same-tab link without a rel', () => {
    expect(el('#same-tab a').getAttribute('target')).toBe('_self');
    expect(el('#same-tab a').hasAttribute('rel')).toBe(false);
  });

  it('restarts the check when copied again and resets it after a while', () => {
    vi.useFakeTimers();
    Object.assign(navigator, { clipboard: undefined });
    const button = el('#long .tx-truncate-text__copy') as HTMLButtonElement;
    button.click();
    vi.advanceTimersByTime(1000);
    button.click();
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(button.getAttribute('aria-label')).toBe('Copied');
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(button.getAttribute('aria-label')).toBe('Copy');
    vi.useRealTimers();
  });
});

