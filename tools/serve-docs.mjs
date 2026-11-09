import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

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

const isFile = async (file) => file.startsWith(root) && (await stat(file).catch(() => null))?.isFile();

async function resolveFile(path) {
  const file = join(root, path.replace(/\/+$/, '') || '/');
  for (const candidate of [file, join(file, 'index.html')]) {
    if (await isFile(candidate)) {
      return { file: candidate, status: 200 };
    }
  }
  const notFound = join(root, '404.html');
  return { file: (await isFile(notFound)) ? notFound : join(root, 'index.html'), status: 404 };
}

createServer(async (request, response) => {
  const { file, status } = await resolveFile(decodeURIComponent((request.url ?? '/').split('?')[0]));
  response.writeHead(status, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  response.end(await readFile(file));
}).listen(port, () => console.log(`docs on http://localhost:${port}`));
