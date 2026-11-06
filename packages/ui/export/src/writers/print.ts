export function printHtml(document: Document, html: string): Promise<void> {
  return new Promise((resolve) => {
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('tabindex', '-1');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none';
    let removed = false;
    const remove = () => {
      if (removed) return;
      removed = true;
      frame.remove();
    };
    frame.addEventListener('load', () => {
      const view = frame.contentWindow;
      if (!view) {
        remove();
        return resolve();
      }
      view.addEventListener('afterprint', () => setTimeout(remove));
      view.focus();
      view.print();
      setTimeout(remove, 60000);
      resolve();
    });
    frame.srcdoc = html;
    document.body.appendChild(frame);
  });
}
