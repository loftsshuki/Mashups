import 'react-native-url-polyfill/auto'
import React, { useEffect, useState } from 'react'
import { AppState, Button, Linking, ScrollView, Share, Text, TextInput, View } from 'react-native'
import { createClient, type Session } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { randomUUID } from 'expo-crypto'
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio'
import { publicationBlocker, type StudioSnapshot } from '../../app/src/lib/green-room/studio-contract'
import { GREEN_ARRANGEMENT_IDS } from '@mashups/contracts'
const base=(process.env.EXPO_PUBLIC_API_URL??'').replace(/\/$/,'')
const url=process.env.EXPO_PUBLIC_SUPABASE_URL, key=process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
const supabase=url&&key ? createClient(url,key,{auth:{storage:{getItem:SecureStore.getItemAsync,setItem:SecureStore.setItemAsync,removeItem:SecureStore.deleteItemAsync},persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}}):null
type Track={id:string;trackTitle:string;artistName:string}
type Saved={id:string;title:string;sources:{kind:string}}
export default function App(){
 const player=useAudioPlayer(null)
 const [session,setSession]=useState<Session|null>(null),[email,setEmail]=useState(''),[password,setPassword]=useState('')
 const [message,setMessage]=useState(''),[busy,setBusy]=useState(false)
 const [projects,setProjects]=useState<Saved[]>([]),[tracks,setTracks]=useState<Track[]>([])
 const [project,setProject]=useState<StudioSnapshot|null>(null),[left,setLeft]=useState(''),[right,setRight]=useState('')
 const [listenId,setListenId]=useState<string|null>(null),[listenTitle,setListenTitle]=useState('')
 const [target,setTarget]=useState('128')
 async function api(path:string,body?:unknown){
  if(!/^https:\/\//.test(base))throw new Error('Set the HTTPS staging API URL.')
  const current=(await supabase?.auth.getSession())?.data.session
  const response=await fetch(base+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(current?{Authorization:`Bearer ${current.access_token}`}:{})},...(body?{body:JSON.stringify(body)}:{})})
  const data=await response.json();if(!response.ok)throw new Error(data.error??'Request failed.');return data
 }
 async function run(work:()=>Promise<void>){if(busy)return;setBusy(true);setMessage('');try{await work()}catch(error){setMessage(error instanceof Error?error.message:'Request could not be confirmed.')}finally{setBusy(false)}}
 async function loadProject(id:string){const data=await api(`/api/green/studio?projectId=${encodeURIComponent(id)}`);if(data.project?.id!==id)throw new Error('Unexpected project receipt.');setProject(data.project)}
 async function refresh(){const data=await api('/api/green/projects');setProjects(data.projects??[])}
 useEffect(()=>{
  if(!supabase)return
  void supabase.auth.getSession().then(({data})=>setSession(data.session)).catch(()=>setMessage('Stored sign-in could not be restored.'))
  const {data}=supabase.auth.onAuthStateChange((_event,next)=>setSession(next))
  const active=AppState.addEventListener('change',state=>{if(state==='active')supabase.auth.startAutoRefresh();else{supabase.auth.stopAutoRefresh();player.pause()}})
  void setAudioModeAsync({playsInSilentMode:true,interruptionMode:'doNotMix'}).catch(()=>setMessage('Audio session could not be configured.'))
  return()=>{data.subscription.unsubscribe();active.remove();supabase.auth.stopAutoRefresh()}
 },[player])
 useEffect(()=>{if(session)void refresh().catch(error=>setMessage(error.message));else{setProjects([]);setProject(null);player.pause()}},[session?.user.id])
 useEffect(()=>{
  let cancelled=false
  void api('/api/green/catalog').then(data=>{if(!cancelled)setTracks(data.mode==='live'?data.tracks:[])}).catch(error=>{if(!cancelled)setMessage(error.message)})
  const open=(value:string)=>{try{const u=new URL(value);const id=u.protocol==='mashups:'&&u.hostname==='listen'?u.pathname.slice(1):u.origin===base&&u.pathname.startsWith('/listen/')?u.pathname.split('/')[2]:null;if(id&&/^[a-f0-9-]{36}$/i.test(id))setListenId(id)}catch{}}
  void Linking.getInitialURL().then(value=>{if(value)open(value)})
  const subscription=Linking.addEventListener('url',event=>open(event.url))
  return()=>{cancelled=true;subscription.remove()}
 },[])
 useEffect(()=>{if(listenId)void api(`/api/green/publications/${listenId}`).then(data=>setListenTitle(data.publication.title)).catch(error=>{setListenTitle('');setMessage(error.message)})},[listenId])
 useEffect(()=>{if(!project||project.status!=='rendering')return;const timer=setInterval(()=>{void loadProject(project.id).catch(error=>setMessage(error.message))},3000);return()=>clearInterval(timer)},[project?.id,project?.status])
 async function action(name:string,extra:Record<string,unknown>={}){const id=project?.id??randomUUID();const data=await api('/api/green/studio',{action:name,projectId:id,expectedRevision:project?.revision,...extra});if(!data.project)throw new Error('Unconfirmed action. Reload to check the saved state.');setProject(data.project);await refresh()}
 async function play(path:string,authenticated:boolean){const current=(await supabase?.auth.getSession())?.data.session;player.replace({uri:base+path,...(authenticated&&current?{headers:{Authorization:`Bearer ${current.access_token}`}}:{})});player.play()}
 if(!supabase||!/^https:\/\//.test(base))return <View style={{padding:28,paddingTop:80}}><Text>Configure the three public staging variables from .env.example. Never put service-role, Stripe, or processor secrets in this app.</Text></View>
 return <ScrollView contentContainerStyle={{padding:24,paddingTop:64,paddingBottom:64,gap:18}} keyboardShouldPersistTaps="handled">
  <Text style={{fontSize:36,fontWeight:'800'}}>Mashups Beta</Text><Text>Shared catalog. Three arrangements. One kept cut.</Text>
  {!!message&&<Text accessibilityRole="alert">{message}</Text>}
  {listenId&&!!listenTitle&&<View style={{gap:12}}><Text style={{fontSize:24}}>{listenTitle}</Text><Button title="Play publication" onPress={()=>void run(()=>play(`/api/green/publications/${listenId}/audio`,false))}/><Button title="Make my version" disabled={!session||busy} onPress={()=>void run(async()=>{const data=await api('/api/green/studio',{action:'fork',parentId:listenId,projectId:randomUUID()});setProject(data.project);await refresh()})}/></View>}
  {!session?<View style={{gap:12}}><TextInput accessibilityLabel="Email" placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={{borderWidth:1,padding:14}}/><TextInput accessibilityLabel="Password" placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{borderWidth:1,padding:14}}/><Button title="Sign in" disabled={busy} onPress={()=>void run(async()=>{const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw new Error(error.message);setPassword('')})}/></View>:<>
   <Button title="Sign out" onPress={()=>void run(async()=>{player.pause();const {error}=await supabase.auth.signOut();if(error)throw error})}/>
   <Text style={{fontSize:24,fontWeight:'700'}}>Saved projects</Text>{projects.map(p=><Button key={p.id} title={p.title} onPress={()=>void run(async()=>{if(p.sources.kind!=='catalog')throw new Error('Open this synthesized device recipe on the web.');await loadProject(p.id)})}/>)}
   <Button title="New catalog project" onPress={()=>{player.pause();setProject(null)}}/>
   {!project?<><Text>Select two approved tracks.</Text>{tracks.map(track=><View key={track.id} style={{gap:6,paddingVertical:8}}><Text>{track.trackTitle} / {track.artistName}</Text><Button title={left===track.id?'Selected A':'Use as A'} onPress={()=>setLeft(track.id)}/><Button title={right===track.id?'Selected B':'Use as B'} onPress={()=>setRight(track.id)}/></View>)}<Button title="Create saved project" disabled={busy||!left||!right||left===right} onPress={()=>void run(()=>action('create',{title:'Mobile mashup',leftId:left,rightId:right}))}/></>:<>
    <Text style={{fontSize:26,fontWeight:'700'}}>{project.title}</Text><Text>{project.status} · Revision {project.revision}</Text>
    {project.status==='draft'&&<><TextInput accessibilityLabel="Target BPM" keyboardType="numeric" value={target} onChangeText={setTarget} style={{borderWidth:1,padding:14}}/><Button title="Generate three arrangements" disabled={busy} onPress={()=>void run(()=>action('render',{requestId:randomUUID(),recipe:{targetBpm:Number(target),durationSeconds:20,leftStartSeconds:0,rightStartSeconds:0,leftSemitones:0,rightSemitones:0}}))}/><Text>Start points and pitch are zero in this beta. Use the web studio for precise excerpt settings.</Text></>}
    {project.candidates.map(candidate=><View key={candidate.id} style={{gap:10,paddingVertical:12}}><Text>{GREEN_ARRANGEMENT_IDS.includes(candidate.arrangement as typeof GREEN_ARRANGEMENT_IDS[number])?candidate.arrangement:'Arrangement'} / {candidate.qualityStatus}</Text><Button title="Play candidate" onPress={()=>void run(()=>play(candidate.audioPath,true))}/><Button title={project.selectedCandidateId===candidate.id?'Kept':'Keep'} disabled={busy||project.status!=='ready'||candidate.qualityStatus==='failed'} onPress={()=>void run(()=>action('select',{candidateId:candidate.id}))}/></View>)}
    <Text>{publicationBlocker(project)??'Ready for the publication permission check.'}</Text>
    {project.publicationPath?<Button title="Share listening link" onPress={()=>void Share.share({message:base+project.publicationPath!}).catch(()=>setMessage('Sharing was unavailable.'))}/>:<Button title="Publish" disabled={busy||Boolean(publicationBlocker(project))} onPress={()=>void run(()=>action('publish'))}/>}
    <Button title="Refresh project" onPress={()=>void run(()=>loadProject(project.id))}/>
   </>}
  </>}
  <Button title="Pause audio" onPress={()=>player.pause()}/>
 </ScrollView>
}
