from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional
from datetime import datetime, date , timedelta
from fastapi.responses import JSONResponse

from pydantic import BaseModel



#from bson import ObjectId

from ...authentication.authenticate_user import get_current_user



api_trial_balance_temp= APIRouter(include_in_schema=False)
templates = Jinja2Templates(directory="apps/templates")


@api_trial_balance_temp.get("/api-trial-balance-temp/", response_class=HTMLResponse)
async def get_trial_balance_temp(request: Request):
    return templates.TemplateResponse("accounting/trial_balance.html", {"request": request,})
