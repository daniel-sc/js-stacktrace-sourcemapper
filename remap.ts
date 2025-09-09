#!/usr/bin/env node

/**
 * Portable stacktrace remapper for Node.js, Bun, and Deno (with --compat).
 * Usage:
 *   bun run remap.ts <stacktrace-file>
 *   tsc remap.ts && node remap.js <stacktrace-file>
 *   deno run --compat --allow-net --allow-read remap.ts <stacktrace-file>
 */

import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';
import { SourceMapConsumer, type RawSourceMap } from "source-map";

// Simple file system cache
const CACHE_DIR = process.env.STACKTRACE_SOURCEMAP_CACHE_DIR || ".sourcemapper-cache";
function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}
function urlToCachePath(url: string): string {
  const key = Buffer.from(url).toString('base64url');
  return `${CACHE_DIR}/${key}`;
}
function tryReadCache(url: string): string | null {
  try {
    ensureCacheDir();
    const p = urlToCachePath(url);
    if (existsSync(p)) {
      const data = readFileSync(p, 'utf8');
      console.debug(`[DEBUG] Cache hit for ${url} -> ${p} (${data.length} bytes)`);
      return data;
    }
  } catch (e) {
    console.warn(`[WARN] Failed to read cache for ${url}:`, e);
  }
  return null;
}
function writeCache(url: string, text: string): void {
  try {
    ensureCacheDir();
    const p = urlToCachePath(url);
    writeFileSync(p, text, 'utf8');
    console.debug(`[DEBUG] Wrote cache for ${url} -> ${p} (${text.length} bytes)`);
  } catch (e) {
    console.warn(`[WARN] Failed to write cache for ${url}:`, e);
  }
}

