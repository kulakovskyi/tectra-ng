export function pickRandom<T>(items: readonly T[] | null | undefined, random: () => number = Math.random): T | null {
  if (!items?.length) {
    return null;
  }
  return items[Math.floor(random() * items.length)];
}

export function pickRandomN<T>(items: readonly T[] | null | undefined, count: number, random: () => number = Math.random): T[] {
  if (!items?.length || count <= 0) {
    return [];
  }
  const pool = [...items];
  const size = Math.min(count, pool.length);
  for (let index = 0; index < size; index++) {
    const swap = index + Math.floor(random() * (pool.length - index));
    [pool[index], pool[swap]] = [pool[swap], pool[index]];
  }
  return pool.slice(0, size);
}

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  return pickRandomN(items, items.length, random);
}
