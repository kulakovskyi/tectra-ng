export function iconConstant(name) {
  return `txIcon${name.replace(/(^|-)([a-z0-9])/g, (_, __, char) => char.toUpperCase())}`;
}