// Fetch remote or local resources with cache
async function fetchText(url: string): Promise<string> {
  const cached = tryReadCache(url);
  if (cached != null) return cached;
  console.debug(`[DEBUG] Fetching URL: ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`[ERROR] Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  console.debug(`[DEBUG] Fetched ${text.length} bytes from ${url}`);
  writeCache(url, text);
  return text;
}

// Extract sourceMappingURL from JS content
function extractSourceMappingURL(js: string): string | null | undefined {
  console.debug(`[DEBUG] Extracting sourceMappingURL`);
  const regex = /\/\/[#@]\s*sourceMappingURL\s*=\s*(\S+)\s*$/m;
  const match = regex.exec(js);
  const mapUrl = match ? match[1] : null;
  console.debug(`[DEBUG] sourceMappingURL ${mapUrl ? `found: ${mapUrl}` : 'not found'}`);
  return mapUrl;
}

// Create a SourceMapConsumer for a given script URL
async function getSourceMapConsumer(scriptURL: string): Promise<SourceMapConsumer | null> {
  console.debug(`[DEBUG] getSourceMapConsumer for ${scriptURL}`);
  try {
    const jsText = await fetchText(scriptURL);
    let mapURL = extractSourceMappingURL(jsText);
    if (mapURL) {
      mapURL = new URL(mapURL, scriptURL).href;
      console.debug(`[DEBUG] Resolved source map URL: ${mapURL}`);
    } else {
      const urlObj = new URL(scriptURL);
      const base = urlObj.pathname.split("/").pop() || "";
      const nameNoExt = base.replace(/\.js$/, "");
      urlObj.pathname = urlObj.pathname.replace(base, `${nameNoExt}.map`);
      mapURL = urlObj.href;
      console.debug(`[DEBUG] Fallback source map URL: ${mapURL}`);
    }
    const mapText = await fetchText(mapURL);
    const rawMap = JSON.parse(mapText) as RawSourceMap;
    const consumer = await new SourceMapConsumer(rawMap);
    console.debug(`[DEBUG] Created SourceMapConsumer for ${scriptURL}`);
    return consumer;
  } catch (err) {
    console.error(`[ERROR] Could not load source map for ${scriptURL}:`, err);
    return null;
  }
}

// Split stack trace into lines
function parseStackLines(input: string): string[] {
  return input.split(/\r?\n/);
}

// Remap each line using available source maps
async function remapStackTrace(input: string): Promise<string> {
  console.debug(`[DEBUG] Starting remapping`);
  const lines = parseStackLines(input);
  const pattern = /(https?:\/\/[^^\s\)]+\.js):(\d+):(\d+)/;
  const consumers = new Map<string, SourceMapConsumer | null>();

  console.debug(`[DEBUG] Preloading source maps`);
  for (const line of lines) {
    const m = pattern.exec(line);
    if (m) {
      const scriptURL = m[1]!;
      if (!consumers.has(scriptURL)) {
        console.debug(`[DEBUG] Loading source map for ${scriptURL}`);
        consumers.set(scriptURL, await getSourceMapConsumer(scriptURL));
      }
    }
  }

  console.debug(`[DEBUG] Remapping frames`);
  const remapped = lines.map(line => {
    console.debug(`[DEBUG] Line: ${line}`);
    // Pattern 1: V8 style: "at name (url.js:line:col)" or "at url.js:line:col"
    const m1 = /at\s*(.*)\s+\(?(https?:\/\/[^^\s\)]+\.js):(\d+):(\d+)\)?/.exec(line);
    if (m1) {
      const [full, name, scriptURL, lineStr, colStr] = m1;
      const consumer = consumers.get(scriptURL!);
      if (!consumer) {
        console.warn(`[WARN] No source map for ${scriptURL}`);
        return line;
      }
      const orig = consumer.originalPositionFor({
        line: +lineStr!,
        column: +colStr!,
        bias: SourceMapConsumer.GREATEST_LOWER_BOUND,
      });
      if (orig && orig.source && orig.line != null && orig.column != null) {
        const repl = `at ${orig.name || name} (${orig.source}:${orig.line}:${orig.column})`;
        console.debug(`[DEBUG] Mapped ${full} -> ${repl}`);
        return line.replace(full, repl);
      } else {
        console.warn(`[WARN] Could not map ${full}`);
        return line;
      }
    }

    // Pattern 2: Firefox style: "name@url.js:line:col" or "@url.js:line:col"
    const m2 = /^\s*(?:(.*?)@)?(https?:\/\/[^^\s\)]+\.js):(\d+):(\d+)\s*$/.exec(line);
    if (m2) {
      const [full, rawName, scriptURL, lineStr, colStr] = m2;
      const consumer = consumers.get(scriptURL!);
      if (!consumer) {
        console.warn(`[WARN] No source map for ${scriptURL}`);
        return line;
      }
      const orig = consumer.originalPositionFor({
        line: +lineStr!,
        column: +colStr!,
        bias: SourceMapConsumer.GREATEST_LOWER_BOUND,
      });
      if (orig && orig.source && orig.line != null && orig.column != null) {
        const hasName = rawName != null && rawName !== "";
        const func = (orig.name || rawName || "");
        const mapped = hasName
          ? `${func}@${orig.source}:${orig.line}:${orig.column}`
          : `@${orig.source}:${orig.line}:${orig.column}`;
        console.debug(`[DEBUG] Mapped ${full} -> ${mapped}`);
        return mapped; // full line is the match
      } else {
        console.warn(`[WARN] Could not map ${full}`);
        return line;
      }
    }

    return line;
  });

  consumers.forEach((c, url) => { if (c) c.destroy(); });
  console.debug(`[DEBUG] Completed remapping`);
  return remapped.join("\n");
}

// Entry point: read from file or stdin
async function main() {
  console.debug(`[DEBUG] Script started`);
  const input = process.argv[2]
    ? readFileSync(process.argv[2], "utf8")
    : readFileSync(process.stdin.fd, "utf8");

  console.debug(`[DEBUG] Input length: ${input.length}`);
  console.log(await remapStackTrace(input));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
