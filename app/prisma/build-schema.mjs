/**
 * Construye prisma/schema.prisma a partir de los fragmentos en
 * prisma/fragments/ y de la lista de módulos activos.
 *
 * Fuente de activación: src/modules.config.ts (vía read-active-modules.mjs).
 * Directivas soportadas dentro de los fragmentos:
 *   // #gen-if(nombre_modulo)
 *   ...líneas que solo se incluyen si ese módulo está activo...
 *   // #gen-endif
 *
 * Uso:
 *   node prisma/build-schema.mjs
 *   npm run prisma:build-schema
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveActiveModules } from './read-active-modules.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRAGMENTS_DIR = path.join(__dirname, 'fragments');
const OUTPUT = path.join(__dirname, 'schema.prisma');

// Orden en que se concatenan los fragmentos de módulos opcionales.
// Las dependencias garantizan que un módulo vea los modelos de sus deps.
const OPTIONAL_ORDER = ['organizations', 'contacts'];

function applyDirectives(text, activeSet) {
  const lines = text.split(/\r?\n/);
  const out = [];
  // Stack de bloques condicionales anidados: {name, keep}
  const stack = [];
  const ifRe = /^\s*\/\/\s*#gen-if\(([^)]+)\)\s*$/;
  const endRe = /^\s*\/\/\s*#gen-endif\s*$/;

  for (const [i, line] of lines.entries()) {
    const ifM = line.match(ifRe);
    const endM = line.match(endRe);
    if (ifM) {
      const parent = stack[stack.length - 1];
      const parentKeep = parent ? parent.keep : true;
      const name = ifM[1].trim();
      stack.push({ name, keep: parentKeep && activeSet.has(name) });
      continue;
    }
    if (endM) {
      if (stack.length === 0) {
        throw new Error(`#gen-endif sin #gen-if (línea ${i + 1})`);
      }
      stack.pop();
      continue;
    }
    const top = stack[stack.length - 1];
    if (!top || top.keep) out.push(line);
  }
  if (stack.length) {
    throw new Error(
      `#gen-if sin cerrar: ${stack.map((s) => s.name).join(', ')}`,
    );
  }
  return out.join('\n');
}

function main() {
  const active = resolveActiveModules();
  const activeSet = new Set(active);

  const header =
    [
      '// ============================================================================',
      '// ARCHIVO GENERADO AUTOMÁTICAMENTE. NO EDITAR A MANO.',
      '// Fuente: prisma/fragments/ + src/modules.config.ts',
      '// Regenerar con: npm run prisma:build-schema',
      `// Módulos activos: ${active.join(', ')}`,
      '// ============================================================================',
      '',
      '',
    ].join('\n');

  let body = '';
  // Base (core: auth + users)
  const basePath = path.join(FRAGMENTS_DIR, 'base.prisma');
  body += applyDirectives(readFileSync(basePath, 'utf8'), activeSet);
  body += '\n';

  // Opcionales activos en orden determinista
  for (const mod of OPTIONAL_ORDER) {
    if (!activeSet.has(mod)) continue;
    const fragPath = path.join(FRAGMENTS_DIR, `${mod}.prisma`);
    if (!existsSync(fragPath)) {
      throw new Error(
        `Módulo "${mod}" activo pero no existe el fragmento ${fragPath}`,
      );
    }
    body += '\n';
    body += `// ---- Módulo opt-in: ${mod} -------------------------------------------------\n\n`;
    body += applyDirectives(readFileSync(fragPath, 'utf8'), activeSet);
    body += '\n';
  }

  writeFileSync(OUTPUT, header + body, 'utf8');
  console.log(`✓ prisma/schema.prisma generado`);
  console.log(`  Módulos activos: ${active.join(', ')}`);
}

main();
