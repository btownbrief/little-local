export const GOODS = [
  {name:'Maple syrup',short:'Maple',color:'#ad6545'}, {name:'Orchard apple',short:'Apples',color:'#bd594b'},
  {name:'Farm milk',short:'Milk',color:'#6590a0'}, {name:'Vermont cheddar',short:'Cheddar',color:'#d49b42'},
  {name:'Morning coffee',short:'Coffee',color:'#a5694e'}, {name:'Blueberries',short:'Berries',color:'#727c9a'},
  {name:'Butter croissant',short:'Croissants',color:'#c79851'}, {name:'Market flowers',short:'Flowers',color:'#9581a0'},
  {name:'Strawberry jam',short:'Jam',color:'#ba6655'}, {name:'Wool mitten',short:'Mittens',color:'#b85c4c'},
  {name:'Local honey',short:'Honey',color:'#be9643'}, {name:'Sourdough loaf',short:'Bread',color:'#ab8259'},
];
export const THEMES = {
  market:{name:'The corner shop',sign:'LOCALLY LOVED. LOVINGLY SORTED.',palette:[0,1,2,3,6,7,5,8,10,4,11,9]},
  bakery:{name:'The morning bakery',sign:'WARM FROM THE OVEN. ALL YOURS.',palette:[4,6,11,8,2,10,0,1,5,7,3,9]},
  lakeside:{name:'The lakeside stand',sign:'A LAKE BREEZE & A LITTLE EASE.',palette:[5,7,1,0,9,10,3,8,4,2,6,11]},
};
export function rng(seed) { let a=seed>>>0; return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}; }
export function hash(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
export function shuffle(a,rand){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export const clone = x=>structuredClone(x);
export function expose(shelves){for(const s of shelves){while(s.rows.length && s.rows[0].every(x=>x===null))s.rows.shift();}}
export function visible(state){return state.shelves.flatMap((s,si)=>(s.rows[0]||[]).flatMap((type,slot)=>type===null?[]:[{type,shelf:si,slot}]));}
export function remaining(state){return state.shelves.reduce((n,s)=>n+s.rows.flat().filter(x=>x!==null).length,0)+state.tray.length;}
export function counts(state){const c=Array(12).fill(0);for(const s of state.shelves)for(const t of s.rows.flat())if(t!==null)c[t]++;for(const t of state.tray)c[t]++;return c;}
// Search complete visible triples, never single blind picks. A returned plan is a
// constructive proof of a clear from this state with at most three basket slots.
export function planClear(shelves,limit=1600){
  let visits=0;const seen=new Set();
  function visit(ss){
    if(++visits>limit)return null;
    if(ss.every(s=>!s.rows.length))return [];
    const key=JSON.stringify(ss);if(seen.has(key))return null;seen.add(key);
    const v=visible({shelves:ss}),groups=new Map();
    for(const p of v){if(!groups.has(p.type))groups.set(p.type,[]);groups.get(p.type).push(p);}
    const candidates=[...groups].filter(([,ps])=>ps.length>=3).sort((a,b)=>b[1].length-a[1].length);
    for(const [type,ps] of candidates){
      // Prefer pieces that empty a shelf; try all triples when choices differ.
      let tries=0;
      for(let a=0;a<ps.length-2;a++)for(let b=a+1;b<ps.length-1;b++)for(let c=b+1;c<ps.length;c++){
        if(++tries>20)break;const picks=[ps[a],ps[b],ps[c]],next=clone(ss);
        for(const p of picks)next[p.shelf].rows[0][p.slot]=null;
        expose(next);const tail=visit(next);if(tail)return [{type,picks},...tail];if(visits>limit)return null;
      }
    }
    return null;
  }
  return visit(clone(shelves));
}
export function makeShelves(types,rand){
  // Accept shuffled layouts only when the solver demonstrates an entire clear.
  for(let attempt=0;attempt<28;attempt++){
    const deck=shuffle(types,rand),shelves=Array.from({length:6},()=>({rows:[]}));
    for(let i=0;i<deck.length;i+=3)shelves[(i/3)%6].rows.push(deck.slice(i,i+3));
    if(planClear(shelves,700))return shelves;
  }
  // Constructive fallback: a wave contains one complete triple per shelf.
  // All waves can be cleared independently, and no item is discarded.
  const byType=new Map();for(const t of types){if(!byType.has(t))byType.set(t,[]);byType.get(t).push(t);}
  const groups=shuffle([...byType.values()].flatMap(a=>Array.from({length:a.length/3},()=>a.slice(0,3))),rand);
  const shelves=Array.from({length:6},()=>({rows:[]}));groups.forEach((g,i)=>shelves[i%6].rows.push(g));return shelves;
}
export function createGame({mode='cozy',round=1,seed=1,theme='market',date=''}={}){
  const rand=rng(seed),palette=THEMES[theme].palette.slice(0,Math.min(6+Math.floor((round-1)/2),12));
  const matches=mode==='daily'?18:round<3?12:18;
  const types=Array.from({length:matches},(_,i)=>Array(3).fill(palette[i%palette.length])).flat();
  return {version:1,mode,round,seed,theme,date,shelves:makeShelves(types,rand),tray:[],moves:0,matches:0,total:types.length,score:0,combo:0,bestCombo:0,lastMatchMove:0,hints:0,rearranges:0,undos:0,elapsed:0,started:false,status:'playing',seconds:mode==='rush'?Math.max(120,matches*10):null};
}
export function pick(state,shelf,slot){
  if(state.status!=='playing'||state.tray.length>=7)return {ok:false};
  const type=state.shelves[shelf]?.rows[0]?.[slot];if(type==null)return {ok:false};
  state.started=true;state.moves++;state.shelves[shelf].rows[0][slot]=null;state.tray.push(type);state.tray.sort((a,b)=>a-b);
  const matched=state.tray.filter(t=>t===type).length===3;
  if(matched){state.tray=state.tray.filter(t=>t!==type);state.matches++;state.combo=state.lastMatchMove===state.moves-3?state.combo+1:1;state.lastMatchMove=state.moves;state.bestCombo=Math.max(state.combo,state.bestCombo);state.score+=100+Math.min(state.combo-1,5)*20;}
  expose(state.shelves);
  if(remaining(state)===0)state.status='won';
  return {ok:true,matched,type,full:state.tray.length===7};
}
export function rearrange(state){
  if(state.status!=='playing')return false;
  const all=state.shelves.flatMap(s=>s.rows.flat().filter(t=>t!==null)).concat(state.tray);
  state.rearranges++;state.combo=0;state.lastMatchMove=-10;
  state.shelves=makeShelves(all,rng(hash(`${state.seed}:${state.rearranges}:${state.moves}`)));state.tray=[];return true;
}
export function hint(state){
  const v=visible(state),held=Array(12).fill(0);for(const t of state.tray)held[t]++;
  const types=[...new Set(v.map(x=>x.type))].sort((a,b)=>held[b]-held[a]);
  if(!state.tray.length){const plan=planClear(state.shelves,2500);if(plan?.length)return {picks:plan[0].picks,type:plan[0].type};}
  for(const t of types){const ps=v.filter(p=>p.type===t);const need=3-held[t];if(ps.length>=need&&state.tray.length+need<=7)return {picks:ps.slice(0,need),type:t};}
  return null;
}
export function tick(state,delta){
  if(state.status!=='playing'||!state.started||delta<=0)return;
  state.elapsed+=delta;
  // Let the final triple finish peacefully, including in Rush.
  if(state.mode==='rush'&&!state.clockDisabled&&remaining(state)>3){state.seconds=Math.max(0,state.seconds-delta);if(state.seconds===0)state.status='timeout';}
}
export function validateSave(s){
  if(!s||s.version!==1||!['cozy','daily','rush'].includes(s.mode)||!THEMES[s.theme]||!Array.isArray(s.shelves)||s.shelves.length!==6||!Array.isArray(s.tray)||s.tray.length>7)return false;
  if(!s.shelves.every(sh=>Array.isArray(sh.rows)&&sh.rows.length<=18&&sh.rows.every(row=>Array.isArray(row)&&row.length<=3&&row.every(t=>t===null||Number.isInteger(t)&&t>=0&&t<12))))return false;
  if(!s.tray.every(t=>Number.isInteger(t)&&t>=0&&t<12))return false;
  if(!['playing','won','timeout'].includes(s.status))return false;
  for(const k of ['round','seed','moves','matches','total','score','elapsed','hints','rearranges','undos','combo','bestCombo','lastMatchMove'])if(!Number.isFinite(s[k]))return false;
  if(s.round<1||s.total<0||s.total>54||s.matches<0||s.moves<0||s.elapsed<0)return false;
  if(s.mode==='rush'&&(!Number.isFinite(s.seconds)||s.seconds<0))return false;
  return counts(s).every(n=>n%3===0)&&remaining(s)+s.matches*3===s.total;
}
