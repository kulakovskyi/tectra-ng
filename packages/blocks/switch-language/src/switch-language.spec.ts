import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { TxSwitchLanguage } from './switch-language.component';
import { TX_ICONS, provideTxIcons } from '@tectra-ng/icons';

@Component({
  imports: [TxSwitchLanguage],
  template: `<tx-switch-language [syncLocale]="sync()" [(value)]="value" [dt]="{ root: { height: '40px' } }" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly sync = signal(true);
  readonly value = signal<string | undefined>(undefined);
}

beforeEach(() => TestBed.configureTestingModule({ providers: [provideTxIcons(TX_ICONS)] }));

describe('TxSwitchLanguage', () => {
  afterEach(() => TestBed.inject(TxLocaleService).setLocale('us'));

  it('follows the current locale and switches it from a click', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-switch-language') as HTMLElement;
    const group = root.querySelector('[role="radiogroup"]') as HTMLElement;
    const options = () => Array.from(root.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
    expect(root.style.getPropertyValue('--tx-switch-language-height')).toBe('40px');
    expect(group.getAttribute('aria-label')).toBe('Language');
    expect(options().map((option) => [option.textContent?.trim(), option.getAttribute('aria-label'), option.getAttribute('aria-checked'), option.getAttribute('tabindex')])).toEqual([
      ['EN', 'English', 'true', '0'],
      ['UA', 'Українська', 'false', '-1'],
    ]);
    expect(group.style.getPropertyValue('--tx-switch-language-index')).toBe('0');

    options()[1].click();
    await fixture.whenStable();
    await vi.waitFor(() => expect(TestBed.inject(TxLocaleService).locale().code).toBe('ua'));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('ua');
    expect(options()[1].getAttribute('aria-checked')).toBe('true');
    expect(group.style.getPropertyValue('--tx-switch-language-index')).toBe('1');
    expect(group.getAttribute('aria-label')).toBe('Мова');
  });

  it('moves with the arrows and keeps the locale when syncLocale is off', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.sync.set(false);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-switch-language') as HTMLElement;
    const options = () => Array.from(root.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
    options()[0].focus();
    options()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('ua');
    expect(document.activeElement).toBe(options()[1]);
    expect(TestBed.inject(TxLocaleService).locale().code).toBe('us');
    options()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('us');
    options()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('ua');
  });

  it('moves back with the left arrow, jumps Home and ignores other keys', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.sync.set(false);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-switch-language') as HTMLElement;
    const options = () => Array.from(root.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
    options()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('ua');
    expect(document.activeElement).toBe(options()[1]);
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    options()[1].dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(false);
    expect(fixture.componentInstance.value()).toBe('ua');
    options()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('us');
    expect(document.activeElement).toBe(options()[0]);
  });
});
