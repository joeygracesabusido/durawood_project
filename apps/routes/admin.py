from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional
from pydantic import BaseModel
from bson import ObjectId
from bson.errors import InvalidId

from datetime import datetime, timedelta, timezone


from  ..database.mongodb import create_mongo_client
mydb = create_mongo_client()


from ..authentication.utils import OAuth2PasswordBearerWithCookie, get_password_hash, verify_password

from jose import jwt

import os
JWT_SECRET = os.getenv("JWT_SECRET", "myjwtsecret")  # shortcut: set JWT_SECRET env in prod and rotate; changing it logs everyone out
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

api = APIRouter()
templates = Jinja2Templates(directory="apps/templates")



from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

oauth_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="token")

# oauth_scheme = OAuth2PasswordBearer(tokenUrl="token")



from  ..authentication.authenticate_user import get_current_user

#from apps.views.sign_up_views import UserViews
#from apps.base_model.user_bm import UserBM, UpdateUserBM



class SignUpModel(BaseModel):
    fullname: str
    email_add: str
    password: str
    created: datetime = datetime.now(timezone.utc)
    status: Optional[str] = None
    role: str



class UpdateUser(BaseModel):
    status: str
    role: Optional[str] = None



password1 = ""
def authenticate_user(username, password):
    
    user = mydb.login.find({
                            '$and':
                            [{"email_add":username}
                            ]})
    
    
    for i in user:
       
        username = i['email_add']
        password1 = i['password']
        
   
        if user:
            
            password_check = verify_password(password,password1)
            
            return password_check

            
        else :
            False






def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + expires_delta

    to_encode.update({"exp": expire})

    
    return to_encode


@api.post('/token')
def login(response:Response,form_data: OAuth2PasswordRequestForm = Depends()):
    username = form_data.username
    password = form_data.password


    user = authenticate_user(username,password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": username},
        expires_delta=access_token_expires,
    )

    data = {"sub": username, "exp": datetime.now(timezone.utc) + access_token_expires}
    jwt_token = jwt.encode(data,JWT_SECRET,algorithm=ALGORITHM)
    response.set_cookie(key="access_token", value=f'Bearer {jwt_token}',httponly=True)
    
    return {"access_token": jwt_token, "token_type": "bearer"}
    # return {"access_token": access_token, "token_type": "bearer"}
    # return(access_token)





@api.post('/api-sign-up')
def sign_up(data: SignUpModel):
    """This function is for inserting """
    #,token: str = Depends(oauth_scheme)

    dataInsert = {
        "fullname": data.fullname,
        "email_add": data.email_add,
        "password": get_password_hash(data.password),
        "status": "Pending",  # client cannot self-approve; an admin sets Approved later
        "role": data.role,
        "created": data.created
    }
    mydb.login.insert_one(dataInsert)
    return {"message": "User has been saved"}

@api.get('/users-list/')
async def get_user_list(username: str = Depends(get_current_user)):
    try:
        role = mydb.login.find_one({"email_add": username})
        roleAuthenticate = mydb.roles.find_one({"role": (role or {}).get("role")})
        if not roleAuthenticate or "Allowed Roles" not in (roleAuthenticate.get("allowed_access") or []):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not Authorized")
        result = mydb.login.find().sort("fullname", -1)
        

        user_data = [
                {
                "id": str(items['_id']),   
                "fullname": items['fullname'],
                "email_add": items['email_add'],
                "status": items['status'],
                "role": items['role'],
                "created": items['created']
                               }
                for items in result
            ]
        #print(user_data)

        return user_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api.put("/api-update-user/{id}")
async def api_update_employee(id: str,
                               data: UpdateUser,
                               username: str = Depends(get_current_user)):
    
    try:
            role = mydb.login.find_one({"email_add": username})
            roleAuthenticate = mydb.roles.find_one({"role": (role or {}).get("role")})
            if not roleAuthenticate or "Allowed Roles" not in (roleAuthenticate.get("allowed_access") or []):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not Authorized")

            obj_id = ObjectId(id)

            update_data = {

                "status": data.status,
                "role": data.role
                
                
            }

            result = mydb.login.update_one({'_id': obj_id}, {'$set': update_data})

            return ('Data has been Update')
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid id")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
  

