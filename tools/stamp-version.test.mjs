import assert from 'node:assert/strict';
import { it } from 'node:test';
import { stampVersion } from './stamp-version.mjs';

it('writes the package version into the version constants', () => {
  assert.equal(stampVersion('const TECTRA_UI_VERSION = "0.0.0";', '0.3.2'), 'const TECTRA_UI_VERSION = "0.3.2";');
  assert.equal(stampVersion("export declare const TECTRA_CHARTS_VERSION = '0.0.0';", '1.10.0'), "export declare const TECTRA_CHARTS_VERSION = '1.10.0';");
  assert.equal(stampVersion('const other = "0.0.0";', '0.3.2'), 'const other = "0.0.0";');
});
