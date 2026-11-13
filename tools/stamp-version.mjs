const PLACEHOLDER = /(\bTECTRA_[A-Z]+_VERSION\s*=\s*)(["'])0\.0\.0\2/g;

export function stampVersion(text, version) {
  return text.replace(PLACEHOLDER, (_, head, quote) => `${head}${quote}${version}${quote}`);
}
