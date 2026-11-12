import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxTag } from './tag.component';

@Component({
  imports: [TxTag],
  template: `
    <tx-tag id="id" severity="secondary" [copyable]="true" [removable]="true" size="normal" (copied)="copied = $event" (removed)="removed = removed + 1">ord_8F2KQ1</tx-tag>
    <tx-tag id="release" value="Released" severity="success" icon="check" [rounded]="true" [dt]="{ root: { tint: '30%' } }" />
    <tx-tag id="own" value="Own" icon="own-tag-icon" />
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
    remove.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', cancelable: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.removed).toBe(3);
  });

  it('draws an unregistered icon name as a class', () => {
    expect(el('#own .tx-tag__icon span.own-tag-icon')).not.toBeNull();
  });

  it('restarts the check when copied again and copies without a clipboard', () => {
    vi.useFakeTimers();
    Object.assign(navigator, { clipboard: undefined });
    const copy = el('#id .tx-tag__copy') as HTMLButtonElement;
    copy.click();
    vi.advanceTimersByTime(1000);
    copy.click();
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(copy.getAttribute('aria-label')).toBe('Copied');
    vi.advanceTimersByTime(500);
    fixture.detectChanges();
    expect(copy.getAttribute('aria-label')).toBe('Copy');
    expect(fixture.componentInstance.copied).toBe('ord_8F2KQ1');
    vi.useRealTimers();
  });
});

describe('TxTag recompiled by TestBed', () => {
  it('still reads its label when a test overrides the component', async () => {
    TestBed.overrideComponent(TxTag, { set: { styles: [] } });
    Object.assign(navigator, { clipboard: { writeText: vi.fn(() => Promise.resolve()) } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    (fixture.nativeElement.querySelector('#id .tx-tag__copy') as HTMLButtonElement).click();
    expect(fixture.componentInstance.copied).toBe('ord_8F2KQ1');
    fixture.destroy();
  });
});

