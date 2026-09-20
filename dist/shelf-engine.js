import {GOODS,THEMES,CHAPTERS,LEVEL_COUNT} from './content.js';
import {SHELF_PUZZLES} from './shelf-catalog.js';
import {copyShelves,shelfRemaining,shelfKey,shiftGood,solveShelves} from './shelf-rules.js';
export {shelfSpaces,shelfMoves,shiftGood} from './shelf-rules.js';
export const PUZZLE_COUNT=LEVEL_COUNT;
const clampId=id=>Math.min(PUZZLE_COUNT,Math.max(1,Math.trunc(Number(id)||1)));
export function puzzleSpec(id) {
  id=clampId(id);const chapterIndex=Math.floor((id-1)/50),chapter=CHAPTERS[chapterIndex],p=SHELF_PUZZLES[id-1];
  return {id,chapterIndex,theme:chapter.theme,name:['Make a little room','The missing third','Behind the counter','A careful exchange','The key ingredient','Unpack the possibilities','A useful empty space','A few moves ahead','The right order','The Saturday challenge'][(id-1)%10],target:p?.target||0,opening:p?.opening||0,mechanics:[],chainGoal:3};
}
export function createShelfGame(id=1) {
  id=clampId(id);const p=SHELF_PUZZLES[id-1];if(!p)throw Error('This shelf puzzle is not available.');
  const spec=puzzleSpec(id),palette=THEMES[spec.theme].palette;
  const shelves=p.shelves.map(s=>({...s,key:s.key===null?null:palette[s.key],rows:s.rows.map(r=>r.map(t=>t===null?null:palette[t]))}));
  return {version:3,mode:'puzzle',round:id,levelId:id,seed:id,theme:spec.theme,date:'',spec,shelves,tray:[],moves:0,matches:0,total:shelfRemaining(shelves),score:0,combo:0,bestCombo:0,lastMatchMove:0,hints:0,rearranges:0,undos:0,magics:0,elapsed:0,started:false,status:'playing',seconds:null,spark:0,lanterns:0,order:null,matchedGoods:Array(GOODS.length).fill(0)};
}
export function moveShelfGood(state,move) {
  if(state.mode!=='puzzle'||state.status!=='playing')return {ok:false};
  const result=shiftGood(state.shelves,move);if(!result)return {ok:false};
  state.shelves=result.shelves;state.moves++;state.started=true;
  state.combo=result.matches.length;state.bestCombo=Math.max(state.bestCombo,state.combo);
  for(const match of result.matches){state.matches++;state.matchedGoods[match.type]+=3;state.score+=100;}
  if(result.matches.length>1)state.score+=(result.matches.length-1)*50;
  if(!shelfRemaining(state.shelves))state.status='won';
  return {ok:true,...result};
}
export function puzzleStars(state) {return state.status==='won'?1+(state.hints===0?1:0)+(state.moves<=state.spec.target?1:0):0;}
export function nextPuzzle(profile){for(let i=1;i<=PUZZLE_COUNT;i++)if(!profile.puzzles?.[i])return i;return PUZZLE_COUNT;}
export function referenceHint(state) {
  let board=createShelfGame(state.levelId).shelves;
  const wanted=shelfKey(state.shelves),route=SHELF_PUZZLES[state.levelId-1].route;
  for(const move of route) {
    if(shelfKey(board)===wanted) {
      // The canonical board ignores position within a shelf. Translate the
      // proof's slots back to the actual positions on the player's board.
      const [from,slot,to]=move,type=board[from].rows[0][slot];
      return [from,state.shelves[from].rows[0].indexOf(type),to,state.shelves[to].rows[0].indexOf(null)];
    }
    board=shiftGood(board,move).shelves;
  }
  return null;
}
export function searchHint(state,options){return referenceHint(state)||solveShelves(copyShelves(state.shelves),options)?.[0]||null;}
export function describeMove(state,move){
  const [from,slot,to]=move,type=state.shelves[from].rows[0][slot],result=shiftGood(state.shelves,move);
  const action=`Move ${GOODS[type].name.toLowerCase()} from shelf ${from+1} to shelf ${to+1}.`;
  if(result.unlocked.length)return action+' This match opens the locked shelf.';
  if(result.matches.length)return action+' The triple clears here and frees working space.';
  if(result.revealed.length)return action+' Emptying that front row brings its back stock forward.';
  return action+' Use that space temporarily so you can uncover or assemble the next triple.';
}
export function validateShelfGame(s){
  if(!s||s.version!==3||s.mode!=='puzzle'||!Number.isInteger(s.levelId)||s.levelId<1||s.levelId>PUZZLE_COUNT||!Array.isArray(s.shelves)||!Array.isArray(s.tray)||s.tray.length||!['playing','won'].includes(s.status))return false;
  const spec=puzzleSpec(s.levelId),base=createShelfGame(s.levelId),item=t=>t===null||Number.isInteger(t)&&t>=0&&t<GOODS.length;
  if(s.theme!==base.theme||s.round!==s.levelId||s.total!==base.total||s.spec?.target!==spec.target||s.spec?.chapterIndex!==spec.chapterIndex||s.shelves.length!==base.shelves.length)return false;
  if(!s.shelves.every((sh,i)=>sh&&[0,1].includes(sh.lock)&&sh.key===base.shelves[i].key&&!(sh.lock&&!base.shelves[i].lock)&&Array.isArray(sh.rows)&&sh.rows.length>=1&&sh.rows.length<=base.shelves[i].rows.length&&sh.rows.every(r=>Array.isArray(r)&&r.length===3&&r.every(item))))return false;
  for(const k of ['moves','matches','score','hints','undos','elapsed','bestCombo','combo','lastMatchMove','rearranges','magics','spark','lanterns'])if(!Number.isFinite(s[k])||s[k]<0)return false;
  if(!Number.isInteger(s.moves)||!Number.isInteger(s.matches)||!Array.isArray(s.matchedGoods)||s.matchedGoods.length!==GOODS.length||s.matchedGoods.some(n=>!Number.isInteger(n)||n<0||n%3!==0))return false;
  if(s.shelves.some(sh=>sh.key!==null&&(!sh.lock)!==(s.matchedGoods[sh.key]>=3)))return false;
  const current=Array(GOODS.length).fill(0),original=Array(GOODS.length).fill(0);
  for(const sh of s.shelves)for(const t of sh.rows.flat())if(t!==null)current[t]++;
  for(const sh of base.shelves)for(const t of sh.rows.flat())if(t!==null)original[t]++;
  return current.every((n,t)=>n+s.matchedGoods[t]===original[t])&&s.matchedGoods.reduce((a,b)=>a+b,0)===s.matches*3&&(s.status==='won')===(shelfRemaining(s.shelves)===0);
}
