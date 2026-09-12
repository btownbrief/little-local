import {GOODS,THEMES,levelSpec,MECHANICS} from './content.js';
export {GOODS,THEMES};
export const MODES=['cozy','trail','daily','rush','pantry'];
export function rng(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function hash(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
export function shuffle(a,rand){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export const clone=x=>structuredClone(x);
export function expose(shelves){for(const s of shelves)while(s.rows.length&&s.rows[0].every(x=>x===null))s.rows.shift();}
export function visible(state){return state.shelves.flatMap((s,shelf)=>s.lock>0?[]:(s.rows[0]||[]).flatMap((type,slot)=>type===null?[]:[{type,shelf,slot}]));}
export function remaining(s){return s.shelves.reduce((n,sh)=>n+sh.rows.flat().filter(t=>t!==null).length,0)+s.tray.length;}
export function counts(s){const c=Array(GOODS.length).fill(0);for(const sh of s.shelves)for(const t of sh.rows.flat())if(t!==null)c[t]++;for(const t of s.tray)c[t]++;return c;}
export function advanceShelves(shelves){
  const unlocked=[];
  shelves.forEach((s,i)=>{if(s.lock>0){s.lock--;if(s.lock===0)unlocked.push(i);}});
  const belt=shelves.map((s,i)=>s.belt&&!(s.lock>0)?i:-1).filter(i=>i>=0);
  if(belt.length>1){const rows=belt.map(i=>shelves[i].rows[0]?[...shelves[i].rows[0]]:[null,null,null]);belt.forEach((index,i)=>{const s=shelves[index],next=rows[(i+belt.length-1)%belt.length];if(s.rows.length)s.rows[0]=next;else if(next.some(t=>t!==null))s.rows.push(next);});expose(shelves);}
  return {unlocked,belt};
}
export function planClear(shelves,limit=1800){
  let visits=0;const seen=new Set();
  function visit(ss){
    if(++visits>limit)return null;
    if(ss.every(s=>!s.rows.length))return [];
    const key=JSON.stringify(ss);if(seen.has(key))return null;seen.add(key);
    const groups=new Map();for(const p of visible({shelves:ss})){if(!groups.has(p.type))groups.set(p.type,[]);groups.get(p.type).push(p);}
    for(const [type,ps] of [...groups].filter(([,ps])=>ps.length>=3).sort((a,b)=>b[1].length-a[1].length)){
      let tries=0;
      candidates:for(let a=0;a<ps.length-2;a++)for(let b=a+1;b<ps.length-1;b++)for(let c=b+1;c<ps.length;c++){
        if(++tries>18)break candidates;
        const picks=[ps[a],ps[b],ps[c]],next=clone(ss);
        for(const p of picks)next[p.shelf].rows[0][p.slot]=null;
        expose(next);advanceShelves(next);const tail=visit(next);
        if(tail)return[{type,picks},...tail];if(visits>limit)return null;
      }
    }
    return null;
  }
  return visit(clone(shelves));
}
function decorate(shelves,options,rand){
  const indices=shuffle(shelves.map((_,i)=>i),rand);
  indices.slice(0,options.locks||0).forEach(i=>shelves[i].lock=options.lockMatches||2);
  indices.slice(-(options.conveyor||0)).forEach(i=>{if(options.conveyor)shelves[i].belt=true;});
  shuffle(indices,rand).slice(0,options.frost||0).forEach(i=>shelves[i].frosted=true);
  return shelves;
}
export function makeShelves(types,rand,options={}){
  const count=options.shelfCount||6,attempts=types.length>90?8:22;
  for(let attempt=0;attempt<attempts;attempt++){
    const deck=shuffle(types,rand),shelves=Array.from({length:count},()=>({rows:[]}));
    for(let i=0;i<deck.length;i+=3)shelves[(i/3)%count].rows.push(deck.slice(i,i+3));
    decorate(shelves,options,rand);if(planClear(shelves,types.length>90?240:650))return shelves;
  }
  // Constructive fallback: each front shelf starts with a complete triple.
  // Open shelves supply enough matches to unlock all ribbons. Belts move
  // intact triples and never alter the multiset of goods.
  const grouped=new Map();for(const t of types){if(!grouped.has(t))grouped.set(t,[]);grouped.get(t).push(t);}
  const triples=shuffle([...grouped.values()].flatMap(a=>Array.from({length:a.length/3},()=>[a[0],a[0],a[0]])),rand);
  const shelves=Array.from({length:count},()=>({rows:[]}));triples.forEach((g,i)=>shelves[i%count].rows.push(g));decorate(shelves,options,rand);
  // Mix complete depth layers across shelves. Every layer still contains whole
  // triples, but players must find them across the shop instead of tapping
  // three identical items sitting together. Keep initial locked and open
  // pools separate so the first matches can unwrap the ribbons.
  const base=clone(shelves);
  for(let attempt=0;attempt<6;attempt++){
    const mixed=clone(base),depth=Math.max(...mixed.map(s=>s.rows.length));
    for(let d=0;d<depth;d++){
      const groups=d===0?[mixed.filter(s=>s.rows[d]&&s.lock>0),mixed.filter(s=>s.rows[d]&&!(s.lock>0))]:[mixed.filter(s=>s.rows[d])];
      for(const group of groups){const pool=shuffle(group.flatMap(s=>s.rows[d]),rand);group.forEach((s,i)=>s.rows[d]=pool.slice(i*3,i*3+3));}
    }
    if(planClear(mixed,1500))return mixed;
  }
  // Recovery with very little stock must never put every remaining triple behind a ribbon.
  if(!planClear(shelves,2000))for(const s of shelves)s.lock=0;
  return shelves;
}
export function createGame({mode='cozy',round=1,seed=1,theme='market',date='',levelId=1,difficulty='balanced',surprises=true,size=144}={}){
  const rand=rng(seed);let spec={types:Math.min(6+Math.floor((round-1)/2),12),matches:round<3?12:18,shelfCount:6,mechanics:[],chainGoal:5};
  if(mode==='trail'){spec=levelSpec(levelId);theme=spec.theme;round=levelId;}
  else if(mode==='pantry')spec={...spec,types:12,matches:size===72?24:48,shelfCount:size===72?8:12,chainGoal:10};
  else if(mode==='daily')spec={...spec,types:8,matches:18,chainGoal:6,...(hash(date)%3===0?{conveyor:2,mechanics:['conveyor']}:hash(date)%3===1?{frost:2,mechanics:['frosted']}:{locks:1,lockMatches:2,mechanics:['locked']})};
  else if(mode==='cozy'){
    if(difficulty==='gentle')spec={...spec,types:5,matches:12};
    if(difficulty==='brainy')spec={...spec,types:12,matches:24,chainGoal:8};
    if(surprises&&round>3&&difficulty!=='gentle'){
      const variant=round%4;
      if(variant===1)Object.assign(spec,{locks:1,lockMatches:2,mechanics:['locked']});
      if(variant===2)Object.assign(spec,{frost:2,mechanics:['frosted']});
      if(variant===3)Object.assign(spec,{conveyor:2,mechanics:['conveyor']});
    }
  }
  const palette=THEMES[theme].palette.slice(0,spec.types),types=Array.from({length:spec.matches},(_,i)=>Array(3).fill(palette[i%palette.length])).flat();
  const shelves=makeShelves(types,rand,spec),proof=planClear(shelves,3000);
  const order=(spec.order||mode==='cozy'&&round%3===0)&&proof?.length?{type:proof[Math.min(2,proof.length-1)].type,target:1,done:0,within:Math.ceil(spec.matches*.55),fulfilled:false,missed:false}:null;
  return {version:2,mode,round,seed,theme,date,levelId:mode==='trail'?levelId:null,difficulty,surprises,size,spec,shelves,tray:[],moves:0,matches:0,total:types.length,score:0,combo:0,bestCombo:0,lastMatchMove:0,hints:0,rearranges:0,undos:0,magics:0,elapsed:0,started:false,status:'playing',seconds:mode==='rush'?Math.max(120,spec.matches*10):null,spark:0,lanterns:0,order,matchedGoods:Array(GOODS.length).fill(0)};
}
export function pick(state,shelf,slot){
  if(state.status!=='playing'||state.tray.length>=7||state.shelves[shelf]?.lock>0)return{ok:false};
  const type=state.shelves[shelf]?.rows[0]?.[slot];if(type==null)return{ok:false};
  state.started=true;state.moves++;state.shelves[shelf].rows[0][slot]=null;state.tray.push(type);state.tray.sort((a,b)=>a-b);
  const matched=state.tray.filter(t=>t===type).length===3;let events={unlocked:[],belt:[]};
  if(matched){
    state.tray=state.tray.filter(t=>t!==type);state.matches++;state.combo=state.lastMatchMove===state.moves-3?state.combo+1:1;state.lastMatchMove=state.moves;state.bestCombo=Math.max(state.combo,state.bestCombo);state.score+=100+Math.min(state.combo-1,5)*20;
    state.matchedGoods??=Array(GOODS.length).fill(0);state.matchedGoods[type]=(state.matchedGoods[type]||0)+3;
    state.spark=(state.spark||0)+1;if(state.spark>=3){state.spark=0;state.lanterns=Math.min(3,(state.lanterns||0)+1);}
    if(state.order&&!state.order.fulfilled&&!state.order.missed){if(type===state.order.type&&state.matches<=state.order.within){state.order.done++;if(state.order.done>=state.order.target){state.order.fulfilled=true;state.score+=250;}}if(state.matches>=state.order.within&&!state.order.fulfilled)state.order.missed=true;}
  }
  expose(state.shelves);if(matched)events=advanceShelves(state.shelves);
  if(remaining(state)===0)state.status='won';
  return{ok:true,matched,type,full:state.tray.length===7,...events};
}
export function rearrange(state){
  if(state.status!=='playing')return false;
  const all=state.shelves.flatMap(s=>s.rows.flat().filter(t=>t!==null)).concat(state.tray);state.rearranges++;state.combo=0;state.lastMatchMove=-10;
  const options={...(state.spec||{}),shelfCount:state.shelves.length,locks:0}; // ribbons already opened for a fresh start
  state.shelves=makeShelves(all,rng(hash(`${state.seed}:${state.rearranges}:${state.moves}`)),options);state.tray=[];return true;
}
export function hint(state){
  const v=visible(state),held=Array(GOODS.length).fill(0);for(const t of state.tray)held[t]++;
  if(!state.tray.length){const proof=planClear(state.shelves,4000);if(proof?.length)return{picks:proof[0].picks,type:proof[0].type};}
  const types=[...new Set(v.map(p=>p.type))].sort((a,b)=>held[b]-held[a]);
  for(const type of types){const ps=v.filter(p=>p.type===type),need=3-held[type];if(ps.length>=need&&state.tray.length+need<=7)return{picks:ps.slice(0,need),type};}
  return null;
}
export function tick(state,delta){if(state.status!=='playing'||!state.started||delta<=0)return;state.elapsed+=delta;if(state.mode==='rush'&&!state.clockDisabled&&remaining(state)>3){state.seconds=Math.max(0,state.seconds-delta);if(state.seconds===0)state.status='timeout';}}
export function starsFor(state){return state.status!=='won'?0:1+(state.rearranges===0?1:0)+(state.bestCombo>=(state.spec?.chainGoal||5)||state.order?.fulfilled?1:0);}
export function validateSave(s){
  if(!s||![1,2].includes(s.version)||!MODES.includes(s.mode)||!Object.hasOwn(THEMES,s.theme)||!Array.isArray(s.shelves)||s.shelves.length<1||s.shelves.length>12||!Array.isArray(s.tray)||s.tray.length>7)return false;
  const item=t=>t===null||Number.isInteger(t)&&t>=0&&t<GOODS.length;
  if(!s.shelves.every(sh=>sh&&Array.isArray(sh.rows)&&sh.rows.length<=48&&sh.rows.every(row=>Array.isArray(row)&&row.length===3&&row.every(item))&&(!sh.lock||Number.isInteger(sh.lock)&&sh.lock>=0&&sh.lock<=5)))return false;
  if(!s.tray.every(t=>t!==null&&item(t))||!['playing','won','timeout'].includes(s.status))return false;
  for(const k of ['round','seed','moves','matches','total','score','elapsed','hints','rearranges','undos','combo','bestCombo','lastMatchMove'])if(!Number.isFinite(s[k]))return false;
  if(s.round<1||s.total<0||s.total>144||s.matches<0||s.moves<0||s.elapsed<0)return false;
  if(s.mode==='rush'&&(!Number.isFinite(s.seconds)||s.seconds<0))return false;
  if(typeof s.date!=='string'||s.date!==''&&!/^\d{4}-\d{2}-\d{2}$/.test(s.date))return false;
  if(s.mode==='trail'&&(!Number.isInteger(s.levelId)||s.levelId<1||s.levelId>600||s.spec?.chapterIndex!==Math.floor((s.levelId-1)/50)))return false;
  if(s.spec){if(!Array.isArray(s.spec.mechanics)||s.spec.mechanics.some(m=>!Object.hasOwn(MECHANICS,m))||!Number.isFinite(s.spec.chainGoal)||s.spec.chainGoal<1||s.spec.chainGoal>48)return false;}
  if(s.order&&(!Number.isInteger(s.order.type)||s.order.type<0||s.order.type>=GOODS.length||!Number.isFinite(s.order.within)||s.order.within<1||s.order.within>48||!Number.isFinite(s.order.target)||s.order.target<1||s.order.target>48||!Number.isFinite(s.order.done)))return false;
  if(s.matchedGoods&&(!Array.isArray(s.matchedGoods)||s.matchedGoods.length!==GOODS.length||s.matchedGoods.some(n=>!Number.isInteger(n)||n<0||n>144)))return false;
  for(const k of ['spark','lanterns','magics'])if(s[k]!==undefined&&(!Number.isInteger(s[k])||s[k]<0||s[k]>1000))return false;
  if(s.status==='won'&&remaining(s)!==0)return false;
  return counts(s).every(n=>n%3===0)&&remaining(s)+s.matches*3===s.total;
}
export function upgradeGame(s){
  if(!validateSave(s))return null;
  return {...s,version:2,spec:s.spec||{mechanics:[],chainGoal:5,shelfCount:s.shelves.length},spark:s.spark||0,lanterns:s.lanterns||0,magics:s.magics||0,matchedGoods:s.matchedGoods||Array(GOODS.length).fill(0)};
}
