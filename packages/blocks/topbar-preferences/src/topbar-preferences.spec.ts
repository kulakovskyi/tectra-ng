import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxThemeMode, TxThemeService } from '@tectra-ng/core/config';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { TxTopbarPreferences } from './topbar-preferences.component';
import { TxTopbarPreferencesLayout } from './topbar-preferences.types';

@Component({
  imports: [TxTopbarPreferences],
  template: `
    <tx-topbar-preferences
      [layout]="layout()"
      [raised]="raised()"
      (languageChange)="languages.push($event)"
      (modeChange)="modes.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly layout = signal<TxTopbarPreferencesLayout>('inline');
  readonly raised = signal(false);
  readonly languages: string[] = [];
  readonly modes: TxThemeMode[] = [];
}

describe('TxTopbarPreferences', () => {
  afterEach(() => {
    TestBed.inject(TxLocaleService).setLocale('us');
    TestBed.inject(TxThemeService).setMode('light');
  });

  it('puts the language switch and the theme button in one capsule', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.raised.set(true);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-topbar-preferences') as HTMLElement;
    const capsule = root.querySelector('.tx-topbar-preferences__capsule') as HTMLElement;
    expect(root.classList).toContain('tx-topbar-preferences--raised');
    expect(capsule.querySelector('tx-switch-language')).not.toBeNull();
    expect(capsule.querySelector('.tx-topbar-preferences__divider')).not.toBeNull();
    (capsule.querySelectorAll('[role="radio"]')[1] as HTMLButtonElement).click();
    (capsule.querySelector('tx-switch-theme button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.languages).toEqual(['ua']);
    expect(fixture.componentInstance.modes).toEqual(['dark']);
  });

  it('shows labelled rows when stacked', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.layout.set('stacked');
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-topbar-preferences') as HTMLElement;
    expect(root.getAttribute('data-layout')).toBe('stacked');
    expect(root.querySelector('.tx-topbar-preferences__capsule')).toBeNull();
    expect(Array.from(root.querySelectorAll('.tx-topbar-preferences__label')).map((label) => label.textContent?.trim())).toEqual(['Language', 'Theme']);
  });
});
