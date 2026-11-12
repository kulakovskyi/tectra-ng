import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { compareVersions, lowestVersion, minimumVersions } from './min-versions.mjs';

describe('lowestVersion', () => {
  it('reads the lower bound of caret, tilde, range and partial versions', () => {
    assert.equal(lowestVersion('^22.2.0'), '22.2.0');
    assert.equal(lowestVersion('~7.8.2'), '7.8.2');
    assert.equal(lowestVersion('>= 1.4'), '1.4.0');
    assert.equal(lowestVersion('6.x'), '6.0.0');
    assert.equal(lowestVersion('3'), '3.0.0');
  });

  it('refuses a range it cannot read instead of guessing', () => {
    assert.throws(() => lowestVersion('^1.0.0 || ^2.0.0'), /cannot read the lowest version/);
  });
});

describe('compareVersions', () => {
  it('compares numerically, not as text', () => {
    assert.ok(compareVersions('22.10.0', '22.9.0') > 0);
    assert.ok(compareVersions('1.25.12', '1.25.13') < 0);
    assert.equal(compareVersions('7.8.0', '7.8.0'), 0);
  });
});

describe('minimumVersions', () => {
  const rootManifest = {
    dependencies: { '@angular/core': '22.2.5', '@angular/router': '22.2.5', '@angular/cdk': '22.2.6' },
    devDependencies: { '@angular/compiler-cli': '22.2.5', '@angular/platform-server': '^22.2.5', '@angular/build': '22.2.6', '@angular/cli': '22.2.6' },
  };

  it('takes the highest lower bound over all packages and moves the framework along with core and cdk', () => {
    const versions = minimumVersions(
      [
        { peerDependencies: { '@angular/core': '^22.0.0', '@angular/cdk': '^22.2.0', rxjs: '^7.8.0', '@tectra-ng/themes': '^0.3.1' } },
        { peerDependencies: { '@angular/core': '^22.2.0' }, dependencies: { 'prosemirror-model': '^1.25.12', tslib: '^2.8.1' } },
      ],
      rootManifest,
    );
    assert.deepEqual(Object.fromEntries(versions), {
      '@angular/cdk': '22.2.0',
      '@angular/compiler-cli': '22.2.0',
      '@angular/core': '22.2.0',
      '@angular/platform-server': '22.2.0',
      '@angular/router': '22.2.0',
      'prosemirror-model': '1.25.12',
      rxjs: '7.8.0',
    });
  });

  it('leaves the build tools at their own version', () => {
    const versions = minimumVersions([{ peerDependencies: { '@angular/cdk': '^22.2.0' } }], rootManifest);
    assert.equal(versions.has('@angular/build'), false);
    assert.equal(versions.has('@angular/cli'), false);
  });
});
