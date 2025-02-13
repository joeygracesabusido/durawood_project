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



api_customer_profile = APIRouter()
templates = Jinja2Templates(directory="apps/templates")

# @api_customer_profile.get("/customer_profile/", response_class=HTMLResponse)
# async def api_chart_of_account_template(request: Request,
#                                         username: str = Depends(get_current_user)):
 
#     return templates.TemplateResponse("accounting/company_profile.html", 
#                                       {"request": request})


@api_customer_profile.post("/api-insert-customer_profile/", response_model=None)
async def create_customer_profile(item: CustomerProfileBM, username: str = Depends(get_current_user)):
    try:
        CustomerProfileViews.insert_customer_profile(item, user=username)
        return {"message": "Company profile created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating profile: {e}")

@api_customer_profile.get("/api-get-customer-profiles/", response_model=List[CustomerProfileBM])
async def get_company_profiles(username: str = Depends(get_current_user)):
    try:
        profiles = CustomerProfileViews.customer_profile()
        return profiles
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")

@api_customer_profile.put("/api-update-customer-profile/", response_model=None)
async def update_customer_profile_api(profile_id: int, item: CustomerProfileBM,username: str = Depends(get_current_user)):
    item.id = profile_id
    updated_profile = CustomerProfileViews.update_customer_profile(item, user=username)
    if updated_profile:
        return {"message": "Company profile updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="Profile not found")

@api_customer_profile.get("/api-autocomplete-vendor-customer/")
async def autocomplete_contact(term: Optional[str] = None, username: str = Depends(get_current_user)):
    try:
        
        contact = CustomerProfileViews.customer_profile()
        
        # Filter chart of accounts based on the search term
        if term:
            filtered_contact = [
                item for item in contact
                if term.lower() in item.bussiness_name.lower() or term.lower() in item.name_of_tax_payer.lower()
            ]
        else:
            filtered_contact = contact  # If no term is provided, return all

        # Construct suggestions from filtered chart of account data
        suggestions = [
            {
                "value": f"{item.bussiness_name}",
                "id": item.id,
                
            }
            for item in filtered_contact
        
        ]

        return suggestions

    except Exception as e:
        error_message = str(e)
        raise HTTPException(status_code=500, detail=error_message)


