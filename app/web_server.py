from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import Any, Dict

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, Response
from fastapi.staticfiles import StaticFiles

from app.agent.manus import Manus
from app.logger import logger


PROJECT_ROOT = Path(__file__).resolve().parents[1]
WEB_DIR = PROJECT_ROOT / "web"

app = FastAPI(title="OpenManus Web UI (PWA)")

# Allow same-origin and localhost origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static assets
if WEB_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(WEB_DIR), html=False), name="static")


@app.get("/", response_class=HTMLResponse)
async def index() -> Any:
    index_file = WEB_DIR / "index.html"
    if not index_file.exists():
        return HTMLResponse("<h1>OpenManus Web UI</h1><p>Front-end not found.</p>", status_code=200)
    return FileResponse(str(index_file))


@app.get("/manifest.webmanifest")
async def manifest() -> Any:
    manifest_file = WEB_DIR / "manifest.webmanifest"
    media_type = "application/manifest+json"
    if not manifest_file.exists():
        # Minimal inline manifest as a fallback
        fallback = {
            "name": "OpenManus",
            "short_name": "Manus",
            "start_url": "/",
            "display": "standalone",
            "background_color": "#0b0f14",
            "theme_color": "#0b0f14",
            "icons": [
                {
                    "src": "/static/icons/icon.svg",
                    "sizes": "any",
                    "type": "image/svg+xml",
                    "purpose": "any maskable",
                }
            ],
        }
        return Response(content=json.dumps(fallback), media_type=media_type)
    return FileResponse(str(manifest_file), media_type=media_type)


@app.get("/sw.js")
async def service_worker() -> Any:
    sw_file = WEB_DIR / "sw.js"
    if not sw_file.exists():
        return Response("self.addEventListener('install',()=>self.skipWaiting());", media_type="text/javascript")
    return FileResponse(str(sw_file), media_type="text/javascript")


@app.websocket("/ws")
async def ws_run(ws: WebSocket) -> Any:
    await ws.accept()
    agent: Manus | None = None
    try:
        # Receive a JSON message: {"prompt": "..."}
        raw = await ws.receive_text()
        data: Dict[str, Any] = json.loads(raw)
        prompt = data.get("prompt", "").strip()
        if not prompt:
            await ws.send_json({"type": "error", "message": "Prompt is empty"})
            await ws.close()
            return

        await ws.send_json({"type": "status", "message": "initializing"})
        agent = await Manus.create()

        await ws.send_json({"type": "status", "message": "running"})
        # Run the agent and return final result
        result = await agent.run(prompt)
        await ws.send_json({"type": "result", "data": result})
        await ws.close()
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected by client")
    except Exception as e:  # noqa: BLE001
        logger.error(f"WebSocket error: {e}")
        try:
            await ws.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
    finally:
        if agent is not None:
            try:
                await agent.cleanup()
            except Exception:
                pass