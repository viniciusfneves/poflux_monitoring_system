from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi_utils.tasks import repeat_every
from app.connections.websocket.websocket_manager import manager
from app.schemas.ws_response_schema import MPUResponse, PIDResponse, WSResponse
from datetime import datetime
from random import randint

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


motor_simulation_pwm = 127


@app.on_event("startup")
@repeat_every(seconds=0.1)
async def websocket_updates():
    global motor_simulation_pwm
    motor_simulation_pwm += randint(-10, 10)
    while motor_simulation_pwm > 255:
        motor_simulation_pwm -= 1
    await manager.broadcast_json(
        WSResponse(
            esp_clock=datetime.now().timestamp(),
            mode="auto",
            manual_setpoint=90,
            sun_position=97,
            mpu=MPUResponse(lens_angle=92),
            motor=motor_simulation_pwm,
            pid_values=PIDResponse(
                kp=0,
                ki=0,
                kd=0,
                p=0,
                i=0,
                d=0,
                error=0,
                output=0,
            ),
            rtc_year=2023,
            rtc_month=1,
            rtc_day=1,
            rtc_hour=12,
            rtc_minute=0,
            rtc_second=0,
        ).dict()
    )
