import json
from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Union, List, Optional


from datetime import datetime, timedelta, timezone

from apps.authentication.authenticate_user import get_current_user


from  ..database.mongodb import create_mongo_client
mydb = create_mongo_client()


from ..authentication.utils import OAuth2PasswordBearerWithCookie, get_password_hash, verify_password
#from apps.views.sign_up_views import UserViews


from jose import jwt

import os

JWT_SECRET = os.getenv("JWT_SECRET", "myjwtsecret")  # shortcut: set JWT_SECRET env in prod and rotate; changing it logs everyone out
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 300

login_router = APIRouter(include_in_schema=False)
templates = Jinja2Templates(directory="apps/templates")



from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

oauth_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="token")



def authenticate_user(username, password):
    user = mydb.login.find_one({
        '$and': [
            {"email_add": username},
            {"status": "Approved"}
        ]

    })

     
    if user:

        hashed_password = user['password']
        if verify_password(password, hashed_password):
            return {'username': user['email_add']}
            
            
    return False





def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + expires_delta

    to_encode.update({"exp": expire})

    
    return to_encode


@login_router.get("/", response_class=HTMLResponse)
async def api_login(request: Request):
    return templates.TemplateResponse(request, "login.html", {"request":request}) 

@login_router.get("/-temp-sign-up", response_class=HTMLResponse)
async def api_sign_up_temp(request: Request):
    return templates.TemplateResponse(request, "sign_up.html", {"request":request}) 




class LoginBM(BaseModel):
    username1: str
    password1: str


@login_router.post('/api-login/')
def login(data: LoginBM, response: Response):
    username1 = data.username1
    password1 = data.password1
    user = authenticate_user(username1, password1)

    if user:  # Successful login
        access_token = create_access_token(
            data={"sub": username1, "exp": datetime.now(timezone.utc) + timedelta(ACCESS_TOKEN_EXPIRE_MINUTES)}, 
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        user_details = mydb.login.find_one({"email_add": username1})

        user1 = {
            "full_name": user_details['fullname'],
            "username": user_details['email_add'],
            "role": user_details['role']
        }

        print(user1)
        jwt_token = jwt.encode({"sub": username1, "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)}, JWT_SECRET, algorithm=ALGORITHM)
        response.set_cookie(key="access_token", value=f'Bearer {jwt_token}', httponly=True)
        return {"message": "Login successful", "user": user1}

    elif user is None:  # User not found
        raise HTTPException(status_code=401, detail="Username is not registered")

    else:  # Incorrect password
        raise HTTPException(status_code=400, detail="Username and Password did not match")
  
@login_router.get("/temp-sign-up/", response_class=HTMLResponse)
async def api_sign_up(request: Request,):

    return templates.TemplateResponse(request, "sign_up.html", {"request": request})

  


@login_router.get("/dashboard/", response_class=HTMLResponse)
async def api_login(request: Request,):

    return templates.TemplateResponse(request, "accounting/new_dashboard.html", {"request": request})



    
