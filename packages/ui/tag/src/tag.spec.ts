import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxTag } from './tag.component';

@Component({
  imports: [TxTag],
  template: `
    <tx-tag id="id" severity="secondary" [copyable]="true" [removable]="true" size="normal" (copied)="copied = $event" (removed)="removed = removed + 1">ord_8F2KQ1</tx-tag>
    <tx-tag id="release" value="Released" severity="success" icon="check" [rounded]="true" [dt]="{ root: { tint: '30%' } }" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  copied = '';
  removed = 0;
}

describe('TxTag', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('renders severity, size, rounded and icon', () => {
    expect(el('#id').getAttribute('data-severity')).toBe('secondary');
    expect(el('#id').getAttribute('data-size')).toBe('medium');
    expect(el('#release').classList).toContain('tx-tag--rounded');
    expect(el('#release .tx-tag__icon tx-icon').getAttribute('data-icon')).toBe('check');
    expect(el('#release .tx-tag__label').textContent).toBe('Released');
    expect(el('#release').style.getPropertyValue('--tx-tag-tint')).toBe('30%');
  });

  it('copies its text and shows a check for a moment', async () => {
    vi.useFakeTimers();
    const write = vi.fn(() => Promise.resolve());
    Object.assign(navigator, { clipboard: { writeText: write } });
    const copy = el('#id .tx-tag__copy') as HTMLButtonElement;
    expect(copy.getAttribute('aria-label')).toBe('Copy');
    copy.click();
    fixture.detectChanges();
    expect(write).toHaveBeenCalledWith('ord_8F2KQ1');
    expect(fixture.componentInstance.copied).toBe('ord_8F2KQ1');
    expect(copy.getAttribute('aria-label')).toBe('Copied');
    vi.advanceTimersByTime(1500);
    fixture.detectChanges();
    expect(copy.getAttribute('aria-label')).toBe('Copy');
    vi.useRealTimers();
  });

  it('is removed with the button', async () => {
    const remove = el('#id .tx-tag__remove') as HTMLButtonElement;
    remove.click();
    remove.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', cancelable: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.removed).toBe(2);
  });
});
