// Small synthesized sounds: no downloads, tracking, or autoplay.
let context,ambient,ambientGain,ambientKind='off';
const get=()=>context??=new(window.AudioContext||window.webkitAudioContext)();
export function playNote(settings,match=false,position=0){if(!settings.sound)return;try{const c=get();if(c.state==='suspended')c.resume().catch(()=>{});const notes=match?[523.25,659.25,783.99]:[329.63+position*35];notes.forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain(),start=c.currentTime+i*.065;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(.10*settings.volume,start+.01);g.gain.exponentialRampToValueAtTime(.001,start+.23);o.connect(g);g.connect(c.destination);o.start(start);o.stop(start+.25);});}catch{}}
export function setAmbience(settings,active=true){
  const wanted=active?settings.ambience:'off';
  if(wanted===ambientKind){if(ambientGain)ambientGain.gain.value=settings.volume*.065;return;}
  if(ambient){try{ambient.stop();ambient.disconnect();}catch{}ambient=null;ambientGain=null;}ambientKind='off';
  if(wanted==='off')return;
  try{const c=get();if(c.state==='suspended')c.resume().catch(()=>{});const length=c.sampleRate*6,buffer=c.createBuffer(1,length,c.sampleRate),data=buffer.getChannelData(0);let previous=0;for(let i=0;i<length;i++){const white=Math.random()*2-1;previous=(previous+.025*white)/1.025;data[i]=wanted==='rain'?white*.4:previous*5*(.5+.35*Math.sin(i/c.sampleRate*.9));}ambient=c.createBufferSource();ambient.buffer=buffer;ambient.loop=true;const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=wanted==='rain'?1700:500;ambientGain=c.createGain();ambientGain.gain.value=settings.volume*.065;ambient.connect(filter);filter.connect(ambientGain);ambientGain.connect(c.destination);ambient.start();ambientKind=wanted;}catch{}
}
