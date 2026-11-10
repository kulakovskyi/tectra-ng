import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxAvatarGroup } from './avatar-group.component';
import { TxAvatar } from './avatar.component';
import { provideTxTooltip } from '@tectra-ng/ui/tooltip';

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
      <tx-avatar name="Cy Moss" image="https://example.invalid/cy.png" />
      <tx-avatar label="AI" ariaLabel="Assistant" tone="purple" />
      <button txAvatarGroupEnd>Invite</button>
    </tx-avatar-group>
    <tx-avatar-group id="plain" [tooltips]="false" [max]="0" addButton (add)="adds = adds + 1">
      <tx-avatar name="Eve Stone" />
    </tx-avatar-group>
    <tx-avatar id="tipped" name="Fay Lin" tooltip />
    <tx-avatar-group id="static" [max]="1" [morePopover]="false">
      <tx-avatar name="Gus Hale" />
      <tx-avatar name="Ida Webb" />
    </tx-avatar-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly photo = signal<string | null>('https://example.invalid/olena.png');
  errors = 0;
  adds = 0;
}

describe('TxAvatar', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  const settle = async () => {
    await fixture.whenStable();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();
  };
  const fire = (target: Element, type: string) => target.dispatchEvent(new Event(type, { bubbles: true }));
  const tooltip = () => document.querySelector('.tx-tooltip') as HTMLElement | null;

  afterEach(() => {
    fixture.destroy();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTxTooltip({ showDelay: 0, hideDelay: 0 })] });
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

  it('shows the name in a tooltip inside a group, or when asked, instead of the native title', async () => {
    const first = el('#team tx-avatar');
    expect(first.hasAttribute('title')).toBe(false);
    expect(first.hasAttribute('aria-describedby')).toBe(false);
    fire(first, 'mouseenter');
    await settle();
    expect(tooltip()?.textContent?.trim()).toBe('Ann Lee');
    fire(first, 'mouseleave');
    await settle();
    expect(tooltip()).toBeNull();

    expect(el('#tipped').hasAttribute('title')).toBe(false);
    fire(el('#tipped'), 'mouseenter');
    await settle();
    expect(tooltip()?.textContent?.trim()).toBe('Fay Lin');
    fire(el('#tipped'), 'mouseleave');
    await settle();

    const plain = el('#plain tx-avatar');
    expect(plain.getAttribute('title')).toBe('Eve Stone');
    fire(plain, 'mouseenter');
    await settle();
    expect(tooltip()).toBeNull();
    expect(el('#photo').getAttribute('title')).toBe('Olena Kovalenko');
  });

  it('lists the hidden people in a popover from +N', async () => {
    const more = el('#team .tx-avatar-group__more') as HTMLButtonElement;
    expect(more.tagName).toBe('BUTTON');
    expect(more.getAttribute('aria-haspopup')).toBe('dialog');
    expect(more.getAttribute('aria-expanded')).toBe('false');
    fire(more.querySelector('tx-avatar') as HTMLElement, 'mouseenter');
    await settle();
    expect(tooltip()).toBeNull();

    more.click();
    await settle();
    const dialog = document.querySelector('.tx-popover') as HTMLElement;
    expect(dialog.getAttribute('aria-label')).toBe('2 more');
    expect(more.getAttribute('aria-expanded')).toBe('true');
    const items = Array.from(dialog.querySelectorAll('[role="listitem"]')) as HTMLElement[];
    expect(items.map((item) => item.querySelector('.tx-avatar-group__name')?.textContent?.trim())).toEqual(['Cy Moss', 'Assistant']);
    expect(items[0].querySelector('img')?.getAttribute('src')).toBe('https://example.invalid/cy.png');
    expect(items[1].querySelector('.tx-avatar__label')?.textContent).toBe('AI');
    expect(items[1].querySelector('tx-avatar')?.getAttribute('data-tone')).toBe('purple');
    expect(items[0].querySelector('tx-avatar')?.getAttribute('data-size')).toBe('small');
    expect(items[0].querySelector('[aria-hidden="true"] tx-avatar')).not.toBeNull();

    more.click();
    await settle();
    expect(more.getAttribute('aria-expanded')).toBe('false');
  });

  it('puts +N first without an overlap when every avatar is hidden', () => {
    const more = el('#plain .tx-avatar-group__more');
    expect(more.classList).toContain('tx-avatar-group__more--first');
    expect(more.getAttribute('aria-label')).toBe('1 more');
    expect(el('#team .tx-avatar-group__more').classList).not.toContain('tx-avatar-group__more--first');
  });

  it('keeps +N a plain named label without the popover', () => {
    const more = el('#static .tx-avatar-group__more');
    expect(more.tagName).toBe('TX-AVATAR');
    expect(more.getAttribute('role')).toBe('img');
    expect(more.getAttribute('aria-label')).toBe('1 more');
    expect(more.textContent?.trim()).toBe('+1');
    expect(el('#static button')).toBeNull();
    expect(el('#static tx-popover')).toBeNull();
  });

  it('adds a dashed add button of the avatar size that emits add', async () => {
    const add = el('#plain .tx-avatar-group__add') as HTMLButtonElement;
    expect(add.getAttribute('aria-label')).toBe('Add a person');
    expect(add.querySelector('tx-icon')?.getAttribute('data-icon')).toBe('plus');
    expect(add.hasAttribute('aria-describedby')).toBe(false);
    add.click();
    await settle();
    expect(fixture.componentInstance.adds).toBe(1);
    expect(el('#team .tx-avatar-group__add')).toBeNull();
  });
});
