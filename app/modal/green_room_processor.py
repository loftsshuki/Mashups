"""Authenticated Green Room technical-analysis worker.

Deploy with:
  modal deploy modal/green_room_processor.py

The endpoint receives expiring asset and callback URLs from Mashups. It never
stores source audio after the job and never claims to perform rights clearance.
"""

import hashlib
import hmac
import json
import os
import subprocess
import tempfile
import time
from pathlib import Path

import modal
from fastapi import Request


app = modal.App("mashups-green-room-processor")

processor_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg", "libsndfile1")
    .pip_install(
        "fastapi[standard]",
        "librosa==0.11.0",
        "numpy==2.2.6",
        "pyloudnorm==0.1.1",
        "requests==2.32.4",
        "soundfile==0.13.1",
    )
)


@app.function(
    image=processor_image,
    secrets=[modal.Secret.from_name("mashups-green-room")],
    timeout=600,
    memory=4096,
)
@modal.fastapi_endpoint(method="POST")
async def process(request: Request):
    from fastapi import HTTPException

    secret = os.environ.get("GREEN_ROOM_PROCESSOR_SECRET")
    authorization = request.headers.get("authorization")
    if not secret or authorization != f"Bearer {secret}":
        raise HTTPException(status_code=401, detail="Unauthorized")

    payload = await request.json()
    job_id = payload.get("jobId")
    job_type = payload.get("jobType")
    asset_url = payload.get("assetUrl")
    callback_url = payload.get("callbackUrl")
    if not all([job_id, job_type, asset_url, callback_url]):
        raise HTTPException(status_code=400, detail="Incomplete job envelope")

    if job_type != "analyze":
        _callback(
            callback_url,
            secret,
            {
                "jobId": job_id,
                "status": "failed",
                "errorCode": "SPECIALIST_PROVIDER_REQUIRED",
                "errorMessage": f"{job_type} requires a configured fingerprint, separation, or render provider.",
            },
        )
        return {"accepted": True, "jobId": job_id, "result": "specialist_provider_required"}

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            source_path = Path(tmpdir) / "source-audio"
            _download(asset_url, source_path)
            analysis = _analyze(source_path)
        _callback(callback_url, secret, {"jobId": job_id, "status": "succeeded", "analysis": analysis})
        return {"accepted": True, "jobId": job_id, "result": "analyzed"}
    except Exception as error:
        _callback(
            callback_url,
            secret,
            {
                "jobId": job_id,
                "status": "failed",
                "errorCode": "ANALYSIS_FAILED",
                "errorMessage": str(error)[:500],
            },
        )
        return {"accepted": True, "jobId": job_id, "result": "failed"}


def _download(url: str, destination: Path) -> None:
    import requests

    max_bytes = 250 * 1024 * 1024
    with requests.get(url, stream=True, timeout=(10, 180)) as response:
        response.raise_for_status()
        content_type = response.headers.get("content-type", "").split(";", 1)[0].lower()
        if content_type and not (content_type.startswith("audio/") or content_type == "application/octet-stream"):
            raise ValueError("Private asset did not return an audio content type")
        content_length = int(response.headers.get("content-length", "0") or 0)
        if content_length > max_bytes:
            raise ValueError("Source exceeds the 250 MB pilot limit")
        downloaded = 0
        with destination.open("wb") as output:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    downloaded += len(chunk)
                    if downloaded > max_bytes:
                        raise ValueError("Source exceeds the 250 MB pilot limit")
                    output.write(chunk)
    _probe_audio(destination)


def _callback(url: str, secret: str, payload: dict) -> None:
    import requests

    body = json.dumps(payload, separators=(",", ":"))
    timestamp = str(int(time.time() * 1000))
    signature = hmac.new(secret.encode(), f"{timestamp}.{body}".encode(), hashlib.sha256).hexdigest()
    response = requests.post(
        url,
        data=body,
        headers={"Authorization": f"Bearer {secret}", "Content-Type": "application/json", "X-Green-Timestamp": timestamp, "X-Green-Signature": signature},
        timeout=(10, 60),
    )
    response.raise_for_status()


def _probe_audio(source_path: Path) -> None:
    completed = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=codec_type,sample_rate:format=duration", "-of", "json", str(source_path)],
        capture_output=True,
        check=True,
        text=True,
        timeout=30,
    )
    probe = json.loads(completed.stdout)
    streams = probe.get("streams") or []
    if not streams or streams[0].get("codec_type") != "audio":
        raise ValueError("Source does not contain a decodable audio stream")
    duration = float((probe.get("format") or {}).get("duration") or 0)
    if duration < 8:
        raise ValueError("Source must contain at least eight seconds of audio")
    if duration > 1_200:
        raise ValueError("Source exceeds the 20 minute pilot duration limit")


def _analyze(source_path: Path) -> dict:
    import librosa
    import numpy as np
    import pyloudnorm as pyln
    import soundfile as sf

    audio, sample_rate = librosa.load(str(source_path), sr=44100, mono=True, duration=420)
    if audio.size < sample_rate * 8:
        raise ValueError("Source must contain at least eight seconds of audio")

    tempo, beat_frames = librosa.beat.beat_track(y=audio, sr=sample_rate, units="frames")
    tempo_value = float(np.asarray(tempo).reshape(-1)[0])
    beat_times = librosa.frames_to_time(beat_frames, sr=sample_rate)
    intervals = np.diff(beat_times)
    phrase_confidence = 0.0 if intervals.size < 8 else float(np.clip(1.0 - np.std(intervals) / max(np.mean(intervals), 1e-6), 0.0, 1.0))

    chroma = librosa.feature.chroma_cqt(y=audio, sr=sample_rate)
    musical_key, camelot_key = _estimate_key(np.mean(chroma, axis=1))

    meter = pyln.Meter(sample_rate)
    integrated_lufs = float(meter.integrated_loudness(audio))
    true_peak_db = float(20 * np.log10(max(float(np.max(np.abs(audio))), 1e-9)))

    return {
        "bpm": round(tempo_value, 2),
        "musicalKey": musical_key,
        "camelotKey": camelot_key,
        "integratedLufs": round(integrated_lufs, 2),
        "truePeakDb": round(true_peak_db, 2),
        "vocalBleedDb": None,
        "separationSdrDb": None,
        "phraseConfidence": round(phrase_confidence, 4),
        "sampleScanStatus": "unavailable",
    }


def _estimate_key(chroma):
    import numpy as np

    major = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
    minor = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
    pitch_names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    camelot_major = ["8B", "3B", "10B", "5B", "12B", "7B", "2B", "9B", "4B", "11B", "6B", "1B"]
    camelot_minor = ["5A", "12A", "7A", "2A", "9A", "4A", "11A", "6A", "1A", "8A", "3A", "10A"]

    normalized = (chroma - np.mean(chroma)) / max(np.std(chroma), 1e-9)
    scores = []
    for root in range(12):
        scores.append((float(np.dot(normalized, np.roll(major, root))), root, "major"))
        scores.append((float(np.dot(normalized, np.roll(minor, root))), root, "minor"))
    _, root, mode = max(scores, key=lambda item: item[0])
    camelot = camelot_major[root] if mode == "major" else camelot_minor[root]
    return f"{pitch_names[root]} {mode}", camelot
