import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
test('the offline manifest contains every local module and original art asset, and all files exist',async()=>{
  const root=resolve('dist'),sw=await readFile(resolve(root,'sw.js'),'utf8'),files=JSON.parse(sw.match(/const FILES=(\[[^;]+\]);/)[1].replaceAll("'",'"'));
  for(const f of files)assert.ok((await stat(resolve(root,f))).isFile()||f==='./');
  for(const f of ['app.js','engine.js','content.js','profile.js','audio.js','shelf-rules.js','shelf-engine.js','shelf-catalog.js','shelf-ui.js','shelf-worker.js','assets/goods-atlas.png','assets/goods-expansion.png','assets/shop-interior.png'])assert.ok(files.includes('./'+f));
  const manifest=JSON.parse(await readFile(resolve(root,'manifest.webmanifest'),'utf8'));assert.equal(manifest.display,'standalone');for(const icon of manifest.icons){const bytes=await readFile(resolve(root,icon.src));assert.equal(bytes.toString('hex',0,8),'89504e470d0a1a0a');}
});
