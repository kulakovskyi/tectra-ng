# File

File sizes people can read — `512 B`, `1.5 KB`, `5 MB` in the locale number format — and downloads of a URL or a `Blob` from code (CSV built in the browser, a signed link from an API). Downloads do nothing on the server.

```html
{{ file.size | txFileSize }}
```

## Pipes
| Name | Description |
|---|---|
| txFileSize: options? | Size in B, KB, MB, GB, TB, PB; options `decimals` (1), `base` (`1024` or `1000`), `locale` (the tectra one by default), `empty` (`-` for no size) |

## Functions
| Name | Description |
|---|---|
| formatFileSize(bytes, options?) | The function behind the pipe; `en-US` by default |
| downloadFile(url, filename?) | Downloads a URL through a temporary link; the name comes from the URL when not given |
| downloadBlob(blob, filename?) | Downloads data made in the browser and frees its object URL |
