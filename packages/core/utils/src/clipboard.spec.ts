import { writeToClipboard } from './clipboard';

describe('writeToClipboard', () => {
  let writeText: ReturnType<typeof vi.fn>;
  const execCommand = document.execCommand;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  });

  afterEach(() => {
    document.execCommand = execCommand;
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
  });

  it('writes through the Clipboard API in a secure context', async () => {
    expect(await writeToClipboard('hello')).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('falls back to a hidden selection outside a secure context and keeps the focus', async () => {
    Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true });
    const exec = vi.fn().mockReturnValue(true);
    document.execCommand = exec;
    const field = document.createElement('input');
    document.body.appendChild(field);
    field.focus();
    expect(await writeToClipboard('fallback')).toBe(true);
    expect(exec).toHaveBeenCalledWith('copy');
    expect(writeText).not.toHaveBeenCalled();
    expect(document.querySelector('textarea')).toBeNull();
    expect(document.activeElement).toBe(field);
    field.remove();
  });

  it('falls back when the Clipboard API refuses, and fails when the copy command fails or throws', async () => {
    writeText.mockRejectedValue(new Error('denied'));
    document.execCommand = vi.fn().mockReturnValue(false);
    expect(await writeToClipboard('x')).toBe(false);
    document.execCommand = vi.fn().mockReturnValue(true);
    expect(await writeToClipboard('x')).toBe(true);
    document.execCommand = vi.fn(() => {
      throw new Error('blocked');
    });
    expect(await writeToClipboard('x')).toBe(false);
  });

  it('fails without a window', async () => {
    expect(await writeToClipboard('x', document.implementation.createHTMLDocument(''))).toBe(false);
    vi.stubGlobal('document', undefined);
    try {
      expect(await writeToClipboard('x')).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
