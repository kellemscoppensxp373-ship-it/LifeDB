"""
LIFE DASHBOARD — local AI voice service (Flask + Vosk).

Fully offline speech-to-text for the Alt+Space voice widget.
Nothing leaves the machine.

Setup:
    pip install -r requirements.txt
    # download a Vosk model, e.g. vosk-model-small-en-us-0.15, into ./models/
    # and point VOSK_MODEL_PATH at it (or pass --model).

Run:
    python app.py                 # serves http://127.0.0.1:5151
"""
import json
import os
import wave
from io import BytesIO

from flask import Flask, jsonify, request

MODEL_PATH = os.environ.get("VOSK_MODEL_PATH", os.path.join(os.path.dirname(__file__), "models", "model"))
PORT = int(os.environ.get("AI_SERVICE_PORT", "5151"))

app = Flask(__name__)
_model = None


def get_model():
    """Lazy-load the Vosk model so /health works without one installed."""
    global _model
    if _model is None:
        from vosk import Model

        if not os.path.isdir(MODEL_PATH):
            raise RuntimeError(
                f"Vosk model not found at {MODEL_PATH}. "
                "Download one from https://alphacephei.com/vosk/models and extract it there."
            )
        _model = Model(MODEL_PATH)
    return _model


@app.after_request
def _cors(resp):
    # Local-only service: allow the dashboard origin(s).
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return resp


@app.get("/health")
def health():
    return jsonify(
        {
            "ok": True,
            "service": "lifedb-local-ai",
            "model_ready": os.path.isdir(MODEL_PATH),
            "model_path": MODEL_PATH,
        }
    )


@app.post("/transcribe")
def transcribe():
    """
    Accepts multipart `audio` (16kHz mono WAV) and returns {"text": ...}.
    """
    if "audio" not in request.files:
        return jsonify({"ok": False, "error": "missing multipart field 'audio'"}), 400
    try:
        model = get_model()
    except Exception as exc:  # noqa: BLE001 - surfaced to the caller
        return jsonify({"ok": False, "error": str(exc)}), 503

    from vosk import KaldiRecognizer

    raw = request.files["audio"].read()
    try:
        wf = wave.open(BytesIO(raw), "rb")
    except wave.Error:
        return jsonify({"ok": False, "error": "audio must be a valid WAV file"}), 400

    rec = KaldiRecognizer(model, wf.getframerate())
    rec.SetWords(False)
    while True:
        chunk = wf.readframes(4000)
        if not chunk:
            break
        rec.AcceptWaveform(chunk)
    try:
        text = json.loads(rec.FinalResult()).get("text", "")
    finally:
        wf.close()
    return jsonify({"ok": True, "text": text})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=PORT, debug=False)
