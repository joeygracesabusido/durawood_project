from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional, Dict
from pydantic import BaseModel
from bson import ObjectId




from datetime import datetime, timedelta, date, timezone
from apps.authentication.authenticate_user import get_current_user


from  apps.database.mongodb import create_mongo_client
mydb = create_mongo_client()


api_cash = APIRouter()
templates = Jinja2Templates(directory="apps/templates")



@api_cash.get("/cash-transaction/", response_class=HTMLResponse)
async def api_chart_of_account_template(request: Request,
                                        username: str = Depends(get_current_user)):
    role = mydb.login.find_one({"email_add":username})

    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    print(roleAuthenticate['allowed_access'])
    

    if 'Sales' in roleAuthenticate['allowed_access']:


        return templates.TemplateResponse("accounting/cash_transaction.html", 
                                      {"request": request})

    else:
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail= "Not Authorized ",
            # headers={"WWW-Authenticate": "Basic"},
        )



