import json
from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional


from datetime import datetime, timedelta

from apps.authentication.authenticate_user import get_current_user


#from  ..database.mongodb import create_mongo_client
#mydb = create_mongo_client()


from ..authentication.utils import OAuth2PasswordBearerWithCookie
from apps.views.sign_up_views import UserViews


from jose import jwt

JWT_SECRET = 'myjwtsecret'
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

login_router = APIRouter(include_in_schema=False)
templates = Jinja2Templates(directory="apps/templates")



from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

oauth_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="token")



from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

import bcrypt




def get_password_hash(password):
    return pwd_context.hash(password)


# def authenticate_user(username, password):
   
#     user = UserViews.get_user_for_login(username=username)
    
#     # print(user)
#     username = user.username
#     hashed_password = user.hashed_password
   
#     # hashed_password = pwd_context.verify(password,user.hashed_password)

    

#     if user:
#         password_check = pwd_context.verify(password,hashed_password)
#         return password_check

#     elif user == None:
#         return False
#     else :
#         # False
#         print("error")


#     #  print(hashed_password)
#     # if user:
#     #     if hashed_password:
#     #         return True
#     #     else:
#     #         return False

#     # else :
        
#     #     return None


def authenticate_user(username, password):
    user = UserViews.get_user_for_login(username=username)

    if not user:  # User not found
        return None

    hashed_password = user.hashed_password
    password_check = pwd_context.verify(password, hashed_password)
    return password_check if password_check else False




def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()

    expire = datetime.utcnow() + expires_delta

    to_encode.update({"exp": expire})

    
    return to_encode


@login_router.get("/", response_class=HTMLResponse)
async def api_login(request: Request):
    return templates.TemplateResponse("login.html", {"request":request}) 

@login_router.get("/-temp-sign-up", response_class=HTMLResponse)
async def api_login(request: Request):
    return templates.TemplateResponse("sign_up.html", {"request":request}) 



# @login_router.get('/api-login/')
# def login(username1: Optional[str],password1:Optional[str],response:Response):
#     username = username1
#     password = password1


#     user = authenticate_user(username,password)

#     # print(user)

#     if user :
#         access_token = create_access_token(
#                 data = {"sub": username,"exp":datetime.utcnow() + timedelta(ACCESS_TOKEN_EXPIRE_MINUTES)}, 
#                 expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#                                     )

#         data = {"sub": username,"exp":datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)}
#         jwt_token = jwt.encode(data,JWT_SECRET,algorithm=ALGORITHM)
#         response.set_cookie(key="access_token", value=f'Bearer {jwt_token}',httponly=True)
#         # return response
        
#     elif user == False:
#         raise HTTPException(
#             status_code=400,
#             detail= "Username and Password Did not Match",
#             # headers={"WWW-Authenticate": "Basic"},
#         )

    
    
#     elif user is None:
#         raise HTTPException(
#             status_code=401,
#             detail="Username is not registered",
#         )

@login_router.get('/api-login/')
def login(username1: Optional[str], password1: Optional[str], response: Response):
    user = authenticate_user(username1, password1)

    if user:  # Successful login
        access_token = create_access_token(
            data={"sub": username1, "exp": datetime.utcnow() + timedelta(ACCESS_TOKEN_EXPIRE_MINUTES)}, 
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        user_details = UserViews.get_user_details(username1)
        jwt_token = jwt.encode({"sub": username1, "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)}, JWT_SECRET, algorithm=ALGORITHM)
        response.set_cookie(key="access_token", value=f'Bearer {jwt_token}', httponly=True)
        return {"message": "Login successful", "user":user_details}

    elif user is None:  # User not found
        raise HTTPException(status_code=401, detail="Username is not registered")

    else:  # Incorrect password
        raise HTTPException(status_code=400, detail="Username and Password did not match")
  
   


@login_router.get("/dashboard/", response_class=HTMLResponse)
async def api_login(request: Request,):

    return templates.TemplateResponse("accounting/new_dashboard.html", {"request": request})



    
