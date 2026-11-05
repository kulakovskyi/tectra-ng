const ARGS = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
const round = (n) => Number(n.toFixed(2)).toString();

function parse(d) {
  const tokens = d.match(/[MLHVCSQTAZ]|-?\d*\.?\d+(?:e-?\d+)?/gi) ?? [];
  const commands = [];
  let i = 0;
  let command = null;
  while (i < tokens.length) {
    if (/[A-Z]/i.test(tokens[i])) {
      command = tokens[i].toUpperCase();
      if (tokens[i] !== command) {
        throw new Error(`relative command in "${d}"`);
      }
      i += 1;
      if (command === 'Z') {
        commands.push({ c: 'Z', a: [] });
        continue;
      }
    }
    const count = ARGS[command];
    commands.push({ c: command, a: tokens.slice(i, i + count).map(Number) });
    i += count;
    if (command === 'M') {
      command = 'L';
    }
  }
  return commands;
}

function apply(m, x, y) {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

export function transformPath(d, m) {
  const det = m[0] * m[3] - m[1] * m[2];
  const scale = Math.sqrt(Math.abs(det));
  const angle = (Math.atan2(m[1], m[0]) * 180) / Math.PI;
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  const out = [];
  for (const { c, a } of parse(d)) {
    if (c === 'Z') {
      out.push('Z');
      cx = sx;
      cy = sy;
      continue;
    }
    if (c === 'H' || c === 'V') {
      const x = c === 'H' ? a[0] : cx;
      const y = c === 'V' ? a[0] : cy;
      out.push(`L${apply(m, x, y).map(round).join(' ')}`);
      cx = x;
      cy = y;
      continue;
    }
    if (c === 'A') {
      const [rx, ry, rot, large, sweep, x, y] = a;
      const [tx, ty] = apply(m, x, y);
      out.push(`A${round(rx * scale)} ${round(ry * scale)} ${round(rot + angle)} ${large} ${det < 0 ? 1 - sweep : sweep} ${round(tx)} ${round(ty)}`);
      cx = x;
      cy = y;
      continue;
    }
    const points = [];
    for (let k = 0; k < a.length; k += 2) {
      points.push(...apply(m, a[k], a[k + 1]));
    }
    out.push(`${c}${points.map(round).join(' ')}`);
    cx = a[a.length - 2];
    cy = a[a.length - 1];
    if (c === 'M') {
      sx = cx;
      sy = cy;
    }
  }
  return out.join('');
}

function mapPaths(paths, m) {
  return paths.flat(Infinity).map((p) => (typeof p === 'string' ? transformPath(p, m) : { ...p, d: transformPath(p.d, m) }));
}

export function rotate(deg, ...paths) {
  const r = (deg * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  return mapPaths(paths, [cos, sin, -sin, cos, 12 - 12 * cos + 12 * sin, 12 - 12 * sin - 12 * cos]);
}

export const flipX = (...paths) => mapPaths(paths, [-1, 0, 0, 1, 24, 0]);
export const flipY = (...paths) => mapPaths(paths, [1, 0, 0, -1, 0, 24]);
export const move = (dx, dy, ...paths) => mapPaths(paths, [1, 0, 0, 1, dx, dy]);
export const scale = (s, cx, cy, ...paths) => mapPaths(paths, [s, 0, 0, s, cx - cx * s, cy - cy * s]);

export const line = (x1, y1, x2, y2) => `M${x1} ${y1}L${x2} ${y2}`;
export const poly = (...p) => `M${p[0]} ${p[1]}` + chunk(p.slice(2)).map(([x, y]) => `L${x} ${y}`).join('');
export const polygon = (...p) => `${poly(...p)}Z`;
export const circle = (cx, cy, r) => `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`;
export const ellipse = (cx, cy, rx, ry) => `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;
export const dot = (cx, cy, r = 1) => fill(circle(cx, cy, r));

export function rect(x, y, w, h, r = 0) {
  if (!r) {
    return `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
  }
  return [
    `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}`,
    `V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}`,
    `H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}`,
    `V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`,
  ].join('');
}

export function arc(cx, cy, r, from, to) {
  const point = (deg) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [round(cx + r * Math.cos(rad)), round(cy + r * Math.sin(rad))];
  };
  const [x1, y1] = point(from);
  const [x2, y2] = point(to);
  const sweep = (((to - from) % 360) + 360) % 360;
  return `M${x1} ${y1}A${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${x2} ${y2}`;
}

export const pointOn = (cx, cy, r, deg) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [round(cx + r * Math.cos(rad)), round(cy + r * Math.sin(rad))].map(Number);
};

export const fill = (d) => ({ d, fill: true });

function chunk(list) {
  const out = [];
  for (let i = 0; i < list.length; i += 2) {
    out.push([list[i], list[i + 1]]);
  }
  return out;
}
