"""Authenticated Green Room technical-analysis worker."""
import hashlib
import hmac
import json
import os
import subprocess
import tempfile
import time
import uuid
from pathlib import Path
import modal
from fastapi import Request

app = modal.App("mashups-green-room-processor")
processor_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg", "libsndfile1")
    .pip_install("fastapi[standard]", "librosa==0.11.0", "numpy==2.2.6", "pyloudnorm==0.1.1", "requests==2.32.4", "soundfile==0.13.1")
)

@app.function(image=processor_image,secrets=[modal.Secret.from_name("mashups-green-room")],timeout=600,memory=4096)
@modal.fastapi_endpoint(method="POST")
async def process(request: Request):
    from fastapi import HTTPException
    secret=os.environ.get("GREEN_ROOM_PROCESSOR_SECRET")
    if not secret or not hmac.compare_digest(request.headers.get("authorization",""),f"Bearer {secret}"):
        raise HTTPException(status_code=401,detail="Unauthorized")
    payload=await request.json()
    job_id=payload.get("jobId");dispatch_token=payload.get("dispatchToken");job_type=payload.get("jobType")
    asset_url=payload.get("assetUrl");callback_url=payload.get("callbackUrl")
    try: uuid.UUID(job_id);uuid.UUID(dispatch_token)
    except (ValueError,TypeError): raise HTTPException(status_code=400,detail="Invalid durable job identity")
    if job_type!="analyze" or not asset_url or not callback_url:
        raise HTTPException(status_code=400,detail="Analysis job envelope required")
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            source_path=Path(tmpdir)/"source-audio";_download(asset_url,source_path);analysis=_analyze(source_path)
        result={"jobId":job_id,"dispatchToken":dispatch_token,"status":"succeeded","analysis":analysis}
    except Exception:
        result={"jobId":job_id,"dispatchToken":dispatch_token,"status":"failed","errorCode":"ANALYSIS_FAILED","errorMessage":"Analysis worker could not finish; inspect private worker logs."}
    _callback(callback_url,secret,result)
    return {"accepted":True,"jobId":job_id}

def _download(url:str,destination:Path)->None:
    import requests
    max_bytes=250*1024*1024
    with requests.get(url,stream=True,allow_redirects=False,timeout=(10,180)) as response:
        if response.status_code!=200: raise ValueError("Authorized source fetch failed")
        content_type=response.headers.get("content-type","").split(";",1)[0].lower()
        if content_type and not(content_type.startswith("audio/") or content_type=="application/octet-stream"): raise ValueError("Private asset did not return audio")
        total=0
        with destination.open("wb") as output:
            for chunk in response.iter_content(1024*1024):
                if chunk:
                    total+=len(chunk)
                    if total>max_bytes: raise ValueError("Source exceeds pilot limit")
                    output.write(chunk)
    _probe_audio(destination)

def _callback(url:str,secret:str,payload:dict)->None:
    import requests
    body=json.dumps(payload,separators=(",",":"),allow_nan=False)
    for attempt in range(4):
        timestamp=str(int(time.time()*1000));signature=hmac.new(secret.encode(),f"{timestamp}.{body}".encode(),hashlib.sha256).hexdigest()
        try:
            response=requests.post(url,data=body,allow_redirects=False,headers={"Authorization":f"Bearer {secret}","Content-Type":"application/json","X-Green-Timestamp":timestamp,"X-Green-Signature":signature},timeout=(10,60))
            if response.ok and response.json().get("ok") is True:return
            if 400<=response.status_code<500 and response.status_code not in(409,429):break
        except (requests.RequestException,ValueError): pass
        time.sleep(2**attempt)
    raise RuntimeError("Processor callback receipt was not confirmed")

def _probe_audio(source_path:Path)->None:
    completed=subprocess.run(["ffprobe","-v","error","-select_streams","a:0","-show_entries","stream=codec_type,sample_rate:format=duration","-of","json",str(source_path)],capture_output=True,check=True,text=True,timeout=30)
    probe=json.loads(completed.stdout);streams=probe.get("streams") or []
    if not streams or streams[0].get("codec_type")!="audio":raise ValueError("Source has no decodable audio")
    duration=float((probe.get("format") or {}).get("duration") or 0)
    if duration<8 or duration>1200:raise ValueError("Source duration outside pilot")

def _analyze(source_path:Path)->dict:
    import librosa
    import numpy as np
    import pyloudnorm as pyln
    audio,sample_rate=librosa.load(str(source_path),sr=44100,mono=True,duration=420)
    if audio.size<sample_rate*8:raise ValueError("Source too short")
    tempo,beat_frames=librosa.beat.beat_track(y=audio,sr=sample_rate,units="frames")
    tempo_value=float(np.asarray(tempo).reshape(-1)[0]);beat_times=librosa.frames_to_time(beat_frames,sr=sample_rate);intervals=np.diff(beat_times)
    phrase_confidence=0.0 if intervals.size<8 else float(np.clip(1.0-np.std(intervals)/max(np.mean(intervals),1e-6),0.0,1.0))
    chroma=librosa.feature.chroma_cqt(y=audio,sr=sample_rate);musical_key,camelot_key=_estimate_key(np.mean(chroma,axis=1))
    meter=pyln.Meter(sample_rate);integrated_lufs=float(meter.integrated_loudness(audio));true_peak_db=float(20*np.log10(max(float(np.max(np.abs(audio))),1e-9)))
    return {"bpm":round(tempo_value,2),"musicalKey":musical_key,"camelotKey":camelot_key,"integratedLufs":round(integrated_lufs,2),"truePeakDb":round(true_peak_db,2),"vocalBleedDb":None,"separationSdrDb":None,"phraseConfidence":round(phrase_confidence,4),"sampleScanStatus":"unavailable"}

def _estimate_key(chroma):
    import numpy as np
    major=np.array([6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88]);minor=np.array([6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17])
    pitches=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];maj=["8B","3B","10B","5B","12B","7B","2B","9B","4B","11B","6B","1B"];minr=["5A","12A","7A","2A","9A","4A","11A","6A","1A","8A","3A","10A"]
    normalized=(chroma-np.mean(chroma))/max(np.std(chroma),1e-9);scores=[]
    for root in range(12):scores.extend([(float(np.dot(normalized,np.roll(major,root))),root,"major"),(float(np.dot(normalized,np.roll(minor,root))),root,"minor")])
    _,root,mode=max(scores,key=lambda item:item[0]);return f"{pitches[root]} {mode}",maj[root] if mode=="major" else minr[root]
