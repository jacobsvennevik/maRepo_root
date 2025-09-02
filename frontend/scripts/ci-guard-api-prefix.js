#!/usr/bin/env node
/*
  Fallback guard to detect browser code calling /api/* directly.
  Scans common source roots and fails if it finds offending patterns.
*/

const fs = require('fs');
const path = require('path');

const roots = ['src', 'apps', 'packages'];
const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts', '.mjs', '.cjs']);
const pattern = /(fetch|axios[A-Za-z]*)\(\s*['"]\/api\//;

/** @type {string[]} */
const offenders = [];

function walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return; // directory may not exist
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'dist' || entry.name === 'build' || entry.name.startsWith('.')) {
        continue;
      }
      walk(full);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (!exts.has(ext)) continue;
      let content;
      try {
        content = fs.readFileSync(full, 'utf8');
      } catch (e) {
        continue;
      }
      if (pattern.test(content)) {
        // collect line numbers
        const lines = content.split(/\r?\n/);
        lines.forEach((line, idx) => {
          if (pattern.test(line)) {
            offenders.push(`${full}:${idx + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

roots.forEach((root) => walk(path.resolve(process.cwd(), root)));

if (offenders.length > 0) {
  console.error('❌ Stop calling /api from browser. Offending lines:');
  offenders.forEach((o) => console.error(o));
  process.exit(1);
} else {
  console.log('✅ No /api/* browser calls detected');
}


