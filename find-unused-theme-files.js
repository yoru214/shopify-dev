// find-unused-theme-files.js
const fs = require('fs');
const path = require('path');

const THEME_DIR = process.cwd();
const SECTIONS_DIR = path.join(THEME_DIR, 'sections');
const SNIPPETS_DIR = path.join(THEME_DIR, 'snippets');
const TEMPLATES_DIR = path.join(THEME_DIR, 'templates');

let referencedSections = new Set();
let referencedSnippets = new Set();

function readLiquidReferences(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sectionMatches = [...content.matchAll(/['"]section[\/'-]([a-zA-Z0-9_-]+)\.liquid['"]/g)].map(
    (m) => m[1] + '.liquid'
  );
  const snippetMatches = [...content.matchAll(/{%\s*render\s+['"]([a-zA-Z0-9_-]+)['"]\s*.*?%}/g)].map(
    (m) => m[1] + '.liquid'
  );

  sectionMatches.forEach((s) => referencedSections.add(s));
  snippetMatches.forEach((s) => referencedSnippets.add(s));
}

function readJsonReferences(filePath) {
  try {
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const sections = json.sections
      ? Object.values(json.sections)
          .filter((s) => s && typeof s.type === 'string')
          .map((s) => s.type + '.liquid')
      : [];

    console.log(`Parsed ${path.basename(filePath)} → sections:`, sections);

    sections.forEach((s) => referencedSections.add(s));
  } catch (err) {
    console.warn(`⚠️  Failed to parse JSON from ${filePath}: ${err.message}`);
  }
}

function collectReferences(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (file.endsWith('.liquid')) {
      readLiquidReferences(fullPath);
    } else if (file.endsWith('.json')) {
      readJsonReferences(fullPath);
    }
  });
}

function getUnusedFiles(directory, referencedSet) {
  return fs.existsSync(directory)
    ? fs.readdirSync(directory).filter((file) => file.endsWith('.liquid') && !referencedSet.has(file))
    : [];
}

function main() {
  collectReferences(TEMPLATES_DIR);
  collectReferences(SECTIONS_DIR);

  const unusedSections = getUnusedFiles(SECTIONS_DIR, referencedSections);
  const unusedSnippets = getUnusedFiles(SNIPPETS_DIR, referencedSnippets);

  console.log('\n🧹 Unused Sections:');
  if (unusedSections.length === 0) console.log('  (none)');
  else unusedSections.forEach((s) => console.log('  -', s));

  console.log('\n🧹 Unused Snippets:');
  if (unusedSnippets.length === 0) console.log('  (none)');
  else unusedSnippets.forEach((s) => console.log('  -', s));
}

main();
