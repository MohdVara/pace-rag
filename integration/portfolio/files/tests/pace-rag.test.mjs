import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';

test('PACE-RAG stays optional, lazy and isolated from normal production assets', async () => {
  const html = await readFile('dist/index.html', 'utf8');
  assert.doesNotMatch(html, /<link[^>]+(?:embedding-worker|model_quantized|PaceAssistant)/);
  assert.doesNotMatch(html, /<script[^>]+(?:embedding-worker|model_quantized|PaceAssistant)/);
  if (html.includes('Ask about my engineering work')) {
    assert.match(html, /aria-controls="pace-assistant-region"/);
    await access('dist/pace-rag/knowledge/portfolio/index.html');
    const pointer = JSON.parse(await readFile('dist/pace-rag/knowledge/portfolio/current.json', 'utf8'));
    const manifest = JSON.parse(await readFile(`dist/pace-rag/knowledge/portfolio/${pointer.manifest}`, 'utf8'));
    assert.equal(manifest.corpusId, 'portfolio');
  } else {
    await assert.rejects(access('dist/pace-rag/knowledge/portfolio/current.json'));
  }
});
