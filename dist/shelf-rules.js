// Shelf puzzles use the shelf space itself. There is no off-board holding tray.
export const copyShelves = shelves => shelves.map(s => ({...s, rows:s.rows.map(r=>r.slice())}));
export const shelfRemaining = shelves => shelves.reduce((n,s)=>n+s.rows.flat().filter(t=>t!==null).length,0);
export const shelfSpaces = shelves => shelves.reduce((n,s)=>n+(s.lock?0:s.rows[0].filter(t=>t===null).length),0);
export function shelfKey(shelves) {
  // Slot order on one shelf does not change its legal moves or matching rules.
  return shelves.map(s=>`${s.lock?s.key+1:0}:${s.rows.map(r=>r.slice().sort((a,b)=>(a??-1)-(b??-1)).map(t=>t===null?'_':t.toString(24)).join('')).join('.')}`).join('|');
}
export function shelfMoves(shelves) {
  const out=[];
  for(let from=0;from<shelves.length;from++) {
    const source=shelves[from]; if(source.lock)continue;
    const seen=new Set();
    for(let slot=0;slot<3;slot++) {
      const type=source.rows[0][slot];if(type===null||seen.has(type))continue;seen.add(type);
      for(let to=0;to<shelves.length;to++) {
        if(from===to||shelves[to].lock)continue;
        const target=shelves[to].rows[0].indexOf(null);
        if(target!==-1)out.push([from,slot,to,target]);
      }
    }
  }
  return out;
}
export function shiftGood(shelves,move) {
  if(!Array.isArray(move)||move.length!==4||move.some(n=>!Number.isInteger(n)))return null;
  const [from,slot,to,target]=move,a=shelves[from],b=shelves[to];
  if(!a||!b||from===to||a.lock||b.lock||slot<0||slot>2||target<0||target>2||a.rows[0][slot]===null||b.rows[0][target]!==null)return null;
  const next=copyShelves(shelves),type=next[from].rows[0][slot];
  next[from].rows[0][slot]=null;next[to].rows[0][target]=type;
  const matches=[],unlocked=[],revealed=[];
  let again=true;
  while(again) {
    again=false;
    for(let i=0;i<next.length;i++) {
      const s=next[i];if(s.lock)continue;
      while(s.rows.length>1&&s.rows[0].every(t=>t===null)) {s.rows.shift();revealed.push(i);again=true;}
      const r=s.rows[0];
      if(r[0]!==null&&r.every(t=>t===r[0])) {
        const matched=r[0];matches.push({shelf:i,type:matched});s.rows[0]=[null,null,null];again=true;
        next.forEach((gate,j)=>{if(gate.lock&&gate.key===matched){gate.lock=0;unlocked.push(j);}});
      }
    }
  }
  return {shelves:next,type,matches,unlocked,revealed:[...new Set(revealed)]};
}
function estimate(shelves) {
  let score=0;
  for(const s of shelves) {
    const row=s.rows[0],filled=row.filter(t=>t!==null),pairs=filled.length-new Set(filled).size;
    score+=s.rows.flat().filter(t=>t!==null).length*18+(s.rows.length-1)*2;
    score+=s.lock?10:-row.filter(t=>t===null).length*1.5-pairs*4;
  }
  return score;
}
// A bounded search, not a claim of optimality. Generation stores a full playable
// solution; hints search the player's actual board without changing it.
export function solveShelves(shelves,{width=100,depth=130,maxNodes=70000}={}) {
  if(!shelfRemaining(shelves))return [];
  let frontier=[{shelves,prev:null,move:null}],nodes=0;
  const seen=new Set([shelfKey(shelves)]);
  for(let d=0;d<depth;d++) {
    const next=[];
    for(const node of frontier)for(const move of shelfMoves(node.shelves)) {
      const result=shiftGood(node.shelves,move),key=shelfKey(result.shelves);
      if(seen.has(key))continue;seen.add(key);if(++nodes>maxNodes)return null;
      const child={shelves:result.shelves,prev:node,move,rank:estimate(result.shelves)};
      if(!shelfRemaining(result.shelves)) {const route=[];for(let p=child;p.prev;p=p.prev)route.push(p.move);return route.reverse();}
      next.push(child);
    }
    if(!next.length)return null;
    next.sort((a,b)=>a.rank-b.rank);frontier=next.slice(0,width);
  }
  return null;
}
export function firstMatchDepth(shelves,maxDepth=6,maxNodes=40000) {
  let frontier=[shelves];const seen=new Set([shelfKey(shelves)]);let nodes=0;
  for(let d=1;d<=maxDepth;d++) {
    const next=[];
    for(const board of frontier)for(const move of shelfMoves(board)) {
      const r=shiftGood(board,move);if(r.matches.length)return d;
      const k=shelfKey(r.shelves);if(seen.has(k))continue;seen.add(k);
      if(++nodes>maxNodes)return null;next.push(r.shelves);
    }
    frontier=next;if(!frontier.length)return Infinity;
  }
  // -1 means the entire depth limit was searched; null means the node budget ran out.
  return -1;
}
