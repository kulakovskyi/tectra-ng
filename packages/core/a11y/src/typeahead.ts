/**
 * Type-to-find for lists: collects typed characters and finds the next label that starts with them; the
 * buffer clears after a pause (default 500 ms).
 */
export class TxTypeahead {
  private buffer = '';
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly delay = 500) {}

  /**
   * Adds a typed character and returns the index of the matching label, searching from the item after
   * `current`; `null` when nothing matches.
   */
  search(character: string, labels: string[], current: number): number | null {
    if (character.length !== 1 || !labels.length) {
      return null;
    }
    this.buffer += character.toLowerCase();
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => (this.buffer = ''), this.delay);

    const repeated = this.buffer.split('').every((letter) => letter === this.buffer[0]);
    const query = repeated ? this.buffer[0] : this.buffer;
    const start = repeated || this.buffer.length === 1 ? current + 1 : Math.max(current, 0);
    for (let offset = 0; offset < labels.length; offset += 1) {
      const index = (start + offset) % labels.length;
      if (labels[index].toLowerCase().startsWith(query)) {
        return index;
      }
    }
    return null;
  }

  /** Clears the typed characters. */
  reset(): void {
    this.buffer = '';
  }
}
