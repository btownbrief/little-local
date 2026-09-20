import {GOODS,THEMES,MODES,upgradeGame,clone,starsFor} from './engine.js';
import {ACHIEVEMENTS,LEVEL_COUNT,DECOR} from './content.js';
export const STORAGE='little-local:v3';
export function freshProfile(){return {version:3,settings:{sound:false,focus:false,motion:true,labels:false,theme:'market',difficulty:'brainy',surprises:true,flow:false,ambience:'off',volume:.45,decor:'home'},completed:0,totalMatches:0,bestCombo:0,perfect:0,dailyDays:0,rushWins:0,pantryWins:0,trailWins:0,trailStars:0,orders:0,uniqueGoods:0,collection:Array(GOODS.length).fill(0),favorites:[],earned:[],puzzles:{},puzzleWins:0,puzzleStars:0,trail:{},dailyBest:{},sessions:{},mode:'puzzle'};}
const natural=(n,max=1e9)=>Number.isFinite(n)&&n>=0?Math.min(max,Math.floor(n)):0;
export function normalizeProfile(raw,{imported=false}={}){
  if(!raw||![1,2,3].includes(raw.version)||!raw.settings||!raw.sessions)return null;
  const p=freshProfile(),s=raw.settings;
  for(const k of ['completed','totalMatches','bestCombo','perfect','rushWins','pantryWins','orders'])p[k]=natural(raw[k]);
  for(const k of ['sound','focus','motion','labels','surprises','flow'])if(typeof s[k]==='boolean')p.settings[k]=s[k];
  if(Object.hasOwn(THEMES,s.theme))p.settings.theme=s.theme;
  if(['gentle','balanced','brainy'].includes(s.difficulty))p.settings.difficulty=s.difficulty;
  if(['off','rain','lake'].includes(s.ambience))p.settings.ambience=s.ambience;
  if(['home','rain','golden','evening'].includes(s.decor))p.settings.decor=s.decor;
  if(Number.isFinite(s.volume))p.settings.volume=Math.max(0,Math.min(1,s.volume));
  p.mode=raw.version===3&&MODES.includes(raw.mode)?raw.mode:'puzzle';
  p.collection=p.collection.map((_,i)=>natural(raw.collection?.[i]));
  p.uniqueGoods=p.collection.filter(n=>n>0).length;
  p.favorites=[...new Set(raw.favorites||[])].filter(t=>Number.isInteger(t)&&t>=0&&t<GOODS.length&&p.collection[t]>0).slice(0,4);
  for(const [id,r] of Object.entries(raw.trail||{})){if(/^\d+$/.test(id)&&+id>=1&&+id<=LEVEL_COUNT&&r&&r.stars>=1)p.trail[id]={stars:natural(r.stars,3),score:natural(r.score),helps:natural(r.helps),seconds:natural(r.seconds)};}
  for(const [id,r] of Object.entries(raw.puzzles||{})){if(/^\d+$/.test(id)&&+id>=1&&+id<=LEVEL_COUNT&&r&&r.stars>=1)p.puzzles[id]={stars:natural(r.stars,3),moves:natural(r.moves),score:natural(r.score),helps:natural(r.helps),seconds:natural(r.seconds)};}
  p.puzzleWins=Object.keys(p.puzzles).length;p.puzzleStars=Object.values(p.puzzles).reduce((n,r)=>n+r.stars,0);
  p.trailWins=Object.keys(p.trail).length;p.trailStars=Object.values(p.trail).reduce((n,r)=>n+r.stars,0);
  for(const [date,r] of Object.entries(raw.dailyBest||{})){if(/^\d{4}-\d{2}-\d{2}$/.test(date)&&r)p.dailyBest[date]={moves:natural(r.moves),helps:natural(r.helps),score:natural(r.score),seconds:natural(r.seconds)};}
  p.dailyDays=Object.keys(p.dailyBest).length;
  for(const [key,entry] of Object.entries(raw.sessions).slice(-50)){if(!MODES.includes(key)&&!/^daily:\d{4}-\d{2}-\d{2}$/.test(key))continue;const state=upgradeGame(entry?.state);if(state)p.sessions[key]={state,history:(Array.isArray(entry.history)?entry.history:[]).map(upgradeGame).filter(Boolean).slice(-80)};}
  if(imported){
    // Collection totals bound replay counters; medals retain older recorded clears.
    const recorded=p.trailWins+p.puzzleWins+p.dailyDays;
    p.totalMatches=natural(p.totalMatches,Math.floor(p.collection.reduce((n,count)=>n+count,0)/3));
    p.completed=Math.max(recorded,natural(p.completed,Math.floor(p.totalMatches/6)));
    p.bestCombo=natural(p.bestCombo,Math.min(48,p.totalMatches));
    for(const k of ['perfect','rushWins','orders'])p[k]=natural(p[k],p.completed);
    p.pantryWins=natural(p.pantryWins,Math.min(p.completed,Math.floor(p.totalMatches/48)));
    if(!DECOR.some(d=>d.id===p.settings.decor&&p.completed>=d.requirement))p.settings.decor='home';
  }
  p.earned=ACHIEVEMENTS.filter(a=>(!imported&&(raw.earned||[]).includes(a.id))||p[a.stat]>=a.goal).map(a=>a.id);
  return p;
}
export function nextTrailLevel(p){for(let i=1;i<=LEVEL_COUNT;i++)if(!p.trail[i])return i;return LEVEL_COUNT;}
export function finishDelivery(p,state){
  if(state.rewarded||state.status!=='won')return [];
  state.rewarded=true;p.completed++;p.totalMatches+=state.matches;p.bestCombo=Math.max(p.bestCombo,state.bestCombo);
  const helps=state.hints+state.rearranges+state.undos+(state.magics||0);
  if(!helps)p.perfect++;
  if(state.order?.fulfilled)p.orders++;
  if(state.mode==='rush'&&!state.clockDisabled)p.rushWins++;
  if(state.mode==='pantry'&&state.total===144)p.pantryWins++;
  for(let i=0;i<GOODS.length;i++)p.collection[i]+=natural(state.matchedGoods?.[i]);
  p.uniqueGoods=p.collection.filter(n=>n>0).length;
  if(!p.favorites.length)p.favorites=p.collection.flatMap((n,i)=>n?[i]:[]).slice(0,4);
  const result={moves:state.moves,helps,score:state.score,seconds:Math.round(state.elapsed)};
  if(state.mode==='daily'){
    const prior=p.dailyBest[state.date];
    if(!prior||helps<prior.helps||helps===prior.helps&&state.score>prior.score||helps===prior.helps&&state.score===prior.score&&result.seconds<prior.seconds)p.dailyBest[state.date]=result;
    p.dailyDays=Object.keys(p.dailyBest).length;
  }
  if(state.mode==='puzzle'){
    const stars=starsFor(state),prior=p.puzzles[state.levelId];
    if(!prior||stars>prior.stars||stars===prior.stars&&state.moves<prior.moves)p.puzzles[state.levelId]={...result,stars};
    p.puzzleWins=Object.keys(p.puzzles).length;p.puzzleStars=Object.values(p.puzzles).reduce((n,r)=>n+r.stars,0);
  }
  if(state.mode==='trail'){
    const stars=starsFor(state),prior=p.trail[state.levelId];
    if(!prior||stars>prior.stars||stars===prior.stars&&state.score>prior.score)p.trail[state.levelId]={...result,stars};
    p.trailWins=Object.keys(p.trail).length;p.trailStars=Object.values(p.trail).reduce((n,r)=>n+r.stars,0);
  }
  const earned=ACHIEVEMENTS.filter(a=>!p.earned.includes(a.id)&&p[a.stat]>=a.goal);
  p.earned.push(...earned.map(a=>a.id));return earned;
}
export function backup(p){return JSON.stringify({format:'little-local-backup',exportedAt:new Date().toISOString(),profile:clone(p)},null,2);}
export function parseBackup(text){const data=JSON.parse(text);if(data?.format!=='little-local-backup')throw new Error('Choose a Little Local backup file.');const p=normalizeProfile(data.profile,{imported:true});if(!p)throw new Error('This backup could not be read. Your current progress is safe.');return p;}
