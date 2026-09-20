import {Worker} from 'node:worker_threads';

export const searchOptions=id=>({width:id>=201?55:65,depth:180,maxNodes:id>=201?85000:40000});

export function costRanges(start,end,count=6){
  const ranges=[];
  let remaining=0;
  for(let id=start;id<=end;id++)remaining+=searchOptions(id).maxNodes;
  while(start<=end&&count>0){
    const target=remaining/count;
    let last=start,cost=searchOptions(start).maxNodes;
    while(last<end-count+1){
      const next=searchOptions(last+1).maxNodes;
      if(count>1&&Math.abs(cost-target)<=Math.abs(cost+next-target))break;
      cost+=next;last++;
    }
    ranges.push([start,last]);start=last+1;remaining-=cost;count--;
  }
  return ranges;
}

export async function runBatches(ranges,{signal,WorkerClass=Worker,onProgress=message=>console.log(JSON.stringify(message))}={}){
  signal?.throwIfAborted();
  const workers=new Set(),stopping=new Map();
  const stop=worker=>{
    if(!stopping.has(worker))stopping.set(worker,Promise.resolve().then(()=>worker.terminate()).finally(()=>workers.delete(worker)));
    return stopping.get(worker);
  };
  let cancel;
  const cancelled=new Promise((resolve,reject)=>{cancel=()=>reject(signal.reason||new Error('Batch cancelled.'));});
  signal?.addEventListener('abort',cancel,{once:true});
  try{
    const jobs=ranges.map(async([start,end])=>{
      const worker=new WorkerClass(new URL('./shelf-worker.mjs',import.meta.url),{workerData:{start,end}});
      workers.add(worker);
      return new Promise((resolve,reject)=>{
        let done=false;
        worker.on('message',message=>{
          if(message.done){done=true;resolve();}
          else {try{onProgress(message);}catch(error){reject(error);}}
        });
        worker.on('error',reject);
        worker.on('exit',code=>{if(!done)reject(new Error(`Worker stopped before completion (${code}).`));});
      }).finally(()=>stop(worker));
    });
    await Promise.race([Promise.all(jobs),cancelled]);
  }finally{
    signal?.removeEventListener('abort',cancel);
    await Promise.all([...workers].map(stop));
  }
}
