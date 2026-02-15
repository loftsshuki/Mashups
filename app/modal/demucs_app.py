"""
Modal deployment for Demucs stem separation.

Setup:
  1. pip install modal
  2. modal token new          # authenticate with Modal
  3. modal deploy modal/demucs_app.py   # deploy the function

After deploy, set MODAL_STEM_ENDPOINT in .env.local to the URL Modal prints.
"""

import modal
import io
import json
import tempfile
import urllib.request

app = modal.App("mashups-demucs")

demucs_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install("demucs", "torch", "torchaudio", "numpy", "pydub")
)


@app.function(
    image=demucs_image,
    gpu="T4",
    timeout=600,
    memory=8192,
)
@modal.web_endpoint(method="POST")
def separate(data: dict):
    """Separate audio into stems using Demucs htdemucs model.

    Request body: { "audio_url": "https://..." }
    Returns: { "vocals": <base64>, "drums": <base64>, "bass": <base64>, "other": <base64> }
    """
    import subprocess
    import base64
    from pathlib import Path

    audio_url = data.get("audio_url")
    if not audio_url:
        return {"error": "audio_url is required"}, 400

    with tempfile.TemporaryDirectory() as tmpdir:
        # Download the audio file
        input_path = Path(tmpdir) / "input_audio"
        urllib.request.urlretrieve(audio_url, str(input_path))

        output_dir = Path(tmpdir) / "output"
        output_dir.mkdir()

        # Run demucs
        subprocess.run(
            [
                "python", "-m", "demucs",
                "--two-stems=vocals",  # only separate vocals vs. accompaniment first
                "-n", "htdemucs",
                "-o", str(output_dir),
                str(input_path),
            ],
            check=False,
        )

        # Also run the full 4-stem separation
        subprocess.run(
            [
                "python", "-m", "demucs",
                "-n", "htdemucs",
                "-o", str(output_dir),
                str(input_path),
            ],
            check=True,
        )

        # Find the output stems
        stem_dir = output_dir / "htdemucs" / "input_audio"
        if not stem_dir.exists():
            # Try without extension
            candidates = list((output_dir / "htdemucs").iterdir())
            if candidates:
                stem_dir = candidates[0]
            else:
                return {"error": "Demucs produced no output"}, 500

        result = {}
        for stem_name in ["vocals", "drums", "bass", "other"]:
            stem_file = stem_dir / f"{stem_name}.wav"
            if stem_file.exists():
                with open(stem_file, "rb") as f:
                    result[stem_name] = base64.b64encode(f.read()).decode("utf-8")
            else:
                result[stem_name] = ""

        return result
