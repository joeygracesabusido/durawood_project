from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional, Dict
from pydantic import BaseModel
#from bson import ObjectId





from datetime import datetime, timedelta, date
from apps.authentication.authenticate_user import get_current_user
from apps.base_model.customer_profile_bm import CustomerProfileBM
from apps.views.accounting.customer_profile_views import CustomerProfileViews



api_customer_profile_temp = APIRouter()
templates = Jinja2Templates(directory="apps/templates")

@api_customer_profile_temp.get("/customer_profile/", response_class=HTMLResponse)
async def api_chart_of_account_template(request: Request,
                                        username: str = Depends(get_current_user)):
 
    return templates.TemplateResponse("accounting/customer_profile.html", 
                                      {"request": request})

