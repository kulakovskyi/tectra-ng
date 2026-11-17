/**
 * Writes text to the clipboard: the Clipboard API in a secure context, a hidden selection with the copy command
 * elsewhere or when the API refuses. Resolves to `true` when the text was copied, always `false` on the server.
 */
export async function writeToClipboard(text: string, document: Document | undefined = globalThis.document): Promise<boolean> {
  const view = document?.defaultView;
  if (!document || !view) {
    return false;
  }
  if (view.isSecureContext && view.navigator.clipboard?.writeText) {
    try {
      await view.navigator.clipboard.writeText(text);
      return true;
    } catch {
      return copyWithSelection(text, document);
    }
  }
  return copyWithSelection(text, document);
}

function copyWithSelection(text: string, document: Document): boolean {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  area.style.pointerEvents = 'none';
  const active = document.activeElement as HTMLElement | null;
  document.body.appendChild(area);
  area.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  document.body.removeChild(area);
  active?.focus?.({ preventScroll: true });
  return copied;
}
