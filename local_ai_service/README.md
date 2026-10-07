# Local AI Service (Vosk + Flask)

Offline speech-to-text backend for the **Alt+Space** voice widget. Runs on
`http://127.0.0.1:5151` and never contacts the network.

## Setup

```bat
pip install -r requirements.txt
```

Download a Vosk model (e.g. `vosk-model-small-en-us-0.15`) from
<https://alphacephei.com/vosk/models>, extract it to
`local_ai_service/models/model/`, then:

```bat
python app.py
```

## Endpoints

| Method | Path          | Description                              |
| ------ | ------------- | ---------------------------------------- |
| GET    | `/health`     | Service + model status                   |
| POST   | `/transcribe` | Multipart `audio` (16 kHz mono WAV) → JSON `{ok, text}` |

## Wiring the widget

Point the dashboard at the service (default already `127.0.0.1:5151`) and POST
recorded WAV blobs from the renderer. Transcripts render inside the glass voice
widget. No cloud, no keys, no telemetry.
