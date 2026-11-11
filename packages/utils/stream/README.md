# Stream

Reads a streamed text answer — an AI reply, a long log, server-sent text — piece by piece as it arrives, so the page can show it while it is still coming. Letters split between two network chunks are joined correctly.

```ts
const response = await fetch('/api/assistant', { method: 'POST', body });
await readTextStream(response, (_, text) => this.answer.set(text));
```

## Functions
| Name | Description |
|---|---|
| readTextStream(response, onChunk) | Calls `onChunk(chunk, textSoFar)` for every piece and resolves to the whole text |
| textChunks(response) | The same as an async iterator: `for await (const chunk of textChunks(response))` |
