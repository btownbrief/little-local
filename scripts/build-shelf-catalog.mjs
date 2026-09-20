import {readFile,writeFile} from 'node:fs/promises';
import {LEVEL_COUNT} from '../dist/content.js';
import {costRanges,runBatches} from './shelf-batches.mjs';
const first=JSON.parse(await readFile('tmp/shelf-candidates.json','utf8'));
if(first.length!==10||first.some((p,i)=>p.id!==i+1))throw Error('Prepare the first 10 candidates before building the catalog.');
const ranges=costRanges(11,LEVEL_COUNT),controller=new AbortController();
const cancel=()=>controller.abort(new Error('Catalog build cancelled.'));
process.once('SIGINT',cancel);process.once('SIGTERM',cancel);
try{await runBatches(ranges,{signal:controller.signal});}
finally{process.removeListener('SIGINT',cancel);process.removeListener('SIGTERM',cancel);}
const records=first.concat(...await Promise.all(ranges.map(async([start])=>JSON.parse(await readFile(`tmp/shelf-batch-${start}.json`,'utf8')))));
records.sort((a,b)=>a.id-b.id);if(records.length!==LEVEL_COUNT)throw Error(`Expected ${LEVEL_COUNT}, got ${records.length}`);
await writeFile('dist/shelf-catalog.js','// Original shelf puzzles with executable solution routes.\nexport const SHELF_PUZZLES='+JSON.stringify(records)+';\n');
console.log(`${LEVEL_COUNT} verified shelf puzzles saved.`);
