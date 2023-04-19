from pydantic import BaseModel


class MPUResponse(BaseModel):
    lens_angle: float


class PIDResponse(BaseModel):
    kp: float
    ki: float
    kd: float
    p: float
    i: float
    d: float
    error: float
    output: float


class WSResponse(BaseModel):
    mode: str
    esp_clock: int
    rtc_day: int
    rtc_month: int
    rtc_year: int
    rtc_hour: int
    rtc_minute: int
    rtc_second: int

    motor: int

    sun_position: float
    manual_setpoint: float

    mpu: MPUResponse
    pid_values: PIDResponse
