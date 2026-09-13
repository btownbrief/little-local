import {parentPort,workerData} from 'node:worker_threads';
import {writeFile} from 'node:fs/promises';
import {candidate} from './generate-shelf-puzzles.mjs';
import {shiftGood,solveShelves,shelfRemaining} from '../dist/shelf-rules.js';
const records=[];
for(let id=workerData.start;id<=workerData.end;id++){
  let record;
  for(let attempt=0;attempt<1200;attempt++){
    const shelves=candidate(id,attempt);
    const route=solveShelves(shelves,{width:id>=201?55:65,depth:180,maxNodes:id>=201?85000:40000});
    if(!route||route.length<26+Math.floor((id-1)/200))continue;
    let board=shelves,setup=0,opening=0,unlocks=0;
    for(let j=0;j<route.length;j++){const r=shiftGood(board,route[j]);if(!r)throw Error('invalid proof');if(!r.matches.length)setup++;else if(!opening)opening=j+1;unlocks+=r.unlocked.length;board=r.shelves;}
    if(shelfRemaining(board)||opening<3||unlocks<1)continue;
    record={id,shelves,route,target:route.length,opening,setup,attempt};break;
  }
  if(!record)throw Error(`No puzzle for ${id}`);
  records.push(record);
  if(records.length%10===0){await writeFile(`tmp/shelf-batch-${workerData.start}.json`,JSON.stringify(records));parentPort.postMessage({id,accepted:records.length,attempt:record.attempt,target:record.target});}
}
await writeFile(`tmp/shelf-batch-${workerData.start}.json`,JSON.stringify(records));
parentPort.postMessage({done:true,start:workerData.start});
