import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? 'dist/apps/docs/browser');
const port = Number(process.argv[3] ?? 4310);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json', '.woff2': 'font/woff2' };

createServer(async (request, response) => {
  const path = decodeURIComponent((request.url ?? '/').split('?')[0]);
  let file = join(root, path);
  try {
    if (!file.startsWith(root) || !(await stat(file)).isFile()) {
      file = join(root, 'index.html');
    }
  } catch {
    file = join(root, 'index.html');
  }
  response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  response.end(await readFile(file));
}).listen(port, () => console.log(`docs on http://localhost:${port}`));
