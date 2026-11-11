import { downloadBlob, downloadFile, formatFileSize } from './file';

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
});
