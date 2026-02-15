"""
Modal deployment for Demucs stem separation.

Setup:
  1. pip install modal
  2. modal token new
  3. PYTHONIOENCODING=utf-8 python -m modal deploy modal/demucs_app.py

After deploy, set MODAL_STEM_ENDPOINT in .env.local to the URL Modal prints.
"""

import modal
import tempfile
import urllib.request

app = modal.App("mashups-demucs")

demucs_image = (
    modal.Image.from_registry(
        "pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime",
        add_python="3.11",
    )
    .apt_install("ffmpeg")
    .pip_install("demucs", "numpy", "fastapi[standard]")
)


@app.function(
    image=demucs_image,
    gpu="T4",
    timeout=600,
    memory=8192,
)
@modal.fastapi_endpoint(method="POST")
def separate(data: dict):
    import subprocess
    import base64
    from pathlib import Path

    audio_url = data.get("audio_url")
    if not audio_url:
        return {"error": "audio_url is required"}

    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = Path(tmpdir) / "input_audio"
        urllib.request.urlretrieve(audio_url, str(input_path))

        output_dir = Path(tmpdir) / "output"
        output_dir.mkdir()

        # Run full 4-stem separation, output MP3 at 192kbps (much smaller than WAV)
        subprocess.run(
            [
                "python", "-m", "demucs",
                "-n", "htdemucs",
                "--mp3",
                "--mp3-bitrate", "192",
                "-o", str(output_dir),
                str(input_path),
            ],
            check=True,
        )

        # Find the output stems
        stem_dir = output_dir / "htdemucs" / "input_audio"
        if not stem_dir.exists():
            candidates = list((output_dir / "htdemucs").iterdir())
            if candidates:
                stem_dir = candidates[0]
            else:
                return {"error": "Demucs produced no output"}

        result = {}
        for stem_name in ["vocals", "drums", "bass", "other"]:
            # Check for mp3 first, then wav
            stem_file = stem_dir / f"{stem_name}.mp3"
            if not stem_file.exists():
                stem_file = stem_dir / f"{stem_name}.wav"
            if stem_file.exists():
                with open(stem_file, "rb") as f:
                    ext = stem_file.suffix.lstrip(".")
                    result[stem_name] = f"data:audio/{ext};base64," + base64.b64encode(f.read()).decode("utf-8")
            else:
                result[stem_name] = ""

        return result
