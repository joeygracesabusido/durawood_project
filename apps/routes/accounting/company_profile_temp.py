from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional
from datetime import datetime, date , timedelta
from fastapi.responses import JSONResponse

from pydantic import BaseModel



#from bson import ObjectId

from ...authentication.authenticate_user import get_current_user
from apps.views.accounting.company_profile_views import CompanyProfileViews

api_company_profile_temp= APIRouter(include_in_schema=False)
templates = Jinja2Templates(directory="apps/templates")


# @api_company_profile_temp.get("/api-company-profile/", response_class=HTMLResponse)
# async def api_ticketing(request: Request):
#     return templates.TemplateResponse("accounting/company_profile.html", {"request": request})

@api_company_profile_temp.get("/company_profile/", response_class=HTMLResponse)
async def api_chart_of_account_template(request: Request,
                                        username: str = Depends(get_current_user)):
    
    profiles = CompanyProfileViews.company_profile()
    
    
    return templates.TemplateResponse("accounting/company_profile.html", 
                                      {"request": request,"profiles": profiles})

