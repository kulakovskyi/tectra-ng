import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTectra } from '@tectra/core/config';
import { InkPreset } from '@tectra/themes';
import { TxButton } from './button.component';
import { TxButtonIconTemplate } from './button-templates.directive';

@Component({
  imports: [TxButton, TxButtonIconTemplate],
  template: `
    <button
      txButton
      id="main"
      [severity]="'danger'"
      [outlined]="outlined()"
      [variant]="variant()"
      [icon]="icon()"
      [label]="label()"
      [loading]="loading()"
      [disabled]="disabled()"
      [badge]="badge()"
      [dt]="{ root: { borderRadius: '0' } }"
      [pt]="{ label: { class: 'my-label' } }"
      (click)="clicks.update((n) => n + 1)"
    ></button>
    <a txButton id="link" href="#" [disabled]="true" (click)="clicks.update((n) => n + 1)">Link</a>
    <button txButton id="projected" [icon]="'plus'">Create</button>
    <button txButton id="templated"><ng-template txButtonIcon><b class="custom-icon">!</b></ng-template>Custom</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  outlined = signal(false);
  variant = signal<'text' | 'link' | undefined>(undefined);
  icon = signal<string | undefined>(undefined);
  label = signal<string | undefined>('Delete');
  loading = signal(false);
  disabled = signal(false);
  badge = signal<number | undefined>(undefined);
  clicks = signal(0);
}

describe('TxButton', () => {
  let fixture: ComponentFixture<Host>;
  const el = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;

  async function render() {
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: InkPreset, pt: { button: { root: { class: 'global-root' } } } })] });
  });

  it('renders the label, severity, tokens and pass-through classes', async () => {
    await render();
    const button = el('main');
    expect(button.textContent?.trim()).toBe('Delete');
    expect(button.getAttribute('data-severity')).toBe('danger');
    expect(button.style.getPropertyValue('--tx-button-border-radius')).toBe('0');
    expect(button.querySelector('.tx-button__label')?.classList).toContain('my-label');
    expect(button.classList).toContain('global-root');
  });

  it('resolves the variant: explicit variant wins over shortcuts', async () => {
    await render();
    fixture.componentInstance.outlined.set(true);
    fixture.detectChanges();
    expect(el('main').getAttribute('data-variant')).toBe('outlined');
    fixture.componentInstance.variant.set('link');
    fixture.detectChanges();
    expect(el('main').getAttribute('data-variant')).toBe('link');
  });

  it('becomes square with an icon and no text', async () => {
    await render();
    fixture.componentInstance.icon.set('trash');
    fixture.componentInstance.label.set(undefined);
    fixture.detectChanges();
    expect(el('main').classList).toContain('tx-button--icon-only');
    expect(el('projected').classList).not.toContain('tx-button--icon-only');
  });

  it('renders an icon class that is not a tectra icon', async () => {
    await render();
    fixture.componentInstance.icon.set('pi pi-check');
    fixture.detectChanges();
    expect(el('main').querySelector('.tx-button__icon .pi.pi-check')).not.toBeNull();
  });

  it('disables the button and spins while loading', async () => {
    await render();
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    const button = el('main');
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.querySelector('.tx-button__icon--spin')).not.toBeNull();
  });

  it('blocks a disabled link', async () => {
    await render();
    const link = el('link');
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('tabindex')).toBe('-1');
    link.click();
    expect(fixture.componentInstance.clicks()).toBe(0);
  });

  it('shows a badge and an icon template', async () => {
    await render();
    fixture.componentInstance.badge.set(5);
    fixture.detectChanges();
    expect(el('main').querySelector('tx-badge')?.textContent?.trim()).toBe('5');
    expect(el('templated').querySelector('.custom-icon')).not.toBeNull();
  });
});
