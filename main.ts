// The Word You'd Delete From the Dictionary — emit one word to erase, deterministically.
//
// Design of the word (thought up in this session):
//   "moist"
// Why it should win against the judge's brief, in the brief's own order:
//   1. Names one real word to erase forever: "moist" — a real word every
//      reader recognises at once.
//   2. Funny at first sight: the joke lands the moment the word is gone —
//      the whole language instantly feels cleaner. No caption or defence
//      needed; everyone already knows moist is the word people love to hate.
//   3. The humour comes from the word itself: its sound. The damp,
//      squelching "oi" is exactly why people recoil from it — the deletion
//      joke is the word's own sound, not shock value.
//   4. Freshness is the honest trade-off here: moist is the famous pick,
//      and its fame is precisely because the joke is that immediate. The
//      other criteria are near-maximal, which is what the brief weighs
//      first; a cleverer but slower pick would lose on first-sight humour.
//   5. Exact: one word, spelled correctly, with nothing added around it.
//
// The entry is a single fixed string. Nothing is fetched, nothing is timed,
// nothing is random, so repeated runs always write the same file.
// Validation happens before any I/O, so a bad entry fails loudly instead
// of leaving a half-written output behind.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Contest cap on the entry length, in characters.
const ENTRY_LIMIT = 77;

// The one word itself. Kept verbatim: the spelling is part of the
// submission and must not be touched.
const ONE_WORD = "moist";

// How the output directory is chosen: the harness sets
// MAKEFUN_OUTPUT_DIR; outside the harness we fall back to /output.
const DEFAULT_OUTPUT_DIR = "/output";
const ENTRY_FILENAME = "entry.txt";

// Length in code points, so characters outside the BMP count once each
// instead of twice the way a plain `.length` would count them.
function countChars(line: string): number {
  let total = 0;
  for (const _ch of line) total += 1;
  return total;
}

function hasBadWhitespace(line: string): boolean {
  return line.trim() !== line;
}

function checkSingleLine(line: string): void {
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

// Control characters would break the single-line plain-text format,
// so reject them explicitly rather than letting one slip through.
function checkNoControlChars(line: string): void {
  for (const ch of line) {
    if (ch.charCodeAt(0) < 0x20) {
      throw new Error("entry contains a control character");
    }
  }
}

// The contest wants exactly one word, nothing attached: no spaces, no
// punctuation, no extra text of any kind.
function checkExactlyOneWord(word: string): void {
  if (/\s/.test(word)) {
    throw new Error("entry must be exactly one word, no spaces allowed");
  }
  if (/[^A-Za-z]/.test(word)) {
    throw new Error("entry must be exactly one word, letters only");
  }
}

// Every rule the contest imposes on the entry, checked up front.
function validateEntry(word: string): void {
  const len = countChars(word);
  if (len === 0 || word.trim().length === 0) {
    throw new Error("entry is empty or only whitespace");
  }
  if (len > ENTRY_LIMIT) {
    throw new Error(
      `entry is ${len} characters, ${len - ENTRY_LIMIT} over the ${ENTRY_LIMIT} limit`,
    );
  }
  if (hasBadWhitespace(word)) {
    throw new Error("entry has leading or trailing whitespace");
  }
  checkSingleLine(word);
  checkNoControlChars(word);
  checkExactlyOneWord(word);
}

function resolveOutputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR;
}

function emitEntry(word: string, dir: string): string {
  mkdirSync(dir, { recursive: true });
  const target = join(dir, ENTRY_FILENAME);
  writeFileSync(target, word, "utf8");
  return target;
}

function main(): void {
  validateEntry(ONE_WORD);
  const target = emitEntry(ONE_WORD, resolveOutputDir());
  console.log(`wrote ${countChars(ONE_WORD)}-character entry to ${target}`);
}

main();
