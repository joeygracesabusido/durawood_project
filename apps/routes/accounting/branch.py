from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional, Dict
from pydantic import BaseModel
#from bson import ObjectId





from datetime import datetime, timedelta, date
from apps.authentication.authenticate_user import get_current_user
from apps.base_model.branch_bm import BranchBM
from apps.views.accounting.branch_views import BranchViews



api_branch = APIRouter()
templates = Jinja2Templates(directory="apps/templates")


@api_branch.post("/api-insert-branches/", response_model=None)
async def create_branch(item: BranchBM, username: str = Depends(get_current_user)):
    try:
        BranchViews.insert_branch(item, user=username)
        return {"message": "Branch created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating branch: {e}")

@api_branch.get("/api-get-branches-list/", response_model=List[BranchBM])
async def get_api_branches(username: str = Depends(get_current_user)):
    try:
        branches = BranchViews.get_branch()
        return branches
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving branches: {e}")

@api_branch.put("/api-update-branch/{branch_id}", response_model=None)
async def update_branch(branch_id: int, item: BranchBM, username: str = Depends(get_current_user)):
    item.id = branch_id
    updated_branch = BranchViews.update_branch(item,user=username)
    if updated_branch:
        return {"message": "Branch updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="Branch not found")
@api_branch.get("/api-autocomplete-branch/")
async def autocomplete_branch(term: Optional[str] = None, username: str = Depends(get_current_user)):
    try:
        
        branch = BranchViews.get_branch()
        
        # Filter chart of accounts based on the search term
        if term:
            filtered_branch = [
                item for item in branch
                if term.lower() in item.branch_name.lower()
            ]
        else:
            filtered_branch = branch  # If no term is provided, return all

        # Construct suggestions from filtered chart of account data
        suggestions = [
            {
                "value": f"{item.branch_name}",
                "id": item.id,
                
            }
            for item in filtered_branch
        ]

        return suggestions

    except Exception as e:
        error_message = str(e)
        raise HTTPException(status_code=500, detail=error_message)


