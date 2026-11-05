# tokens build

Script that reads `src/` and writes:

- `dist/css/tokens.css` — `:root { --tx-primary: …; }` + `[data-theme="dark"] { … }`
- `dist/json/tokens.json` — for the Figma variables plugin and the docs theming tab
