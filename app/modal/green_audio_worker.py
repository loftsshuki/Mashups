"""Deployable Green Room separation/render bridge; deployment is opt-in.

From app/: modal deploy modal/green_audio_worker.py
Secrets: mashups-green-audio (processor secret, private Blob token, app origin).
"""
from __future__ import annotations
import hashlib
import hmac
import json
import os
import subprocess
import tempfile
import time
import uuid
from pathlib import Path
from urllib.parse import urlsplit
import modal
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

app = modal.App("mashups-green-audio")
HERE = Path(__file__).parent
image = (modal.Image.from_registry("node:22-bookworm-slim", add_python="3.11")
         .apt_install("ffmpeg", "libsndfile1")
         .pip_install("fastapi[standard]", "requests==2.32.4", "numpy==1.26.4", "torch==2.5.1", "torchaudio==2.5.1", "demucs==4.0.1")
         .run_commands("mkdir -p /opt/worker && npm install --prefix /opt/worker @vercel/blob@2.7.0")
         .add_local_file(HERE / "green_render.py", "/opt/worker/green_render.py")
         .add_local_file(HERE / "green_upload.mjs", "/opt/worker/green_upload.mjs"))
secrets = [modal.Secret.from_name("mashups-green-audio")]


def checked_url(value: str, path: str) -> str:
    origin = os.environ.get("GREEN_ROOM_APP_ORIGIN", "").rstrip("/")
    parsed, base = urlsplit(value), urlsplit(origin)
    if not origin or base.scheme != "https" or parsed.scheme != "https" or parsed.netloc != base.netloc or parsed.username or parsed.password or parsed.path != path or parsed.fragment:
        raise ValueError("Worker URL is outside the configured Mashups application")
    return value


def download(url: str, job_id: str, output: Path) -> None:
    import requests
    checked_url(url, f"/api/green/assets/{job_id}")
    total = 0
    with requests.get(url, stream=True, allow_redirects=False, timeout=(10, 180)) as response:
        if response.status_code != 200:
            raise ValueError("Authorized source fetch failed")
        with output.open("wb") as stream:
            for chunk in response.iter_content(1024 * 1024):
                total += len(chunk)
                if total > 250 * 1024 * 1024:
                    raise ValueError("Source exceeds pilot byte limit")
                stream.write(chunk)


def upload(path: Path, job_id: str, name: str) -> dict:
    pathname = f"green-room/jobs/{job_id}/{uuid.uuid4()}/{name}.wav"
    result = subprocess.run(["node", "/opt/worker/green_upload.mjs", str(path), pathname], capture_output=True, text=True, timeout=300)
    if result.returncode:
        raise RuntimeError("Private worker upload failed")
    return json.loads(result.stdout)


def callback(url: str, payload: dict) -> None:
    import requests
    checked_url(url, "/api/green/processing/callback")
    secret = os.environ["GREEN_ROOM_PROCESSOR_SECRET"]
    body = json.dumps(payload, separators=(",", ":"), allow_nan=False)
    for attempt in range(4):
        timestamp = str(int(time.time() * 1000))
        signature = hmac.new(secret.encode(), f"{timestamp}.{body}".encode(), hashlib.sha256).hexdigest()
        try:
            response = requests.post(url, data=body, allow_redirects=False, timeout=(10, 60), headers={"Authorization": f"Bearer {secret}", "Content-Type": "application/json", "X-Green-Timestamp": timestamp, "X-Green-Signature": signature})
            if response.ok and response.json().get("ok") is True:
                return
            if 400 <= response.status_code < 500 and response.status_code not in (409, 429):
                break
        except (requests.RequestException, ValueError):
            pass
        time.sleep(2 ** attempt)
    # Do not send a contradictory failure after an unconfirmed success receipt.
    raise RuntimeError("Processor callback could not be confirmed; inspect the durable job")


def work(payload: dict, separate: bool) -> None:
    import sys
    sys.path.insert(0, "/opt/worker")
    from green_render import render_candidates, probe, ROLES
    job_id = payload["jobId"]
    try:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            if separate:
                source = root / "source.wav"
                download(payload["assetUrl"], job_id, source)
                if probe(source) < 8:
                    raise ValueError("Source is too short")
                result = subprocess.run(["python", "-m", "demucs", "-n", "htdemucs", "-d", "cuda", "--out", str(root / "stems"), str(source)], capture_output=True, timeout=1200)
                if result.returncode:
                    raise RuntimeError("Demucs separation failed")
                folder = root / "stems" / "htdemucs" / "source"
                assets = [{"kind": kind, **upload(folder / f"{file}.wav", job_id, kind)} for kind, file in [("stem_vocal", "vocals"), ("stem_drums", "drums"), ("stem_bass", "bass"), ("stem_other", "other")]]
                result_payload = {"jobId": job_id, "status": "succeeded", "separation": {"assets": assets, "separationSdrDb": None, "vocalBleedDb": None}}
            else:
                entries = payload.get("inputAssets", [])
                if len(entries) != 8 or {entry.get("role") for entry in entries} != set(ROLES):
                    raise ValueError("Eight signed canonical stem inputs are required")
                stems = {}
                for index, entry in enumerate(entries):
                    path = root / f"stem-{index}.wav"
                    download(entry["url"], job_id, path)
                    stems[entry["role"]] = path
                rendered = render_candidates(stems, payload.get("input", {}).get("recipe", {}), root / "output")
                candidates = []
                for row in rendered:
                    path = Path(row.pop("path"))
                    candidates.append({**row, "asset": upload(path, job_id, row["arrangement"])})
                result_payload = {"jobId": job_id, "status": "succeeded", "candidates": candidates}
    except Exception:
        # Detailed provider exceptions can contain URLs. Keep callbacks non-sensitive.
        result_payload = {"jobId": job_id, "status": "failed", "errorCode": "AUDIO_WORKER_FAILED", "errorMessage": "Worker could not finish; inspect private worker logs and input/configuration checks."}
    callback(payload["callbackUrl"], result_payload)


@app.function(image=image, secrets=secrets, timeout=1800, memory=8192, gpu="L4")
def separate_job(payload: dict):
    work(payload, True)


@app.function(image=image, secrets=secrets, timeout=1200, memory=4096, cpu=2)
def render_job(payload: dict):
    work(payload, False)


@app.function(image=image, secrets=secrets, timeout=60)
@modal.fastapi_endpoint(method="POST")
async def process(request: Request):
    secret = os.environ.get("GREEN_ROOM_PROCESSOR_SECRET", "")
    if not secret or not hmac.compare_digest(request.headers.get("authorization", ""), f"Bearer {secret}"):
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        payload = await request.json()
        if not isinstance(payload, dict):
            raise ValueError("Object envelope required")
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid job envelope")
    try:
        uuid.UUID(payload["jobId"])
        checked_url(payload["callbackUrl"], "/api/green/processing/callback")
    except (KeyError, ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid job envelope")
    if payload.get("jobType") == "separate":
        await separate_job.spawn.aio(payload)
    elif payload.get("jobType") == "render_candidates":
        await render_job.spawn.aio(payload)
    else:
        raise HTTPException(status_code=503, detail="This bridge implements separation and rendering, not fingerprint clearance")
    return JSONResponse({"accepted": True, "jobId": payload["jobId"]}, status_code=202)
