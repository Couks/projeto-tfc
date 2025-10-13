import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const result = await build({
    entryPoints: ['posthog-js'],
    bundle: true,
    format: 'iife',
    minify: true,
    write: false,
    globalName: 'posthog',
    platform: 'browser'
  });

  const js = result.outputFiles[0].text;
  const hash = createHash('sha256').update(js).digest('hex').slice(0, 16);
  const fileName = `posthog.iife.${hash}.js`;
  const destDir = resolve(__dirname, '../insighthouse/public/static');
  mkdirSync(destDir, { recursive: true });
  writeFileSync(resolve(destDir, fileName), js, 'utf8');
  writeFileSync(resolve(destDir, 'posthog.iife.js'), `/* latest */\n${js}`, 'utf8');
  console.log(`[build-posthog] Wrote ${fileName}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


