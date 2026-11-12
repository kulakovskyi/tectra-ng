import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { FILE_ICON_DEFAULTS } from './file.icons';
import { TxFileSizePipe, downloadBlob, downloadFile, formatFileSize } from './file';

@Component({
  imports: [TxFileSizePipe],
  template: `<span class="auto">{{ size() | txFileSize }}</span><span class="fixed">{{ size() | txFileSize: { locale: 'en-US', decimals: 2 } }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SizeHost {
  readonly size = signal(1536);
}

describe('file', () => {
  it('formats sizes with units and the locale', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
    expect(formatFileSize(1.25 * 1024 ** 3, { decimals: 2 })).toBe('1.25 GB');
    expect(formatFileSize(1500, { base: 1000 })).toBe('1.5 KB');
    expect(formatFileSize(1536, { locale: 'uk-UA' })).toBe('1,5 KB');
    expect(formatFileSize(1024 ** 6)).toBe('1,024 PB');
    expect(formatFileSize(null)).toBe('-');
    expect(formatFileSize(-1, { empty: '—' })).toBe('—');
  });

  it('downloads a file through a temporary link', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    downloadFile('https://example.com/files/report.pdf?v=2');
    const anchor = click.mock.instances[0] as unknown as HTMLAnchorElement;
    expect(anchor.download).toBe('report.pdf');
    expect(document.querySelector('a[download]')).toBeNull();
    click.mockRestore();
  });

  it('downloads a blob and frees its URL', () => {
    vi.useFakeTimers();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    URL.createObjectURL = vi.fn().mockReturnValue('blob:1');
    URL.revokeObjectURL = vi.fn();
    downloadBlob(new Blob(['a,b']), 'data.csv');
    expect((click.mock.instances[0] as unknown as HTMLAnchorElement).download).toBe('data.csv');
    vi.runAllTimers();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:1');
    click.mockRestore();
    vi.useRealTimers();
  });

  it('skips downloads without a window or a body', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    downloadBlob(new Blob(['a']), 'a.txt', document.implementation.createHTMLDocument(''));
    downloadFile('https://example.com/a.txt', 'a.txt', document.implementation.createDocument(null, 'root'));
    expect(click).not.toHaveBeenCalled();
    click.mockRestore();
  });

  it('names a blob download "file" by default', () => {
    vi.useFakeTimers();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    URL.createObjectURL = vi.fn().mockReturnValue('blob:2');
    URL.revokeObjectURL = vi.fn();
    downloadBlob(new Blob(['a']));
    expect((click.mock.instances[0] as unknown as HTMLAnchorElement).download).toBe('file');
    vi.runAllTimers();
    click.mockRestore();
    vi.useRealTimers();
  });

  it('formats in the tectra locale unless the pipe gets one', async () => {
    const fixture = TestBed.createComponent(SizeHost);
    fixture.detectChanges();
    const text = (selector: string) => (fixture.nativeElement.querySelector(selector) as HTMLElement).textContent;
    expect(text('.auto')).toBe('1.5 KB');
    await TestBed.inject(TxLocaleService).setLocale('ua');
    fixture.detectChanges();
    expect(text('.auto')).toBe('1,5 KB');
    expect(text('.fixed')).toBe('1.5 KB');
  });

  it('lists the icons it draws', () => {
    expect(Object.keys(FILE_ICON_DEFAULTS)).toEqual(['file']);
  });
});
