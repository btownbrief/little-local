import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

export function cacheVersion(source){
  const match=source.match(/\bconst\s+CACHE\s*=\s*['"]little-local-offline-v(\d+(?:\.\d+)*)['"]/);
  if(!match)throw new Error('Missing or invalid service-worker CACHE version.');
  return match[1];
}

export function checkVersion(local,released){
  const current=cacheVersion(local),prior=cacheVersion(released);
  const a=current.split('.').map(Number),b=prior.split('.').map(Number);
  for(let i=0;i<Math.max(a.length,b.length);i++){
    if((a[i]||0)>(b[i]||0))return {current,prior};
    if((a[i]||0)<(b[i]||0))break;
  }
  throw new Error(`Bump dist/sw.js CACHE: local v${current} must be newer than released v${prior}.`);
}

// Compare against what is actually deployed. `npm run check` runs on planes and
// in CI boxes with no egress, so an unreachable release is a skip, not a
// failure — only a version that really has not been bumped fails the build.
export async function checkRelease(){
  const url='https://play.btownbrief.com/little-local/sw.js';
  const local=await readFile(new URL('../dist/sw.js',import.meta.url),'utf8');
  let released;
  try{
    const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    released=await response.text();
  }catch(error){
    console.log(`Service-worker cache: v${cacheVersion(local)} (skipped the released check — ${error.message}).`);
    return;
  }
  const {current,prior}=checkVersion(local,released);
  console.log(`Service-worker cache: v${current} > released v${prior}.`);
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  checkRelease().catch(error=>{console.error(error.message);process.exitCode=1;});
}
