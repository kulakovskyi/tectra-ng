import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = resolve(process.argv[2] ?? 'dist/apps/docs/browser');
const port = Number(process.argv[3] ?? 4310);
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.xml': 'application/xml',
};

async function load(urlPath) {
  const base = resolve(root, `.${urlPath.replace(/\/+$/, '') || '/'}`);
  for (const candidate of [base, resolve(base, 'index.html')]) {
    if ((candidate === root || candidate.startsWith(root + sep)) && (await stat(candidate).catch(() => null))?.isFile()) {
      return { file: candidate, status: 200, body: await readFile(candidate) };
    }
  }
  const notFound = resolve(root, '404.html');
  const fallback = (await stat(notFound).catch(() => null))?.isFile() ? notFound : resolve(root, 'index.html');
  return { file: fallback, status: 404, body: await readFile(fallback) };
}

createServer(async (request, response) => {
  const { file, status, body } = await load(decodeURIComponent((request.url ?? '/').split('?')[0]));
  response.writeHead(status, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  response.end(body);
}).listen(port, () => console.log(`docs on http://localhost:${port}`));
