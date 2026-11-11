# Text

Small text helpers as pipes and functions: cut a long value (at the end, or in the middle for links and ids), capitalize, add `https://` to a bare domain, turn Cyrillic into Latin, make URL slugs and escape HTML.

```html
<a [href]="site.domain | txHttpPrefix">{{ site.url | txTruncate: 32 : '…' : 'middle' }}</a>
```

## Pipes
| Name | Description |
|---|---|
| txTruncate: limit?, trail?, position? | Cuts after `limit` characters (15) and adds the trail (`...`); `middle` keeps the start and the end; `-` for an empty value. Emoji count as one character |
| txCapitalize | First letter upper case, the rest as it is |
| txHttpPrefix: protocol? | Adds `https://` (or `http://`) when the link has no scheme; `mailto:` and others stay |

## Functions
| Name | Description |
|---|---|
| truncate(value, limit?, trail?, position?, empty?) | The function behind `txTruncate` |
| capitalize(value) | The function behind `txCapitalize` |
| withHttpPrefix(link, protocol?) | The function behind `txHttpPrefix` |
| normalizeKeyword(value) | Trimmed lower case — compare keywords and tags |
| transliterate(value) | Ukrainian and Russian letters to Latin, the case kept (`Щука` → `Shchuka`) |
| slugify(value, separator?) | Latin lower-case slug for URLs and file names (`Привіт, світе!` → `privit-svite`) |
| escapeHtml(value) | `&`, `<`, `>`, `"` and `'` as entities, for attributes and text you build by hand |
