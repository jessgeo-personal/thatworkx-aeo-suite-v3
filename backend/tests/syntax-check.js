#!/usr/bin/env node
/**
 * syntax-check.js - AEO Suite Syntax Integrity Checker
 *
 * Checks HTML and JS files for:
 *   HTML: unclosed/mismatched tags, hierarchy violations, malformed entities, duplicate IDs
 *   JS:   unmatched braces/brackets/parens, unclosed template literals
 *
 * Usage:
 *   node backend/tests/syntax-check.js [file1] [file2] ...
 *   (defaults to primary frontend HTML + JS files when no args supplied)
 *
 * Exit code: 0 = clean, 1 = errors found
 * Report saved to: backend/tests/reports/syntax-report-<timestamp>.txt
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const C = {
  reset : '\x1b[0m', bold : '\x1b[1m',
  red   : '\x1b[31m', yellow: '\x1b[33m',
  green : '\x1b[32m', cyan  : '\x1b[36m', grey: '\x1b[90m',
};
const col = (c, s) => c + s + C.reset;

const ROOT = path.resolve(__dirname, '../../');
const DEFAULT_FILES = [
  'frontend/index.html', 'frontend/visualize.html',
  'frontend/optimize.html', 'frontend/socialize.html',
  'frontend/index.js',
].map(f => path.join(ROOT, f));

// HTML5 void elements (self-closing by spec)
const VOID = new Set([
  'area','base','br','col','embed','hr','img','input',
  'link','meta','param','source','track','wbr',
]);

// ---- utilities -------------------------------------------------------
function buildLineMap(src) {
  const o = [0];
  for (let i = 0; i < src.length; i++) if (src[i] === '\n') o.push(i + 1);
  return o;
}

function charToLineCol(idx, lm) {
  let lo = 0, hi = lm.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (lm[mid] <= idx) lo = mid; else hi = mid - 1;
  }
  return { line: lo + 1, col: idx - lm[lo] + 1 };
}

// ---- HTML tokeniser --------------------------------------------------
function tokeniseHTML(src) {
  const tokens = [];
  const lm = buildLineMap(src);
  const RE = /<!--[\s\S]*?-->|<\/?([a-zA-Z][a-zA-Z0-9:-]*)((?:\s[^>]*?)?)(\/?)?>/g;
  let m;
  while ((m = RE.exec(src)) !== null) {
    if (m[0].startsWith('<!--')) continue;
    const name = m[1].toLowerCase();
    const self = m[3] === '/';
    const pos  = charToLineCol(m.index, lm);
    if (m[0].startsWith('</'))               tokens.push({ type:'close', tag:name, line:pos.line });
    else if (self || VOID.has(name))         tokens.push({ type:'self',  tag:name, line:pos.line });
    else                                     tokens.push({ type:'open',  tag:name, line:pos.line });
  }
  return tokens;
}

// ---- HTML checks -----------------------------------------------------
function checkHTML(src) {
  const errors = [];
  const lm     = buildLineMap(src);
  const lines  = src.split('\n');

  // 1. Tag balance and hierarchy
  const stack = [];
  for (const tok of tokeniseHTML(src)) {
    if (tok.type === 'open') {
      stack.push(tok);
    } else if (tok.type === 'close') {
      if (stack.length === 0) {
        errors.push({ line: tok.line, msg: `Unexpected closing tag </${tok.tag}> — no matching opener on stack` });
      } else if (stack[stack.length - 1].tag !== tok.tag) {
        const mi = stack.map(s => s.tag).lastIndexOf(tok.tag);
        if (mi === -1) {
          errors.push({ line: tok.line, msg: `Unexpected closing tag </${tok.tag}> — no matching opener found` });
        } else {
          stack.splice(mi + 1).reverse().forEach(o =>
            errors.push({ line: o.line, msg: `Hierarchy violation: <${o.tag}> (line ${o.line}) not closed before </${tok.tag}> (line ${tok.line})` })
          );
          stack.pop();
        }
      } else {
        stack.pop();
      }
    }
  }
  stack.forEach(o =>
    errors.push({ line: o.line, msg: `Unclosed <${o.tag}> opened at line ${o.line} — never closed` })
  );

  // 2. Malformed HTML entities (bare & not forming valid entity)
  lines.forEach((ln, i) => {
    const re = /&(?![a-zA-Z][a-zA-Z0-9]*;|#[0-9]+;|#x[0-9a-fA-F]+;)/g;
    let mm;
    while ((mm = re.exec(ln)) !== null) {
      errors.push({ line: i + 1, msg: `Malformed entity: bare '&' at col ${mm.index + 1} — use &amp; in HTML contexts` });
    }
  });

  // 3. Duplicate element IDs
  const idMap = {};
  const idRE  = /\bid="([^"]+)"/g;
  let im;
  while ((im = idRE.exec(src)) !== null) {
    const id  = im[1];
    const pos = charToLineCol(im.index, lm);
    if (!idMap[id]) idMap[id] = [];
    idMap[id].push(pos.line);
  }
  Object.entries(idMap).forEach(function(entry) {
    const id = entry[0]; const lineNums = entry[1];
    if (lineNums.length > 1)
      errors.push({ line: lineNums[0], msg: `Duplicate id="${id}" appears ${lineNums.length}x on lines: ${lineNums.join(', ')}` });
  });

  return errors;
}

// ---- JS checks -------------------------------------------------------
function checkJS(src) {
  const errors  = [];
  const openers = { '{': '}', '(': ')', '[': ']' };
  const closers = new Set(['}', ')', ']']);
  const stack   = [];
  let i = 0, line = 1, colN = 0;

  while (i < src.length) {
    const ch = src[i];

    if (ch === '\n') { line++; colN = 0; i++; continue; }
    colN++;

    // Single-line comment
    if (ch === '/' && src[i+1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    // Block comment
    if (ch === '/' && src[i+1] === '*') {
      i += 2;
      while (i < src.length - 1 && !(src[i] === '*' && src[i+1] === '/')) {
        if (src[i] === '\n') { line++; colN = 0; }
        i++;
      }
      i += 2; continue;
    }
    // Regular string (single or double quoted)
    if (ch === '"' || ch === "'") {
      const q = ch; i++;
      while (i < src.length && src[i] !== q) {
        if (src[i] === '\\') i++;
        if (src[i] === '\n') { line++; colN = 0; }
        i++;
      }
      i++; continue;
    }
    // Template literal
    if (ch === '`') {
      const startLine = line; i++;
      let closed = false;
      while (i < src.length) {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === '\n') { line++; colN = 0; }
        if (src[i] === '`') { closed = true; i++; break; }
        i++;
      }
      if (!closed) errors.push({ line: startLine, msg: `Unclosed template literal (backtick) starting at line ${startLine}` });
      continue;
    }
    // RegExp literal detection (e.g. /pattern/flags)
    if (ch === '/') {
      const prevNonWhitespace = src.slice(0, i).trim().slice(-1);
      const isRegexContext = ['=', '(', ',', ':', '[', '!', '&', '|', '?', ';'].includes(prevNonWhitespace) || prevNonWhitespace === '';
      if (isRegexContext && src[i+1] !== '/' && src[i+1] !== '*') {
        i++;
        while (i < src.length && src[i] !== '/') {
          if (src[i] === '\\') i++;
          if (src[i] === '\n') { line++; colN = 0; }
          i++;
        }
        i++; // skip trailing '/'
        while (i < src.length && /[a-z]/i.test(src[i])) i++; // skip flags (g, i, m, etc)
        continue;
      }
    }
    // Bracket/brace/paren balance
    if (openers[ch]) {
      stack.push({ char: ch, expected: openers[ch], line, col: colN });
    } else if (closers.has(ch)) {
      if (stack.length === 0) {
        errors.push({ line, msg: `Unexpected '${ch}' at line ${line} col ${colN} — no matching opener` });
      } else if (stack[stack.length - 1].expected !== ch) {
        const top = stack.pop();
        errors.push({ line, msg: `Mismatched: '${top.char}' opened line ${top.line} col ${top.col} expected '${top.expected}' but found '${ch}' at line ${line}` });
      } else {
        stack.pop();
      }
    }
    i++;
  }
  stack.forEach(o =>
    errors.push({ line: o.line, msg: `Unclosed '${o.char}' opened at line ${o.line} col ${o.col} — never closed` })
  );

  return errors;
}

// ---- Report renderer -------------------------------------------------
function renderReport(results) {
  let total = 0;
  console.log('');
  console.log(col(C.bold + C.cyan, 'AEO Suite - Syntax Integrity Report'));
  console.log(col(C.grey, '-'.repeat(72)));
  console.log('');
  for (const r of results) {
    const rel = path.relative(ROOT, r.file);
    const ext = path.extname(r.file).toLowerCase();
    const kind = ext === '.html' ? 'HTML' : ext === '.js' ? 'JS' : ext.toUpperCase();
    console.log(col(C.bold, `FILE: ${rel}  [${kind}]`));
    if (r.errors.length === 0) {
      console.log(col(C.green, '  OK - no syntax errors.'));
    } else {
      total += r.errors.length;
      r.errors.sort((a, b) => a.line - b.line).forEach(function(e, idx) {
        const tag = col(C.red, `[ERR ${String(idx+1).padStart(3)}]`);
        const ln  = col(C.yellow, `Line ${String(e.line).padEnd(5)}`);
        console.log(`  ${tag} ${ln} ${e.msg}`);
      });
      console.log(col(C.red, `  ${r.errors.length} error(s) in this file.`));
    }
    console.log('');
  }
  console.log(col(C.grey, '='.repeat(72)));
  console.log(total === 0
    ? col(C.green + C.bold, 'RESULT: All files passed. No syntax errors.')
    : col(C.red + C.bold, `RESULT: ${total} error(s) across ${results.filter(r=>r.errors.length>0).length} file(s). Fix above then re-run.`));
  console.log(col(C.grey, '='.repeat(72)));
  console.log('');
  return total;
}

// ---- Save plain-text report ------------------------------------------
function saveReport(results) {
  const dir = path.join(ROOT, 'backend', 'tests', 'reports');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const out   = path.join(dir, `syntax-report-${stamp}.txt`);
  const buf   = ['AEO Suite - Syntax Integrity Report', `Generated: ${new Date().toISOString()}`, ''];
  let total = 0;
  for (const r of results) {
    buf.push(`FILE: ${path.relative(ROOT, r.file)}`);
    buf.push('-'.repeat(72));
    if (r.errors.length === 0) {
      buf.push('  OK - no errors.');
    } else {
      total += r.errors.length;
      r.errors.sort((a,b)=>a.line-b.line).forEach(function(e,i) {
        buf.push(`  [ERR ${String(i+1).padStart(3)}]  Line ${e.line}  ${e.msg}`);
      });
      buf.push(`  ${r.errors.length} error(s).`);
    }
    buf.push('');
  }
  buf.push('='.repeat(72));
  buf.push(total === 0 ? 'RESULT: All files passed.' : `RESULT: ${total} error(s) - review above.`);
  fs.writeFileSync(out, buf.join('\n'), 'utf8');
  return out;
}

// ---- Main ------------------------------------------------------------
function main() {
  const args  = process.argv.slice(2);
  const files = args.length > 0
    ? args.map(f => path.isAbsolute(f) ? f : path.resolve(process.cwd(), f))
    : DEFAULT_FILES;

  const missing = files.filter(f => !fs.existsSync(f));
  if (missing.length) {
    console.error(col(C.red, `ERROR: File(s) not found:\n${missing.map(f=>'  '+f).join('\n')}`));
    process.exit(1);
  }

  const results = files.map(function(file) {
    const src = fs.readFileSync(file, 'utf8');
    const ext = path.extname(file).toLowerCase();
    let errors;
    if      (ext === '.html') errors = checkHTML(src);
    else if (ext === '.js')   errors = checkJS(src);
    else errors = [{ line: 1, msg: `Unsupported file type '${ext}' — only .html and .js are supported` }];
    return { file, errors };
  });

  const total   = renderReport(results);
  const rptPath = saveReport(results);
  console.log(col(C.grey, `  Report saved -> ${path.relative(ROOT, rptPath)}`));
  console.log('');
  process.exit(total > 0 ? 1 : 0);
}

main();
