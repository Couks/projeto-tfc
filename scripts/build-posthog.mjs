/**
 * build-posthog.mjs
 *
 * Script para gerar o bundle do posthog-js usando esbuild.
 *
 * O que faz:
 * 1. Gera um bundle IIFE minificado do "posthog-js" para uso em navegador.
 * 2. Cria um hash SHA256 do conteúdo do arquivo para controle de versão/cache.
 * 3. Salva o arquivo gerado com hash no nome e também sobrescreve um arquivo "latest".
 * 4. Output: insighthouse/public/static/posthog.iife.<hash>.js e insighthouse/public/static/posthog.iife.js
 */

import { build } from "esbuild";
import { createHash } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// Define caminhos base do script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  // Faz o bundle do posthog-js
  const result = await build({
    entryPoints: ["posthog-js"], // ponto de entrada do pacote
    bundle: true, // agrupa dependências
    format: "iife", // formato para browser
    minify: true, // minifica o resultado
    write: false, // não escreve arquivo direto (permite manipular o resultado)
    globalName: "posthog", // nome da variável global exportada
    platform: "browser", // target browser
  });

  const js = result.outputFiles[0].text; // resultado JS como texto
  const hash = createHash("sha256").update(js).digest("hex").slice(0, 16); // cria hash para cache busting
  const fileName = `posthog.iife.${hash}.js`; // nome final com hash

  // Destino dos arquivos gerados (pasta pública do projeto)
  const destDir = resolve(__dirname, "../insighthouse/public/static");
  mkdirSync(destDir, { recursive: true }); // garante que o diretório existe

  // Salva bundle com hash
  writeFileSync(resolve(destDir, fileName), js, "utf8");

  // Salva versão "latest" sempre sobrescrevendo (para facilitar referência rápida)
  writeFileSync(
    resolve(destDir, "posthog.iife.js"),
    `/* latest */\n${js}`,
    "utf8"
  );

  // Log simples para saber o nome do arquivo gerado
  console.log(`[build-posthog] Wrote ${fileName}`);
}

// Executa a função principal e lida com possíveis erros
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
