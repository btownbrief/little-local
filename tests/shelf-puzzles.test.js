import test from 'node:test';
import assert from 'node:assert/strict';
import {createShelfGame,moveShelfGood,puzzleStars,referenceHint,validateShelfGame,nextPuzzle} from '../dist/shelf-engine.js';
import {SHELF_PUZZLES} from '../dist/shelf-catalog.js';
import {shiftGood,shelfSpaces,shelfMoves,shelfKey,firstMatchDepth} from '../dist/shelf-rules.js';
import {freshProfile,normalizeProfile,finishDelivery,backup,parseBackup} from '../dist/profile.js';
import {createGame,pick,rearrange,validateSave,upgradeGame,clone,tick,counts} from '../dist/engine.js';

test('all 600 shelf puzzles have executable full solutions, fair move targets, distinct layouts, and conserved goods',()=>{
  assert.equal(SHELF_PUZZLES.length,600);const seen=new Set();
  for(const entry of SHELF_PUZZLES){
    const s=createShelfGame(entry.id);seen.add(shelfKey(s.shelves));
    assert.ok(validateSave(s));assert.ok(s.shelves.some(sh=>sh.lock));assert.ok(shelfSpaces(s.shelves)>=4&&shelfSpaces(s.shelves)<=5);
    const starting=counts(s);let unlocked=0,first=0;
    for(const move of shelfMoves(s.shelves))assert.equal(shiftGood(s.shelves,move).matches.length,0,'no one-move opening matches');
    for(const [i,move] of entry.route.entries()){
      const r=moveShelfGood(s,move);assert.ok(r.ok,`Puzzle ${entry.id}, move ${i+1}`);unlocked+=r.unlocked.length;if(r.matches.length&&!first)first=i+1;
      assert.ok(validateShelfGame(s),`Invalid state ${entry.id}, move ${i+1}`);assert.equal(s.tray.length,0);
    }
    assert.ok(first>=3);assert.ok(unlocked>=1);assert.equal(s.status,'won');assert.equal(s.moves,s.spec.target);assert.equal(puzzleStars(s),3);assert.deepEqual(s.matchedGoods,starting);
  }
  assert.equal(seen.size,600);
});

test('the default is the harder shelf mode and puzzle one needs four moves before any match',()=>{
  assert.equal(freshProfile().mode,'puzzle');assert.equal(freshProfile().settings.difficulty,'brainy');
  const s=createShelfGame(1);assert.equal(firstMatchDepth(s.shelves,6,100000),4);assert.equal(s.spec.target,30);
  tick(s,5000);assert.equal(s.status,'playing');moveShelfGood(s,SHELF_PUZZLES[0].route[0]);tick(s,5000);assert.equal(s.status,'playing');
});

test('shelf placement rejects occupied slots, locked shelves, same-shelf moves, and legacy basket/rearrange shortcuts',()=>{
  const s=createShelfGame(1),before=clone(s),locked=s.shelves.findIndex(sh=>sh.lock);
  for(const move of [[0,1,0,0],[0,1,1,1],[locked,0,0,0],[0,1,locked,0],[-1,0,0,0],[0,1,1,8],[0,1,1,NaN]])assert.equal(moveShelfGood(s,move).ok,false);
  assert.equal(pick(s,0,1).ok,false);assert.equal(rearrange(s),false);assert.deepEqual(s,before);
});

test('a specific key match opens its shelf; ordinary matches do not; restock can cascade in place',()=>{
  const base=[{rows:[[0,0,null]],lock:0,key:null},{rows:[[0,1,null]],lock:0,key:null},{rows:[[2,1,2]],lock:1,key:1}];
  let r=shiftGood(base,[1,0,0,2]);assert.equal(r.matches.length,1);assert.equal(r.shelves[2].lock,1);assert.equal(r.unlocked.length,0);
  const cascade=[{rows:[[1,1,null],[2,2,2]],lock:0,key:null},{rows:[[1,0,null]],lock:0,key:null},{rows:[[3,3,0]],lock:1,key:2}];
  r=shiftGood(cascade,[1,0,0,2]);assert.deepEqual(r.matches.map(m=>m.type),[1,2]);assert.deepEqual(r.unlocked,[2]);assert.equal(r.shelves[2].lock,0);assert.ok(r.revealed.includes(0));
  assert.equal(shelfMoves([{rows:[[0,1,2]],lock:0,key:null},{rows:[[1,2,0]],lock:0,key:null}]).length,0);
});

