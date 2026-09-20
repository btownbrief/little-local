import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const app=await readFile(new URL('../dist/app.js',import.meta.url),'utf8');
const section=(start,end)=>{
  const a=app.indexOf(start),b=app.indexOf(end,a+start.length);
  assert.ok(a>=0&&b>a);return app.slice(a,b);
};
const turn=()=>new Promise(resolve=>setImmediate(resolve));
const opening={picks:[{shelf:0,slot:0},{shelf:1,slot:0},{shelf:2,slot:0}]};
function lantern(overrides={}){
  const context={state:{mode:'cozy',status:'playing',lanterns:1,magics:0,tray:[]},busy:false,paused:false,
    hint:()=>opening,chooseBasketGood:async()=>true,toast:()=>{},render:()=>{},save:()=>{},...overrides};
  runInNewContext(section('async function choose(shelf,slot){','async function chooseBasketGood')+
    section('async function useLantern(){','function actionError'),context);
  return context;
}

test('lantern holds the input guard while its own picks finish',async()=>{
  let release,calls=0;
  const gate=new Promise(resolve=>{release=resolve;});
  const c=lantern({chooseBasketGood:()=>++calls===1?gate:Promise.resolve(true)});
  const sequence=c.useLantern();
  assert.equal(c.busy,true);assert.equal(await c.choose(0,0),false);
  await c.useLantern();assert.equal(c.state.magics,1);assert.equal(calls,1);
  release(true);await sequence;
  assert.equal(calls,3);assert.equal(c.busy,false);
  assert.equal(await c.choose(0,0),true);
});

test('lantern releases the guard on missing hints, interrupted picks and errors',async()=>{
  for(const overrides of [{hint:()=>null},{chooseBasketGood:async()=>false},
    {hint:()=>{throw new Error('Hint stopped');}},
    {chooseBasketGood:async()=>{throw new Error('Pick stopped');}},
    {render:()=>{throw new Error('Render stopped');}}]){
    const c=lantern(overrides);
    await c.useLantern().catch(()=>{});
    assert.equal(c.busy,false);
  }
  let calls=0;
  const c=lantern({chooseBasketGood:async()=>{calls++;c.state={status:'playing',tray:[]};c.busy=false;return true;}});
  await c.useLantern();assert.equal(calls,1);assert.equal(c.busy,false);
});

test('modified U and H shortcuts leave browser actions alone',()=>{
  let handler,undos=0,hints=0,prevented=0;
  const context={document:{addEventListener:(name,callback)=>{handler=callback;}},
    $:()=>({open:false}),state:{mode:'cozy'},undo:()=>undos++,showHint:()=>hints++};
  runInNewContext(app.split('\n').find(line=>line.startsWith("document.addEventListener('keydown'")),context);
  for(const key of ['u','U','h','H'])for(const modifier of ['ctrlKey','metaKey','altKey']){
    handler({key,[modifier]:true,target:{tagName:'BODY'},preventDefault:()=>prevented++});
  }
  assert.equal(undos+hints+prevented,0);
  for(const key of ['u','h'])handler({key,target:{tagName:'BODY'},preventDefault:()=>prevented++});
  assert.equal(undos,1);assert.equal(hints,1);assert.equal(prevented,2);
});

test('board, lantern and modal clicks handle rejected actions',async()=>{
  const listeners=new Map();let errors=0;
  const reject=async()=>{throw new Error('Action stopped');};
  const context={$:selector=>({addEventListener:(name,callback)=>listeners.set(`${selector}:${name}`,callback)}),
    performance:{now:()=>1},suppressShelfClick:0,choose:reject,useLantern:reject,actionError:()=>errors++,
    installPrompt:{prompt:reject}};
  for(const name of ['shelfHelp','otherModes','pantryMenu','settings','restartConfirm','share','exportProgress',
    'downloadBackup','copyBackup','pasteImport'])context[name]=reject;
  runInNewContext(app.split('\n').find(line=>line.startsWith("$('#board').addEventListener('click'"))+
    section("$('#lantern-button').addEventListener('click'","$('#specials').addEventListener")+
    section("$('#modal').addEventListener('click'","$('#modal').addEventListener('change'"),context);
  listeners.get('#board:click')({target:{closest:selector=>selector==='.item[data-slot]'?{dataset:{shelf:'0',slot:'0'}}:null}});
  listeners.get('#lantern-button:click')();
  for(const action of ['install','share','copy-backup'])listeners.get('#modal:click')({target:{closest:()=>({dataset:{action}})}});
  await turn();assert.equal(errors,5);
});

test('rejected audio resumes are handled for notes and ambience',async()=>{
  const source=await readFile(new URL('../dist/audio.js',import.meta.url),'utf8');let resumes=0;
  const context={window:{AudioContext:class{
    state='suspended';sampleRate=8;
    resume(){resumes++;return Promise.reject(new Error('Audio unavailable'));}
  }}};
  runInNewContext(source.replaceAll('export function','function'),context);
  context.playNote({sound:true,volume:.5});context.setAmbience({ambience:'rain',volume:.5});
  await turn();assert.equal(resumes,2);
});
