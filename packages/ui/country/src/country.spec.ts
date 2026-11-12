import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { countryEmoji, countryName, isCountryCode } from './countries';
import { TxCountry } from './country.component';
import { TxFlagShape } from './country.types';
import { provideTxFlags, txFlagIcons, txFlagImages } from './flags';

@Component({
  imports: [TxCountry],
  template: `<tx-country [country]="code()" [showName]="showName()" [shape]="shape()" [size]="'large'" [dt]="{ root: { gap: '2px' } }" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly code = signal<string | null>('ua');
  readonly showName = signal(true);
  readonly shape = signal<TxFlagShape>('rectangle');
}

describe('TxCountry', () => {
  const create = () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return fixture;
  };
  const settle = async (fixture: ComponentFixture<Host>) => {
    TestBed.tick();
    await new Promise((done) => setTimeout(done));
    fixture.detectChanges();
  };
  const root = (fixture: ComponentFixture<Host>) => fixture.nativeElement.querySelector('tx-country') as HTMLElement;

  it('shows an emoji flag and the localized name', async () => {
    const fixture = create();
    expect(root(fixture).querySelector('.tx-country__flag--emoji')?.textContent?.trim()).toBe('🇺🇦');
    expect(root(fixture).textContent).toContain('Ukraine');
    expect(root(fixture).style.getPropertyValue('--tx-country-gap')).toBe('2px');
    await TestBed.inject(TxLocaleService).setLocale('ua');
    fixture.detectChanges();
    expect(root(fixture).textContent).toContain('Україна');
  });

  it('is an image named by the country without the name', () => {
    const fixture = create();
    fixture.componentInstance.showName.set(false);
    fixture.detectChanges();
    expect(root(fixture).getAttribute('role')).toBe('img');
    expect(root(fixture).getAttribute('aria-label')).toBe('Ukraine');
  });

  it('shows unknown values as text without a flag', () => {
    const fixture = create();
    fixture.componentInstance.code.set('Worldwide');
    fixture.detectChanges();
    expect(root(fixture).querySelector('.tx-country__flag')).toBeNull();
    expect(root(fixture).textContent?.trim()).toBe('Worldwide');
  });

  it('uses a flag resolver: classes or images', () => {
    TestBed.configureTestingModule({ providers: [provideTxFlags(txFlagIcons)] });
    const fixture = create();
    fixture.componentInstance.shape.set('circle');
    fixture.detectChanges();
    expect(root(fixture).querySelector('.tx-country__flag')?.className).toContain('fi fi-ua fis');
    expect(txFlagImages((code) => `/flags/${code}.svg`)('PL', 'rectangle')).toEqual({ src: '/flags/pl.svg' });
  });

  it('keeps a same-size box while an async flag loads, then shows the image', async () => {
    let resolve: (src: string | null) => void = () => undefined;
    const pending = new Promise<string | null>((done) => (resolve = done));
    TestBed.configureTestingModule({ providers: [provideTxFlags(txFlagImages((code, shape) => (code === 'ua' ? pending : Promise.resolve(`${shape}-${code}`))))] });
    const fixture = create();
    expect(root(fixture).querySelector('.tx-country__flag--loading')).not.toBeNull();
    expect(root(fixture).querySelector('.tx-country__flag--emoji')).toBeNull();
    resolve('data:image/svg+xml,ua');
    await settle(fixture);
    expect(root(fixture).querySelector('img')?.getAttribute('src')).toBe('data:image/svg+xml,ua');
    fixture.componentInstance.code.set('pl');
    fixture.componentInstance.shape.set('circle');
    fixture.detectChanges();
    await settle(fixture);
    expect(root(fixture).querySelector('img')?.getAttribute('src')).toBe('circle-pl');
  });

  it('falls back to the emoji when an async flag is missing', async () => {
    TestBed.configureTestingModule({ providers: [provideTxFlags(txFlagImages(() => Promise.resolve(null)))] });
    const fixture = create();
    await settle(fixture);
    expect(root(fixture).querySelector('.tx-country__flag--emoji')?.textContent?.trim()).toBe('🇺🇦');
  });

  it('has helpers for codes', () => {
    expect(isCountryCode('de')).toBe(true);
    expect(isCountryCode('EUR')).toBe(false);
    expect(countryName('jp', 'en-US')).toBe('Japan');
    expect(countryEmoji('PL')).toBe('🇵🇱');
    expect(countryName('Europe', 'en-US')).toBe('Europe');
    expect(countryEmoji('EUR')).toBe('');
  });

  it('shows nothing for an empty value', () => {
    const fixture = create();
    fixture.componentInstance.code.set(null);
    fixture.detectChanges();
    expect(root(fixture).querySelector('.tx-country__flag')).toBeNull();
    expect(root(fixture).textContent?.trim()).toBe('');
    expect(root(fixture).hasAttribute('role')).toBe(false);
  });

  it('falls back to the emoji when an async flag fails to load', async () => {
    TestBed.configureTestingModule({ providers: [provideTxFlags(txFlagImages(() => Promise.reject(new Error('offline'))))] });
    const fixture = create();
    await settle(fixture);
    expect(root(fixture).querySelector('.tx-country__flag--loading')).toBeNull();
    expect(root(fixture).querySelector('.tx-country__flag--emoji')?.textContent?.trim()).toBe('🇺🇦');
  });
});
