from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional
from pydantic import BaseModel
#from bson import ObjectId


#from pymongo import  DESCENDING


from datetime import datetime, timedelta, date
from apps.authentication.authenticate_user import get_current_user
from apps.base_model.type_of_account_bm import AccountTypeBM
from apps.views.accounting.account_type_views import TypeofAccountViews



api_account_type = APIRouter()
templates = Jinja2Templates(directory="apps/templates")


@api_account_type.post('/api-insert-account-type/')
async def insert_account_type(items:AccountTypeBM, username: str = Depends(get_current_user)):

    
    try:
        TypeofAccountViews.insert_type_of_account(items)
        return {"message": "Account type added successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@api_account_type.get("/api-autocomplete-account-type/")
async def autocomplete_account_type(term: Optional[str] = None, username: str = Depends(get_current_user)):
    try:
        # Retrieve all chart of account data from the database
        account_type = TypeofAccountViews.get_account_type()
        
        print(account_type)
        # Filter account type based on the search term
        if term:
            filtered_coa = [
                item for item in account_type
                if term.lower() in item.account_type.lower()
            ]
        else:
            filtered_coa = account_type  # If no term is provided, return all

        # Construct suggestions from filtered chart of account data
        suggestions = [
            {
                "value": f"{item.account_type}",
                "id": item.id,
                
            }
            for item in filtered_coa
        ]

        return suggestions

    except Exception as e:
        error_message = str(e)
        raise HTTPException(status_code=500, detail=error_message)
    
@api_account_type.get("/api-account-type-list/")
async def get_account_type(username: str = Depends(get_current_user)):
    try:
        # Retrieve all chart of account data from the database
        account_type = TypeofAccountViews.get_account_type()
        
      
        # Construct suggestions from filtered chart of account data
        suggestions = [
            {
                "account_type": item.account_type,
                "id": item.id,
                
            }
            for item in account_type
        ]

        return suggestions

    except Exception as e:
        error_message = str(e)
        raise HTTPException(status_code=500, detail=error_message)

@api_account_type.put('/api-update-account-type/{id}', response_model=None)
async def update_chart_of_account(
    id: int,
    item: AccountTypeBM,
    username: str = Depends(get_current_user)
):
    """
    API endpoint to update Account type details.
    """
    try:
        # Call the static method to update the record
        updated = TypeofAccountViews.update_account_type(
            id=id,
            account_type=item.account_type,
            user=username
        )
        
        if updated:
            return {"message": "Account Type updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Chart of Account not found")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
    



  




