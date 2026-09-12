import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,planClear,pick,hash,remaining,counts,clone,rearrange,validateSave,advanceShelves,starsFor,tick} from '../dist/engine.js';
import {LEVEL_COUNT,CHAPTERS,levelSpec,GOODS,THEMES} from '../dist/content.js';
import {freshProfile,normalizeProfile,finishDelivery,nextTrailLevel,backup,parseBackup} from '../dist/profile.js';
function solve(s){const plan=planClear(s.shelves,25000);assert.ok(plan,`Solution missing for ${s.mode} ${s.levelId||s.seed}`);for(const m of plan)for(const p of m.picks){assert.equal(pick(s,p.shelf,p.slot).ok,true);assert.ok(validateSave(s));}assert.equal(s.status,'won');assert.equal(remaining(s),0);return s;}
test('every one of the 600 released Trail boards is distinct and has an executable complete solution',()=>{
  const layouts=new Set(),seen=new Set();
  for(let id=1;id<=LEVEL_COUNT;id++){const s=createGame({mode:'trail',levelId:id,seed:hash('little-local:trail:v2:'+id)});layouts.add(JSON.stringify(s.shelves));counts(s).forEach((n,i)=>n&&seen.add(i));solve(s);assert.equal(starsFor(s),3);assert.equal(s.levelId,id);assert.equal(s.spec.chapterIndex,Math.floor((id-1)/50));}
  assert.equal(layouts.size,600);assert.equal(seen.size,24);assert.equal(CHAPTERS.length,12);
});
test('both Grand Pantry sizes across six shops preserve all stock through a full clear',()=>{for(const size of [72,144])for(const theme of Object.keys(THEMES))for(let seed=1;seed<=3;seed++){const s=createGame({mode:'pantry',size,theme,seed});assert.equal(s.total,size);assert.equal(s.shelves.length,size===72?8:12);solve(s);}});
test('ribbons count down on matches and conveyor front rows rotate without moving back stock',()=>{
  const shelves=[{lock:1,rows:[[0,1,2],[3,4,5]]},{belt:true,rows:[[6,null,7],[8,8,8]]},{belt:true,rows:[[9,10,11],[0,0,0]]}];
  const event=advanceShelves(shelves);assert.deepEqual(event.unlocked,[0]);assert.equal(shelves[0].lock,0);assert.deepEqual(shelves[1].rows,[[9,10,11],[8,8,8]]);assert.deepEqual(shelves[2].rows,[[6,null,7],[0,0,0]]);
  const s=createGame({mode:'trail',levelId:51,seed:2}),locked=s.shelves.findIndex(x=>x.lock>0),before=clone(s);assert.ok(locked>=0);assert.equal(pick(s,locked,0).ok,false);assert.deepEqual(s,before);
});
test('late Trail and Pantry recoveries conserve goods and guarantee a fresh playable board',()=>{
  for(const mode of ['trail','pantry'])for(let seed=1;seed<=12;seed++){const s=createGame({mode,levelId:600,seed});const plan=planClear(s.shelves,25000);for(const p of plan[0].picks)pick(s,p.shelf,p.slot);const before=counts(s);rearrange(s);assert.deepEqual(counts(s),before);solve(s);}
});
test('lanterns are earned every three matches, capped at three; neighbor orders are optional',()=>{
  const s=createGame({mode:'trail',levelId:10,seed:9});assert.ok(s.order);solve(s);assert.equal(s.lanterns,3);assert.equal(s.order.fulfilled,true);assert.equal(s.order.missed,false);
  const missed=createGame({mode:'cozy',round:3,seed:4});missed.order={type:23,target:1,done:0,within:1,fulfilled:false,missed:false};solve(missed);assert.equal(missed.order.missed,true);assert.equal(missed.status,'won');
});
test('profile migration preserves v1 progress and in-progress games without granting invented goods',()=>{
  const game=createGame({seed:21});game.version=1;delete game.matchedGoods;delete game.lanterns;delete game.spec;
  const p=normalizeProfile({version:1,settings:{sound:true,theme:'bakery'},completed:17,totalMatches:245,bestCombo:8,sessions:{cozy:{state:game,history:[]}},dailyBest:{'2026-09-11':{moves:54,helps:2,score:1400,seconds:200}},mode:'cozy'});
  assert.equal(p.completed,17);assert.equal(p.totalMatches,245);assert.equal(p.uniqueGoods,0);assert.equal(p.sessions.cozy.state.version,2);assert.equal(p.settings.sound,true);assert.equal(p.dailyDays,1);assert.equal(p.sessions.cozy.state.seed,21);
});
test('wins award progress once, replay improves medals without duplicating unique Trail levels, and backups round trip',()=>{
  const p=freshProfile(),s=solve(createGame({mode:'trail',levelId:1,seed:hash('little-local:trail:v2:1')}));const earned=finishDelivery(p,s);assert.ok(earned.length);assert.equal(p.completed,1);assert.equal(p.trailWins,1);assert.equal(p.trailStars,3);assert.equal(p.collection.reduce((a,b)=>a+b,0),s.total);assert.equal(nextTrailLevel(p),2);finishDelivery(p,s);assert.equal(p.completed,1);
  const again=solve(createGame({mode:'trail',levelId:1,seed:2}));finishDelivery(p,again);assert.equal(p.completed,2);assert.equal(p.trailWins,1);assert.equal(p.trailStars,3);
  p.sessions.trail={state:s,history:[]};assert.deepEqual(parseBackup(backup(p)),normalizeProfile(p));assert.throws(()=>parseBackup('{"format":"wrong"}'));
});
test('untimed Rush finishes never earn timed Rush achievements and low assist Daily records win',()=>{
  const p=freshProfile(),s=createGame({mode:'rush',seed:8});s.clockDisabled=true;solve(s);finishDelivery(p,s);assert.equal(p.rushWins,0);
  const a=solve(createGame({mode:'daily',date:'2026-09-12',seed:4}));a.hints=3;finishDelivery(p,a);
  const b=solve(createGame({mode:'daily',date:'2026-09-12',seed:4}));b.hints=1;finishDelivery(p,b);assert.equal(p.dailyDays,1);assert.equal(p.dailyBest[b.date].helps,1);
});
test('malformed imported mechanics, orders, and completion states are rejected',()=>{
  const original=createGame({mode:'trail',levelId:51,seed:7});
  for(const corrupt of [s=>s.spec.chainGoal='<img>',s=>s.spec.mechanics=['unknown'],s=>s.order={type:99,within:2,target:1,done:0},s=>s.status='won',s=>s.levelId=601,s=>s.matchedGoods=[-1]]){const bad=clone(original);corrupt(bad);assert.equal(validateSave(bad),false);}
});