test('proof hints translate slot permutations without changing the puzzle or taking a move',()=>{
  const s=createShelfGame(1);[s.shelves[0].rows[0][0],s.shelves[0].rows[0][2]]=[s.shelves[0].rows[0][2],s.shelves[0].rows[0][0]];
  const before=clone(s),h=referenceHint(s);assert.ok(h);assert.deepEqual(s,before);assert.ok(moveShelfGood(s,h).ok);
});

test('v2 migration keeps legacy saves and medals while starting the separate shelf campaign; v3 backups round trip',()=>{
  const old=freshProfile();old.version=2;delete old.puzzles;old.mode='trail';old.trail={1:{stars:3,score:500,helps:0,seconds:20}};
  old.sessions.cozy={state:createGame({seed:17}),history:[]};old.completed=21;
  const migrated=normalizeProfile(old);assert.equal(migrated.mode,'puzzle');assert.equal(migrated.completed,21);assert.equal(migrated.trailStars,3);assert.equal(migrated.puzzleWins,0);assert.equal(migrated.sessions.cozy.state.seed,17);
  const s=createShelfGame(1);moveShelfGood(s,SHELF_PUZZLES[0].route[0]);migrated.sessions.puzzle={state:s,history:[createShelfGame(1)]};migrated.mode='puzzle';
  const restored=parseBackup(backup(migrated));assert.deepEqual(restored.sessions.puzzle,migrated.sessions.puzzle);assert.equal(restored.mode,'puzzle');assert.equal(restored.trailStars,3);
  for(const move of SHELF_PUZZLES[0].route.slice(1))moveShelfGood(s,move);finishDelivery(migrated,s);finishDelivery(migrated,s);
  assert.equal(migrated.puzzleWins,1);assert.equal(migrated.puzzleStars,3);assert.equal(migrated.trailStars,3);assert.equal(migrated.completed,22);assert.equal(nextPuzzle(migrated),2);
});

test('malformed shelf saves cannot alter the key, move target, stock counts or completion status',()=>{
  const s=createShelfGame(1);assert.ok(upgradeGame(s));
  for(const mutate of [x=>x.spec.target=1,x=>x.shelves[0].key=3,x=>x.shelves[0].rows[0][1]=null,x=>x.status='won',x=>x.levelId=601,x=>x.tray=[0],x=>x.matchedGoods[0]=3,x=>x.moves=-1,x=>x.combo=null,x=>x.shelves.find(s=>s.lock).lock=0,x=>x.shelves[0].rows=[]]){const bad=clone(s);mutate(bad);assert.equal(validateSave(bad),false);assert.equal(upgradeGame(bad),null);}
});

test('catalog first matches need at least three moves except the ten released two-move openings',()=>{
  const exceptions=[26,67,72,75,99,256,263,272,531,567],found=[];
  for(const entry of SHELF_PUZZLES){
    const depth=firstMatchDepth(entry.shelves,2,100000);
    if(exceptions.includes(entry.id)){
      assert.equal(depth,2,`Released exception ${entry.id}`);found.push(entry.id);
    }else assert.equal(depth,-1,`Puzzle ${entry.id} must have no match within two moves`);
  }
  assert.deepEqual(found,exceptions);
});

test('first-match search distinguishes depth limits, node limits, dead ends and real depths',()=>{
  const shelves=createShelfGame(1).shelves;
  assert.equal(firstMatchDepth(shelves,2,100000),-1);
  assert.equal(firstMatchDepth(shelves,2,0),null);
  assert.equal(firstMatchDepth([{rows:[[0,1,2]],lock:1,key:0}],2),Infinity);
  assert.equal(firstMatchDepth(shelves,4,100000),4);
});
