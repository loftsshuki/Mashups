"""Bounded real-PCM preview renderer.

No provider calls, rights decisions, or claims of musical approval. Inputs must
already be authorized and provenance-bound. Outputs always require listening
review even when their technical measurements pass.
"""
from __future__ import annotations
import hashlib
import json
import math
import re
import subprocess
import time
from pathlib import Path

KINDS=("stem_vocal","stem_drums","stem_bass","stem_other")
ROLES=tuple(f"{side}:{kind}" for side in ("left","right") for kind in KINDS)
ARRANGEMENTS=("vocal-a-over-b","vocal-b-over-a","drop-swap")
MIN_TEMPO_RATIO=0.84
MAX_TEMPO_RATIO=1.19
TRANSITION_SECONDS=0.25

def command(args:list[str],timeout:int=180)->subprocess.CompletedProcess[str]:
    result=subprocess.run(args,capture_output=True,text=True,timeout=timeout)
    if result.returncode: raise RuntimeError(f"Audio command failed: {Path(args[0]).name}")
    return result

def probe(path:Path)->float:
    value=json.loads(command(["ffprobe","-v","error","-show_entries","format=duration","-of","json",str(path)]).stdout)
    duration=float(value["format"]["duration"])
    if not math.isfinite(duration) or not 0<duration<=1200: raise ValueError("Audio duration is outside the pilot limit")
    return duration

def measure(path:Path)->dict[str,float]:
    result=command(["ffmpeg","-hide_banner","-nostdin","-i",str(path),"-af","loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json","-f","null","-"])
    blocks=re.findall(r'\{\s*"input_i".*?\}',result.stderr,re.S)
    if not blocks: raise ValueError("Audio measurements unavailable")
    raw=json.loads(blocks[-1]);levels={"integratedLufs":float(raw["input_i"]),"truePeakDb":float(raw["input_tp"])}
    if not all(math.isfinite(value) for value in levels.values()): raise ValueError("Silent or unmeasurable output")
    return levels

def number(recipe:dict,key:str,low:float,high:float)->float:
    value=recipe.get(key)
    if isinstance(value,bool) or not isinstance(value,(float,int)) or not math.isfinite(value) or not low<=value<=high: raise ValueError(f"Invalid {key}")
    return float(value)

def tempo_ratio(source_bpm:float,target_bpm:float)->float:
    ratio=target_bpm/source_bpm
    if not MIN_TEMPO_RATIO<=ratio<=MAX_TEMPO_RATIO:
        raise ValueError("Tempo change exceeds the conservative pilot range")
    return ratio

def start_alignment(start:float,bpm:float)->dict[str,float|bool]:
    beat=60.0/bpm
    nearest=round(start/beat)*beat
    return {"nearestBeatSeconds":round(nearest,4),"offsetFromNearestBeat":round(abs(start-nearest),4),"nearBeat":abs(start-nearest)<=0.08}

def prepare(path:Path,output:Path,*,source_bpm:float,target_bpm:float,start:float,duration:float,semitones:float)->float:
    ratio=tempo_ratio(source_bpm,target_bpm)
    if start+duration*ratio>probe(path)+0.02: raise ValueError("Source excerpt is too short; choose an earlier start or shorter preview")
    filters=[f"atrim=start={start}:duration={duration*ratio}","asetpts=PTS-STARTPTS","aresample=44100","aformat=channel_layouts=stereo"]
    if abs(ratio-1)>1e-9 or semitones: filters.append(f"rubberband=tempo={ratio}:pitch={2**(semitones/12)}")
    filters.extend(["apad",f"atrim=duration={duration}"])
    command(["ffmpeg","-hide_banner","-loglevel","error","-nostdin","-y","-i",str(path),"-af",",".join(filters),"-ar","44100","-ac","2","-c:a","pcm_s24le",str(output)])
    return ratio

def render_candidates(stems:dict[str,Path],recipe:dict,destination:Path)->list[dict]:
    if set(stems)!=set(ROLES): raise ValueError("Exactly eight canonical source stems are required")
    if destination.exists(): raise ValueError("Refusing to overwrite an existing render directory")
    duration=number(recipe,"durationSeconds",8,30);target=number(recipe,"targetBpm",60,180)
    settings={side:(number(recipe,side+"Bpm",60,180),number(recipe,side+"StartSeconds",0,600),number(recipe,side+"Semitones",-3,3)) for side in ("left","right")}
    if any(not path.is_file() for path in stems.values()): raise ValueError("A source stem is missing")
    for bpm,_,_ in settings.values(): tempo_ratio(bpm,target)

    destination.mkdir(parents=True);working=destination/"working";working.mkdir();started=time.monotonic()
    source_hashes={};ratios={}
    for role,source in stems.items():
        side=role.split(":")[0];bpm,start,semitones=settings[side]
        with source.open("rb") as source_file: source_hashes[role]=hashlib.file_digest(source_file,"sha256").hexdigest()
        ratios[side]=prepare(source,working/(role.replace(":","_")+".wav"),source_bpm=bpm,target_bpm=target,start=start,duration=duration,semitones=semitones)

    alignment={side:start_alignment(values[1],values[0]) for side,values in settings.items()}
    outputs=[]
    for arrangement in ARRANGEMENTS:
        if arrangement=="vocal-a-over-b": roles=["left:stem_vocal",*[f"right:{kind}" for kind in KINDS[1:]]]
        elif arrangement=="vocal-b-over-a": roles=["right:stem_vocal",*[f"left:{kind}" for kind in KINDS[1:]]]
        else: roles=list(ROLES)
        args=["ffmpeg","-hide_banner","-loglevel","error","-nostdin","-y"];graph=[]
        for index,role in enumerate(roles):
            args+=["-i",str(working/(role.replace(":","_")+".wav"))];effect="anull"
            if arrangement=="drop-swap":
                if role.startswith("left:"): effect=f"afade=t=out:st={max(0,duration/2-TRANSITION_SECONDS)}:d={TRANSITION_SECONDS}"
                else: effect=f"afade=t=in:st={duration/2}:d={TRANSITION_SECONDS}"
            graph.append(f"[{index}:a]{effect}[s{index}]")
        graph.append("".join(f"[s{i}]" for i in range(len(roles)))+f"amix=inputs={len(roles)}:normalize=0,loudnorm=I=-14:TP=-1.2:LRA=11,atrim=duration={duration},afade=t=in:d=0.03,afade=t=out:st={max(0,duration-0.08)}:d=0.08[out]")
        output=destination/(arrangement+".wav")
        command(args+["-filter_complex",";".join(graph),"-map","[out]","-ar","44100","-ac","2","-c:a","pcm_s24le",str(output)])
        actual=probe(output);metrics=measure(output)
        technical_pass=abs(actual-duration)<=0.12 and -15<=metrics["integratedLufs"]<=-13 and metrics["truePeakDb"]<=-1.2
        outputs.append({"arrangement":arrangement,"path":str(output),"durationSeconds":actual,"qualityScore":0,
          "qualityStatus":"manual_review" if technical_pass else "failed",
          "metrics":{**metrics,"technicalPass":technical_pass,"musicalQuality":"not_evaluated","phraseAlignment":"unverified",
            "renderer":"green-ffmpeg-v2","inputHashes":source_hashes,"tempoRatios":{k:round(v,5) for k,v in ratios.items()},
            "startAlignment":alignment,"pitchSemitones":{"left":settings["left"][2],"right":settings["right"][2]},
            "transitionSeconds":TRANSITION_SECONDS,"processingSeconds":round(time.monotonic()-started,3)}})
    return outputs
