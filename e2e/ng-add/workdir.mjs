import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

export const workdir = resolve(process.env['TX_NG_ADD_DIR'] ?? join(tmpdir(), 'tectra-ng-add'));
export const appName = 'tx-app';
export const appDir = join(workdir, appName);
export const browserDir = join(appDir, 'dist', appName, 'browser');
export const answers = { style: 'soft', primary: 'violet', surface: 'slate' };
