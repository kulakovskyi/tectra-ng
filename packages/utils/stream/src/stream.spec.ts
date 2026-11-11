import { readTextStream, textChunks } from './stream';

function streamed(parts: Uint8Array[]): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      parts.forEach((part) => controller.enqueue(part));
      controller.close();
    },
  });
  return new Response(body);
}

describe('stream', () => {
  const bytes = new TextEncoder().encode('Привіт, world');

  it('reads a streamed answer chunk by chunk, also when a letter is split', async () => {
    const response = streamed([bytes.slice(0, 3), bytes.slice(3, 9), bytes.slice(9)]);
    const seen: string[] = [];
    const text = await readTextStream(response, (_, sofar) => seen.push(sofar));
    expect(text).toBe('Привіт, world');
    expect(seen.at(-1)).toBe('Привіт, world');
    expect(seen.join('')).not.toContain('�');
  });

  it('works as an async iterator and with an empty body', async () => {
    const chunks: string[] = [];
    for await (const chunk of textChunks(streamed([bytes]))) {
      chunks.push(chunk);
    }
    expect(chunks.join('')).toBe('Привіт, world');
    expect(await readTextStream(new Response(null), () => undefined)).toBe('');
  });
});
