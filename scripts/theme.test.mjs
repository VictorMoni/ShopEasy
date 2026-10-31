
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../frontend/public/theme.js', import.meta.url), 'utf8');
function setup(saved, systemDark = false, blocked = false) {
  const listeners = {};
  const root = { dataset: {}, style: {}, classList: { toggle(name, on) { this[name] = on; } } };
  const media = { matches: systemDark, addEventListener(_, fn) { listeners.media = fn; } };
  const window = { matchMedia: () => media, dispatchEvent() {}, addEventListener(name, fn) { listeners[name] = fn; } };
  const storage = { getItem() { if (blocked) throw Error('blocked'); return saved; } };
  runInNewContext(source, { document: { documentElement: root }, window, localStorage: storage, Event: class {} });
  return { root, media, listeners };
}
test('saved light and dark preferences override the operating system', () => {
  assert.equal(setup('light', true).root.style.colorScheme, 'light');
  assert.equal(setup('dark', false).root.style.colorScheme, 'dark');
});
test('missing or invalid preferences follow the system', () => {
  assert.equal(setup(null, true).root.style.colorScheme, 'dark');
  assert.equal(setup('invalid', false).root.style.colorScheme, 'light');
});
test('storage restrictions do not prevent the theme from loading', () => {
  assert.equal(setup(null, true, true).root.style.colorScheme, 'dark');
});
test('system and other-tab changes update the page', () => {
  const state = setup(null, false);
  state.media.matches = true;
  state.listeners.media();
  assert.equal(state.root.style.colorScheme, 'dark');
  state.media.matches = false;
  state.listeners.storage({ key: null });
  assert.equal(state.root.style.colorScheme, 'light');
});
