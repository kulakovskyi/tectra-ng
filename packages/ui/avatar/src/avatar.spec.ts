import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxAvatarGroup } from './avatar-group.component';
import { TxAvatar } from './avatar.component';

@Component({
  imports: [TxAvatar, TxAvatarGroup],
  template: `
    <tx-avatar id="photo" [image]="photo()" name="Olena Kovalenko" (imageError)="errors = errors + 1" />
    <tx-avatar id="initials" name="taras shevchuk" size="large" shape="square" [dt]="{ root: { fontScale: '0.5' } }" />
    <tx-avatar id="icon" [size]="20" />
    <tx-avatar id="label" label="AI" tone="purple" ariaLabel="Assistant" />
    <tx-avatar-group id="team" [max]="2" size="small" shape="square" ariaLabel="Team">
      <tx-avatar name="Ann Lee" />
      <tx-avatar name="Bo Ray" />
      <tx-avatar name="Cy Moss" />
      <tx-avatar name="Di Fox" />
      <button txAvatarGroupEnd>Invite</button>
    </tx-avatar-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly photo = signal<string | null>('https://example.invalid/olena.png');
  errors = 0;
}

describe('TxAvatar', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('shows the photo and is named by the person', () => {
    const avatar = el('#photo');
    expect(avatar.getAttribute('role')).toBe('img');
    expect(avatar.getAttribute('aria-label')).toBe('Olena Kovalenko');
    expect(avatar.getAttribute('title')).toBe('Olena Kovalenko');
    expect(avatar.querySelector('img')?.getAttribute('alt')).toBe('');
    expect(avatar.getAttribute('data-tone')).toBeNull();
  });

  it('falls back to initials when the photo fails, and back to the photo when it changes', async () => {
    el('#photo img').dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(el('#photo .tx-avatar__label').textContent).toBe('OK');
    expect(el('#photo').getAttribute('data-tone')).toMatch(/blue|green|sky|orange|purple|red/);
    expect(fixture.componentInstance.errors).toBe(1);
    fixture.componentInstance.photo.set('https://example.invalid/new.png');
    await fixture.whenStable();
    expect(el('#photo img')).not.toBeNull();
  });

  it('draws initials, a stable colour, sizes, shapes, icons and labels', () => {
    expect(el('#initials .tx-avatar__label').textContent).toBe('TS');
    expect(el('#initials').getAttribute('data-size')).toBe('large');
    expect(el('#initials').getAttribute('data-shape')).toBe('square');
    expect(el('#initials').style.getPropertyValue('--tx-avatar-font-scale')).toBe('0.5');
    expect(el('#icon .tx-avatar__icon tx-icon').getAttribute('data-icon')).toBe('user');
    expect(el('#icon').getAttribute('aria-hidden')).toBe('true');
    expect(el('#icon').style.getPropertyValue('--tx-avatar-size')).toBe('20px');
    expect(el('#label').getAttribute('data-tone')).toBe('purple');
    expect(el('#label').getAttribute('aria-label')).toBe('Assistant');
    const again = TestBed.createComponent(Host);
    again.detectChanges();
    expect(again.nativeElement.querySelector('#initials').getAttribute('data-tone')).toBe(el('#initials').getAttribute('data-tone'));
  });

  it('stacks a group, hides the extra avatars and shows +N', () => {
    const avatars = Array.from(el('#team').querySelectorAll('tx-avatar')) as HTMLElement[];
    expect(el('#team').getAttribute('role')).toBe('group');
    expect(avatars.filter((avatar) => !avatar.hidden).map((avatar) => avatar.textContent?.trim())).toEqual(['AL', 'BR', '+2']);
    const more = el('#team .tx-avatar-group__more');
    expect(more.getAttribute('aria-label')).toBe('2 more');
    expect(avatars[0].getAttribute('data-size')).toBe('small');
    expect(avatars[0].getAttribute('data-shape')).toBe('square');
    expect(el('#team button[txAvatarGroupEnd]')).not.toBeNull();
  });
});
