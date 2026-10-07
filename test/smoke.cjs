// Smoke test of the compiled library (lib/) on the current platform: run `yarn compile` first.
const assert = require('assert');
const { mkdtempSync, rmSync } = require('fs');
const { tmpdir } = require('os');
const { join } = require('path');

const { connectChangelog } = require('..');

const changelogPath = join(mkdtempSync(join(tmpdir(), 'strangelog-smoke-')), 'changelog');
const changelog = connectChangelog({ path: changelogPath, components: { api: 'API' } });

try {
  changelog.addEntry({ component: 'api', kind: 'addition', description: 'first entry' });
  changelog.bumpNextVersion('1.0.0');
  changelog.addEntry({ component: null, kind: 'fix', description: 'second entry' });

  const data = changelog.getChangelogData();

  assert.deepStrictEqual(
    data.map(({ version }) => version),
    [null, '1.0.0']
  );
  assert.strictEqual(data[0].entries.fix[0].description, 'second entry');
  assert.strictEqual(data[1].entries.addition[0].component, 'api');
  assert.deepStrictEqual(changelog.migrate(), { from: 2, to: 2 });
  assert.match(
    changelog.generate(),
    /## Version `1\.0\.0`\n\n### Added\n- \*\*API:\*\* first entry/
  );

  assert.match(
    connectChangelog({
      path: changelogPath,
      components: { api: 'API' },
      template: 'compact'
    }).generate(),
    /### 1\.0\.0 \(\d{4}-\d{2}-\d{2}\)\n\* \*\*api\*\* feat: first entry/
  );

  console.log('Smoke test passed');
} finally {
  rmSync(join(changelogPath, '..'), { recursive: true, force: true });
}
