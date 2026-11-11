import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxToastService } from '@tectra-ng/ui/toast';
import { copyToClipboard } from './clipboard';
import { TxCopy } from './copy.directive';

@Component({
  imports: [TxCopy],
  template: `
    <button type="button" class="button" [txCopy]="value()" [copyMessage]="message()" (copied)="copied.push($event)" (copyFailed)="failed.push($event)">Copy</button>
    <code class="code" txCopy="ORD-1042">ORD-1042</code>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CopyHost {
  readonly value = signal<string | number | null>('https://example.com/invite/42');
  readonly message = signal<string | false | undefined>(undefined);
  readonly copied: string[] = [];
  readonly failed: string[] = [];
}

const flush = () => new Promise((resolve) => setTimeout(resolve));

describe('clipboard', () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  });

  it('writes through the Clipboard API', async () => {
    expect(await copyToClipboard('hello')).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('falls back to a selection outside a secure context', async () => {
    Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true });
    const exec = vi.fn().mockReturnValue(true);
    document.execCommand = exec;
    expect(await copyToClipboard('fallback')).toBe(true);
    expect(exec).toHaveBeenCalledWith('copy');
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('copies on click, shows a translated toast and reports it', async () => {
    const fixture = TestBed.createComponent(CopyHost);
    fixture.detectChanges();
    const toast = TestBed.inject(TxToastService);
    const success = vi.spyOn(toast, 'success');
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.button')?.click();
    await flush();
    expect(writeText).toHaveBeenCalledWith('https://example.com/invite/42');
    expect(success).toHaveBeenCalledWith('Copied to clipboard');
    expect(fixture.componentInstance.copied).toEqual(['https://example.com/invite/42']);
  });

  it('takes an own message or none, and skips empty values', async () => {
    const fixture = TestBed.createComponent(CopyHost);
    fixture.detectChanges();
    const success = vi.spyOn(TestBed.inject(TxToastService), 'success');
    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.button') as HTMLButtonElement;
    fixture.componentInstance.message.set('Link copied');
    fixture.detectChanges();
    button.click();
    await flush();
    expect(success).toHaveBeenLastCalledWith('Link copied');
    fixture.componentInstance.message.set(false);
    fixture.componentInstance.value.set(42);
    fixture.detectChanges();
    button.click();
    await flush();
    expect(success).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenLastCalledWith('42');
    fixture.componentInstance.value.set(null);
    fixture.detectChanges();
    button.click();
    await flush();
    expect(writeText).toHaveBeenCalledTimes(2);
  });

  it('reports a failure with an error toast', async () => {
    writeText.mockRejectedValue(new Error('denied'));
    document.execCommand = vi.fn().mockReturnValue(false);
    const fixture = TestBed.createComponent(CopyHost);
    fixture.detectChanges();
    const error = vi.spyOn(TestBed.inject(TxToastService), 'error');
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.button')?.click();
    await flush();
    expect(error).toHaveBeenCalledWith('Could not copy');
    expect(fixture.componentInstance.failed.length).toBe(1);
  });

  it('turns a plain element into a keyboard button', async () => {
    const fixture = TestBed.createComponent(CopyHost);
    fixture.detectChanges();
    const code = (fixture.nativeElement as HTMLElement).querySelector('.code') as HTMLElement;
    const button = (fixture.nativeElement as HTMLElement).querySelector('.button') as HTMLElement;
    expect(code.getAttribute('role')).toBe('button');
    expect(code.getAttribute('tabindex')).toBe('0');
    expect(button.hasAttribute('role')).toBe(false);
    code.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await flush();
    expect(writeText).toHaveBeenCalledWith('ORD-1042');
  });
});
