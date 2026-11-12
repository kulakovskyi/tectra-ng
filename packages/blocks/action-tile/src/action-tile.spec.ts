import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TxActionTile } from './action-tile.component';

@Component({
  imports: [TxActionTile],
  template: `
    <tx-action-tile
      icon="envelope"
      title="Email a code"
      [text]="text()"
      [loading]="loading()"
      [disabled]="disabled()"
      [dt]="{ icon: { size: '40px' } }"
      [pt]="{ title: { class: 'own-title' } }"
      (tileClick)="clicks = clicks + 1"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  clicks = 0;
  readonly text = signal<string | undefined>('We send it to j***@mail.com');
  readonly loading = signal(false);
  readonly disabled = signal(false);
}

describe('TxActionTile', () => {
  it('renders an icon, a title, a text and a chevron in one button', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-action-tile') as HTMLElement;
    const button = root.querySelector('button') as HTMLButtonElement;
    expect(root.getAttribute('data-styled')).toBe('true');
    expect(root.style.getPropertyValue('--tx-action-tile-icon-size')).toBe('40px');
    expect(button.querySelector('.tx-action-tile__icon tx-icon')?.getAttribute('data-icon')).toBe('envelope');
    expect(button.querySelector('.tx-action-tile__title')?.classList).toContain('own-title');
    expect(button.querySelector('.tx-action-tile__title')?.textContent?.trim()).toBe('Email a code');
    expect(button.querySelector('.tx-action-tile__text')?.textContent?.trim()).toBe('We send it to j***@mail.com');
    expect(button.querySelector('.tx-action-tile__end tx-icon')?.getAttribute('data-icon')).toBe('angle-right');
    button.click();
    expect(fixture.componentInstance.clicks).toBe(1);
    fixture.componentInstance.text.set(undefined);
    await fixture.whenStable();
    expect(button.querySelector('.tx-action-tile__text')).toBeNull();
  });

  it('shows a spinner and blocks clicks while loading or disabled', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-action-tile') as HTMLElement;
    const button = root.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(root.classList).toContain('tx-action-tile--loading');
    expect(button.querySelector('.tx-action-tile__end tx-icon')?.getAttribute('data-icon')).toBe('spinner');
    fixture.componentInstance.loading.set(false);
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    expect(button.disabled).toBe(true);
    expect(button.hasAttribute('aria-busy')).toBe(false);
    button.click();
    expect(fixture.componentInstance.clicks).toBe(0);
  });
});

@Component({
  imports: [TxActionTile],
  template: `<tx-action-tile title="Plain" [disabled]="disabled()" [loading]="loading()" (tileClick)="clicks = clicks + 1" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainHost {
  clicks = 0;
  readonly disabled = signal(false);
  readonly loading = signal(false);
}

describe('TxActionTile without an icon', () => {
  it('leaves out the icon and ignores click handlers while blocked', async () => {
    const fixture = TestBed.createComponent(PlainHost);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-action-tile') as HTMLElement;
    expect(root.querySelector('.tx-action-tile__icon')).toBeNull();
    const button = fixture.debugElement.query(By.css('button'));
    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();
    button.triggerEventHandler('click');
    fixture.componentInstance.loading.set(false);
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    button.triggerEventHandler('click');
    expect(fixture.componentInstance.clicks).toBe(0);
    fixture.componentInstance.disabled.set(false);
    await fixture.whenStable();
    button.triggerEventHandler('click');
    expect(fixture.componentInstance.clicks).toBe(1);
  });
});
