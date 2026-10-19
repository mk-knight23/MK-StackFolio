const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = {module: {exports: {}}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/js/project-explorer.js'), 'utf8'), context);
const {matches, parseCommand} = context.module.exports;
test('project search supports multiple disciplines and literal hostile input', () => {
  assert.equal(matches('Python FastAPI Claude adapter', 'python claude', 'backend', 'ai backend'), true);
  assert.equal(matches('Python FastAPI Claude adapter', 'python claude', 'tools', 'ai backend'), false);
  assert.equal(matches('Café workflows', 'cafe', 'all', 'tools'), true);
  assert.equal(matches('Python API', '<script>', 'all', 'backend'), false);
  assert.equal(matches('Python API', '.*', 'all', 'backend'), false);
});
test('terminal accepts only navigation commands and treats executable text as unknown', () => {
  assert.equal(parseCommand(' /AI '), 'ai');
  assert.equal(parseCommand('contact'), 'contact');
  for (const command of ['__proto__', 'constructor', 'alert(1)', 'https://evil.example', 'ai; contact', '']) assert.equal(parseCommand(command), 'unknown');
});
test('explorer retains inspectable content without JavaScript and includes crawler discovery', () => {
  const page = fs.readFileSync(path.join(__dirname, '../public/explore.html'), 'utf8');
  assert.equal((page.match(/data-project-card/g) || []).length, 5);
  assert.equal((page.match(/<details>/g) || []).length, 5);
  assert.match(page, /Messages API calls remains on the roadmap/);
  assert.match(page, /aria-live="polite"/);
  assert.match(fs.readFileSync(path.join(__dirname, '../public/sitemap.xml'), 'utf8'), /\/explore<\/loc>/);
  assert.doesNotMatch(fs.readFileSync(path.join(__dirname, '../public/js/project-explorer.js'), 'utf8'), /innerHTML|eval\(|new Function/);
});
