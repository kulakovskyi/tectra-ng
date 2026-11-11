export async function* textChunks(response: Response): AsyncGenerator<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    return;
  }
  const decoder = new TextDecoder();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        const rest = decoder.decode();
        if (rest) {
          yield rest;
        }
        return;
      }
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        yield chunk;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function readTextStream(response: Response, onChunk: (chunk: string, text: string) => void): Promise<string> {
  let text = '';
  for await (const chunk of textChunks(response)) {
    text += chunk;
    onChunk(chunk, text);
  }
  return text;
}
