from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional, Dict
from pydantic import BaseModel
#from bson import ObjectId





from datetime import datetime, timedelta, date
from apps.authentication.authenticate_user import get_current_user
from apps.base_model.company_profile_bm import CompanyProfileBM
from apps.views.accounting.company_profile_views import CompanyProfileViews



api_company_profile = APIRouter()
templates = Jinja2Templates(directory="apps/templates")


@api_company_profile.post("/api-insert-company_profile/", response_model=None)
async def create_company_profile(item: CompanyProfileBM, username: str = Depends(get_current_user)):
    try:
        CompanyProfileViews.insert_company_profile(item, user=username)
        return {"message": "Company profile created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating profile: {e}")

@api_company_profile.get("/api-get-company_profiles/", response_model=List[CompanyProfileBM])
async def get_company_profiles(username: str = Depends(get_current_user)):
    try:
        profiles = CompanyProfileViews.company_profile()
        return profiles
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")

@api_company_profile.put("/api-update-company_profile/", response_model=None)
async def update_company_profile(profile_id: int, item: CompanyProfileBM,username: str = Depends(get_current_user)):
    item.id = profile_id
    updated_profile = CompanyProfileViews.update_company_profile(item, user=username)
    if updated_profile:
        return {"message": "Company profile updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="Profile not found")
