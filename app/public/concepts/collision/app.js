import { StemPlayer } from './audio.js'
import { CollisionWorld } from './world.js'

const byId=(id)=>document.getElementById(id)
const player=new StemPlayer(),canvas=byId('world'),status=byId('status')
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)')
let view=motionPreference.matches?'still':'motion',world=null,manifest=null,loading=false,frameId=0,settleUntil=0,previousFrame=0
const formatTime=(seconds)=>`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`

function ui(){
  byId('play-label').textContent=player.playing?'Pause':'Play'
  byId('play-icon').textContent=player.playing?'Ⅱ':'▶'
  byId('play').setAttribute('aria-label',player.playing?'Pause concept':'Play concept')
  byId('stage-play').hidden=player.playing||loading
  byId('stage').classList.toggle('is-playing',player.playing)
  byId('stage').dataset.playing=String(player.playing)
  byId('stage').dataset.view=view
  byId('visual-state').textContent=view==='still'?(player.playing?'Still artwork · music playing':'Still artwork'):player.playing?'Following the sound':'Ready when you are'
  document.querySelectorAll('[data-view]').forEach((b)=>b.setAttribute('aria-pressed',String(b.dataset.view===view)))
  document.querySelectorAll('[data-mix]').forEach((b)=>b.setAttribute('aria-pressed',String(b.dataset.mix===player.mode)))
}

function draw(now){
  frameId=0
  if(document.hidden)return
  // Cap work at 45fps on phones; still mode renders only when state changes.
  const limit=innerWidth<700?1000/45:1000/60
  if(now-previousFrame>=limit){
    previousFrame=now
    const position=player.position()
    byId('position').value=String(position);byId('elapsed').textContent=formatTime(position)
    if(view==='motion'||now<settleUntil)world?.draw(position,player.levels(),player.mode,view==='motion'&&player.playing)
  }
  if(player.playing||now<settleUntil)frameId=requestAnimationFrame(draw)
}
function repaint(){settleUntil=performance.now()+350;if(!frameId)frameId=requestAnimationFrame(draw)}

try{world=new CollisionWorld(canvas);byId('stage').dataset.renderer='webgl'}
catch{canvas.hidden=true;byId('fallback').hidden=false;view='still';document.querySelector('[data-view="motion"]').disabled=true;byId('stage').dataset.renderer='fallback';status.textContent='3D is unavailable on this browser. The artwork and audio controls still work.'}

const ready=fetch('./demo.json',{signal:AbortSignal.timeout(15000)}).then(async(response)=>{
  if(!response.ok)throw new Error('The demo details could not load. Reload to try again.')
  const data=await response.json()
  if(!['files','synth'].includes(data.mode)||!Number.isFinite(data.duration)||data.duration<=0||data.duration>90)throw new Error('The demo configuration is invalid.')
  manifest=data
  for(const [id,key] of [['edition','edition'],['backing-name','backingName'],['lead-name','leadName'],['credit','credit']])byId(id).textContent=data[key]
  byId('tempo-label').textContent=`${data.bpm} BPM / ${data.duration} SEC`
  byId('duration').textContent=formatTime(data.duration);byId('position').max=String(data.duration)
}).catch((error)=>{status.textContent=error.message;byId('play').disabled=true;byId('stage-play').disabled=true})

async function toggle(){
  if(loading)return
  if(player.playing){player.pause();status.textContent='Paused. Pick up where you left off.';ui();repaint();return}
  loading=true;byId('play').disabled=true;byId('stage-play').disabled=true;status.textContent='Loading the two ingredients…';ui()
  try{
    // Create/resume from this click for mobile autoplay rules, before waiting on fetches.
    player.context??=new AudioContext();await player.context.resume()
    await ready
    if(!manifest)throw new Error('Reload the page to load the demo details.')
    await player.load(manifest)
    if(document.hidden)throw new Error('Audio is ready. Return to this page and tap Play.')
    await player.play()
    byId('position').max=String(player.duration);byId('duration').textContent=formatTime(player.duration)
    status.textContent='Playing. Switch ingredients to hear what moves each shape.'
  }catch(error){status.textContent=error instanceof Error?error.message:'Audio could not start. Try Play again.'}
  finally{loading=false;byId('play').disabled=false;byId('stage-play').disabled=false;ui();repaint()}
}
byId('play').addEventListener('click',()=>void toggle());byId('stage-play').addEventListener('click',()=>void toggle())
byId('restart').addEventListener('click',async()=>{await player.seek(0);if(!player.playing)await toggle();ui();repaint()})
byId('position').addEventListener('input',async(event)=>{await player.seek(Number(event.target.value));ui();repaint()})
document.querySelectorAll('[data-mix]').forEach((button)=>button.addEventListener('click',()=>{
  player.setMode(button.dataset.mix)
  const descriptions={both:'Both ingredients together.',lead:`${manifest?.leadName??'Lead'} only. The orange ribbon follows this ingredient.`,backing:`${manifest?.backingName??'Backing'} only. The dark sculpture follows this ingredient.`}
  status.textContent=descriptions[player.mode]+(player.playing?' Same position and mix levels.':' Tap Play to listen.')
  ui();repaint()
}))
document.querySelectorAll('[data-view]').forEach((button)=>button.addEventListener('click',()=>{
  view=button.dataset.view;status.textContent=view==='still'?'Still artwork. The audio and its position are unchanged.':'Motion follows the two audio ingredients.';ui();repaint()
}))
motionPreference.addEventListener('change',(event)=>{if(event.matches){view='still';ui();repaint()}})
canvas.addEventListener('pointermove',(event)=>{if(event.pointerType==='mouse'&&world&&!motionPreference.matches){const rect=canvas.getBoundingClientRect();world.pointer=[(event.clientX-rect.left)/rect.width-.5,(event.clientY-rect.top)/rect.height-.5]}})
canvas.addEventListener('pointerleave',()=>{if(world)world.pointer=[0,0]})
canvas.addEventListener('webglcontextlost',(event)=>{event.preventDefault();view='still';canvas.hidden=true;byId('fallback').hidden=false;document.querySelector('[data-view="motion"]').disabled=true;status.textContent='3D paused by the device. Audio remains available.';ui();repaint()})
window.addEventListener('resize',repaint)
document.addEventListener('visibilitychange',()=>{if(document.hidden){player.pause();cancelAnimationFrame(frameId);frameId=0;status.textContent='Paused while the page was in the background. Tap Play to resume.';ui()}else repaint()})
window.addEventListener('pagehide',()=>{player.pause();cancelAnimationFrame(frameId);frameId=0})
window.addEventListener('pageshow',()=>{ui();repaint()})
player.onended=()=>{status.textContent='That’s the idea. Compare Still artwork, or replay with one ingredient.';ui();repaint()}
ui();repaint()
