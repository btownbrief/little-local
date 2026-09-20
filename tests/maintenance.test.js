import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {checkVersion} from '../scripts/check-sw-version.mjs';
import {costRanges,runBatches,searchOptions} from '../scripts/shelf-batches.mjs';
import {LEVEL_COUNT} from '../dist/content.js';

const sw=version=>`const CACHE='little-local-offline-v${version}';`;
test('cache check rejects unchanged, older and malformed release versions',()=>{
  assert.deepEqual(checkVersion(sw('3.2'),sw('3.1')),{current:'3.2',prior:'3.1'});
  assert.doesNotThrow(()=>checkVersion(sw('3.10'),sw('3.9')));
  for(const [local,release] of [['3.1','3.1'],['3.0','3.1'],['2.9','3.1'],['3.1.0','3.1']])assert.throws(()=>checkVersion(sw(local),sw(release)),/Bump/);
  assert.throws(()=>checkVersion('',sw('3.1')),/invalid/);
  assert.throws(()=>checkVersion(sw('3.2'),'<html>Unavailable</html>'),/invalid/);
});

test('worker ranges cover every remaining puzzle once with balanced search budgets',()=>{
  const ranges=costRanges(11,LEVEL_COUNT),ids=[],costs=[];
  for(const [start,end] of ranges){
    let cost=0;for(let id=start;id<=end;id++){ids.push(id);cost+=searchOptions(id).maxNodes;}costs.push(cost);
  }
  assert.equal(ranges.length,6);
  assert.deepEqual(ids,Array.from({length:LEVEL_COUNT-10},(_,i)=>i+11));
  assert.ok(Math.max(...costs)-Math.min(...costs)<=85000,JSON.stringify(costs));
});

function workers(){
  const instances=[];
  class TestWorker extends EventEmitter{
    constructor(){super();this.stops=0;instances.push(this);}
    async terminate(){this.stops++;this.emit('exit',1);return 1;}
  }
  return {instances,WorkerClass:TestWorker};
}

test('each worker stops immediately on completion',async()=>{
  const {instances,WorkerClass}=workers();
  const job=runBatches([[11,20],[21,30]],{WorkerClass});
  instances[0].emit('message',{done:true});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(instances[0].stops,1);assert.equal(instances[1].stops,0);
  instances[1].emit('message',{done:true});await job;
  assert.deepEqual(instances.map(w=>w.stops),[1,1]);
});

test('cancellation and worker errors stop all peers',async()=>{
  for(const reason of ['abort','error','exit']){
    const {instances,WorkerClass}=workers(),controller=new AbortController();
    const job=runBatches([[11,20],[21,30]],{WorkerClass,signal:controller.signal});
    const rejected=assert.rejects(job);
    if(reason==='abort')controller.abort(new Error('Cancelled'));
    if(reason==='error')instances[0].emit('error',new Error('Search stopped'));
    if(reason==='exit')instances[0].emit('exit',0);
    await rejected;
    assert.deepEqual(instances.map(w=>w.stops),[1,1]);
  }
});
