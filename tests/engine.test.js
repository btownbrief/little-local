import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,planClear,pick,remaining,visible,counts,rearrange,hint,tick,clone,hash,validateSave} from '../dist/engine.js';

test('120 seeded boards across modes and themes have executable complete solutions',()=>{
  for(let seed=1;seed<=120;seed++){
    const s=createGame({seed,round:1+seed%15,mode:['cozy','rush','daily'][seed%3],theme:['market','bakery','lakeside'][Math.floor(seed/3)%3]});
    assert.ok(validateSave(s));const plan=planClear(s.shelves,10000);assert.ok(plan,`No plan for ${seed}`);
    for(const step of plan)for(const p of step.picks){assert.ok(pick(s,p.shelf,p.slot).ok);assert.ok(s.tray.length<=3);assert.ok(validateSave(s));}
    assert.equal(s.status,'won');assert.equal(remaining(s),0);assert.equal(s.matches,s.total/3);
  }
});
test('Daily seed and original puzzle are deterministic',()=>{
  const opts={mode:'daily',round:3,seed:hash('little-local:daily:v1:2026-09-12'),date:'2026-09-12'};
  const first=createGame(opts),again=createGame(opts);assert.deepEqual(first,again);
  assert.notDeepEqual(first.shelves,createGame({...opts,seed:hash('little-local:daily:v1:2026-09-13')}).shelves);
});
test('tap matches exactly three and rejects invalid or empty picks without changes',()=>{
  const s=createGame({seed:5});const before=clone(s);assert.equal(pick(s,90,0).ok,false);assert.deepEqual(s,before);
  const step=planClear(s.shelves)[0];for(let i=0;i<3;i++){const p=step.picks[i],r=pick(s,p.shelf,p.slot);assert.equal(r.matched,i===2);}
  assert.equal(s.tray.length,0);assert.equal(s.matches,1);assert.equal(remaining(s),s.total-3);
});
test('a full seven-slot basket prevents extra picks; rearrange preserves every remaining good and restores a solution',()=>{
  for(let seed=1;seed<=25;seed++){
    const s=createGame({seed,round:6});
    while(s.tray.length<7){const next=visible(s).find(p=>s.tray.filter(t=>t===p.type).length<2);if(!next)break;pick(s,next.shelf,next.slot);}
    assert.equal(s.tray.length,7);const before=clone(s),c=counts(s);const p=visible(s)[0];assert.equal(pick(s,p.shelf,p.slot).ok,false);assert.deepEqual(s,before);
    assert.ok(rearrange(s));assert.deepEqual(counts(s),c);assert.equal(s.tray.length,0);assert.ok(planClear(s.shelves,10000));assert.ok(validateSave(s));
  }
});
test('cozy never expires; Rush starts on first tap, expires, and permits an untimed finish',()=>{
  const cozy=createGame({seed:4});cozy.started=true;tick(cozy,999999);assert.equal(cozy.status,'playing');assert.equal(cozy.seconds,null);
  const rush=createGame({mode:'rush',seed:4});tick(rush,200);assert.equal(rush.seconds,120);const p=visible(rush)[0];pick(rush,p.shelf,p.slot);tick(rush,119);assert.equal(rush.seconds,1);tick(rush,1);assert.equal(rush.status,'timeout');assert.equal(pick(rush,0,0).ok,false);
  rush.status='playing';rush.clockDisabled=true;tick(rush,999999);assert.equal(rush.status,'playing');assert.ok(validateSave(rush));
});
test('Rush clock pauses for the last three items',()=>{
  const s=createGame({mode:'rush',seed:8});const plan=planClear(s.shelves);for(const step of plan.slice(0,-1))for(const p of step.picks)pick(s,p.shelf,p.slot);
  assert.equal(remaining(s),3);s.seconds=.2;tick(s,60);assert.equal(s.seconds,.2);assert.equal(s.status,'playing');
});
test('hints lead an untouched generated board all the way to a clear',()=>{
  const s=createGame({seed:47,round:7});for(let i=0;i<30&&s.status==='playing';i++){const h=hint(s);assert.ok(h);for(const p of h.picks)pick(s,p.shelf,p.slot);}assert.equal(s.status,'won');
});
test('undo snapshot restores stock, score, match and basket state',()=>{
  let s=createGame({seed:11});const step=planClear(s.shelves)[0];pick(s,step.picks[0].shelf,step.picks[0].slot);pick(s,step.picks[1].shelf,step.picks[1].slot);const snapshot=clone(s);pick(s,step.picks[2].shelf,step.picks[2].slot);assert.equal(s.matches,1);s=clone(snapshot);assert.equal(s.matches,0);assert.equal(s.tray.length,2);assert.equal(s.score,0);assert.ok(validateSave(s));
});
test('malformed saves are rejected and valid JSON round-trips',()=>{
  const s=createGame({seed:1});assert.ok(validateSave(JSON.parse(JSON.stringify(s))));assert.equal(validateSave(null),false);assert.equal(validateSave({...s,tray:[44]}),false);assert.equal(validateSave({...s,matches:999}),false);assert.equal(validateSave({...s,shelves:[null]}),false);assert.equal(validateSave({...s,elapsed:NaN}),false);
});
