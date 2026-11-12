import { inlineSvgImages, qrToPng, svgDataUrl, svgToPng } from './png';

function stubFetch(failing: string[] = []) {
  const fetchMock = vi.fn(async (url: string) => {
    if (failing.includes(url)) {
      throw new Error('offline');
    }
    return { blob: async () => new Blob(['<svg/>'], { type: 'image/svg+xml' }) };
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function stubCanvas(context: { drawImage: () => void } | null = { drawImage: vi.fn() }) {
  Object.defineProperty(HTMLImageElement.prototype, 'decode', { configurable: true, value: () => Promise.resolve() });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
  return vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,AAAA');
}

afterEach(() => {
  Reflect.deleteProperty(HTMLImageElement.prototype, 'decode');
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('svgDataUrl', () => {
  it('encodes the markup into a data URL', () => {
    expect(svgDataUrl('<svg a="1"/>')).toBe('data:image/svg+xml;charset=utf-8,%3Csvg%20a%3D%221%22%2F%3E');
  });
});

describe('inlineSvgImages', () => {
  it('replaces every external image with a data URL, once per address', async () => {
    const fetchMock = stubFetch();
    const svg = '<image href="/logo.svg?a=1&amp;b=2"/><image href="/logo.svg?a=1&amp;b=2"/>';
    const result = await inlineSvgImages(svg);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/logo.svg?a=1&b=2');
    expect(result).not.toContain('/logo.svg');
    expect(result.match(/href="data:image\/svg\+xml;base64,/g)).toHaveLength(2);
  });

  it('keeps data URLs, fragment links and images that fail to load', async () => {
    const fetchMock = stubFetch(['/missing.png']);
    const svg = '<image href="data:image/png;base64,AA"/><use href="#dot"/><image href="/missing.png"/>';
    expect(await inlineSvgImages(svg)).toBe(svg);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('keeps an image the reader cannot read', async () => {
    stubFetch();
    vi.stubGlobal(
      'FileReader',
      class {
        error = new Error('unreadable');
        onerror: (() => void) | null = null;
        readAsDataURL() {
          this.onerror?.();
        }
      },
    );
    const svg = '<image href="/logo.svg"/>';
    expect(await inlineSvgImages(svg)).toBe(svg);
  });
});

describe('svgToPng', () => {
  it('draws the svg on a canvas of the given size', async () => {
    const context = { drawImage: vi.fn() };
    const toDataUrl = stubCanvas(context);
    expect(await svgToPng('<svg/>', 256)).toBe('data:image/png;base64,AAAA');
    expect(toDataUrl).toHaveBeenCalledWith('image/png');
    expect(context.drawImage).toHaveBeenCalledWith(expect.any(HTMLImageElement), 0, 0, 256, 256);
  });

  it('still returns an image without a 2d context', async () => {
    stubCanvas(null);
    expect(await svgToPng('<svg/>')).toBe('data:image/png;base64,AAAA');
  });
});

describe('qrToPng', () => {
  it('renders the code at 1024 pixels by default', async () => {
    const context = { drawImage: vi.fn() };
    stubCanvas(context);
    await qrToPng('tectra');
    expect(context.drawImage).toHaveBeenCalledWith(expect.any(HTMLImageElement), 0, 0, 1024, 1024);
  });

  it('takes the pixel size from the options', async () => {
    const context = { drawImage: vi.fn() };
    stubCanvas(context);
    await qrToPng('tectra', { pixelSize: 64 });
    expect(context.drawImage).toHaveBeenCalledWith(expect.any(HTMLImageElement), 0, 0, 64, 64);
  });
});
