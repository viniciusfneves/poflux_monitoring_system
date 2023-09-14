import requests
import uvicorn
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from connections.websocket.websocket_manager import manager

app = FastAPI()


app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.websocket("/live")
async def websocket(client: WebSocket):
    await manager.connect(client)
    try:
        while True:
            data = await client.receive_text()
            print(data)

    except WebSocketDisconnect:
        manager.disconnect(client)


if __name__ == "__main__":
    uvicorn.run("main:app", port=8080, reload=True)
