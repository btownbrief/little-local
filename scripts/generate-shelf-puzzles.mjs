import {writeFile,mkdir} from 'node:fs/promises';
import {rng,hash,shuffle} from '../dist/engine.js';
import {shiftGood,solveShelves,firstMatchDepth,shelfRemaining,shelfKey} from '../dist/shelf-rules.js';
export function candidate(id,attempt=0){
  const chapter=Math.floor((id-1)/50),rand=rng(hash(`little-local:shelves:v3:${id}:${attempt}`));
  const count=chapter>=4?8:6,locks=chapter>=2?2:1,open=count-locks,types=count===8?9:6;
  const matches=12+Math.min(6,Math.floor(chapter/2)*2)+(id%10===0?3:0),free=4+(chapter===0&&id%5===0?1:0);
  const totals=Array(types).fill(0);for(let i=0;i<matches;i++)totals[i%types]+=3;
  const front=shuffle(Array.from({length:types},(_,i)=>[i,i]).flat(),rand).slice(0,open*3-free);
  front.forEach(t=>totals[t]--);
  const supply=shuffle(totals.flatMap((n,t)=>Array(n).fill(t)),rand);
  const shelves=Array.from({length:count},()=>({rows:[[null,null,null]],lock:0,key:null}));
  // Distribute the starting holes: at least two partly occupied shelves, never
  // an entirely free bonus shelf. The first move cannot simply clear a triple.
  const slots=Array.from({length:open},()=>3);for(let i=0;i<free;i++)slots[(i+id)%open]--;
  let cursor=0;for(let i=0;i<open;i++)shelves[i].rows[0]=shuffle(front.slice(cursor,cursor+=slots[i]).concat(Array(3-slots[i]).fill(null)),rand);
  const keys=shuffle(Array.from({length:types},(_,i)=>i),rand);
  for(let i=open;i<count;i++){shelves[i].lock=1;shelves[i].key=keys[i-open];shelves[i].rows[0]=supply.splice(0,3);}
  let i=0;const order=shuffle(Array.from({length:count},(_,i)=>i),rand);
  while(supply.length){const row=supply.splice(0,3);while(row.length<3)row.push(null);shelves[order[i++%count]].rows.push(row);}
  return shuffle(shelves,rand);
}
if(process.argv[1]?.endsWith('generate-shelf-puzzles.mjs')){
  await mkdir('tmp',{recursive:true});
  const limit=Number(process.argv[2]||10),accepted=[],layouts=new Set();let tries=0;const start=Date.now();
  for(let id=1;id<=limit;id++){
    let record;
    for(let attempt=0;attempt<500;attempt++){
      tries++;const shelves=candidate(id,attempt),first=firstMatchDepth(shelves,3,5000);
      if(first!==null&&first<3||first===Infinity)continue;
      const route=solveShelves(shelves,{width:70,depth:160,maxNodes:45000});if(!route||route.length<28)continue;
      let board=shelves,setup=0,firstMove=0,unlocks=0;
      for(let j=0;j<route.length;j++){const r=shiftGood(board,route[j]);if(!r)throw Error('invalid proof');if(!r.matches.length)setup++;else if(!firstMove)firstMove=j+1;unlocks+=r.unlocked.length;board=r.shelves;}
      if(shelfRemaining(board)||firstMove<3||unlocks<1)continue;
      const key=shelfKey(shelves);if(layouts.has(key))continue;layouts.add(key);
      record={id,shelves,route,target:route.length,opening:firstMove,setup,attempt};break;
    }
    if(!record)throw Error(`No verified board for ${id}`);
    accepted.push(record);
    if(id%10===0||id===1)console.log(JSON.stringify({id,tries,seconds:Math.round((Date.now()-start)/1000),moves:record.target,opening:record.opening,attempt:record.attempt}));
    if(id%10===0)await writeFile('tmp/shelf-candidates.json',JSON.stringify(accepted));
  }
  await writeFile('tmp/shelf-candidates.json',JSON.stringify(accepted));
  console.log(`Verified ${accepted.length} candidates.`);
}
