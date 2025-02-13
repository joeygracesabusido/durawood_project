from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional
from pydantic import BaseModel
#from bson import ObjectId

from datetime import datetime, timedelta


#from  ..database.mongodb import create_mongo_client
#mydb = create_mongo_client()


from ..authentication.utils import OAuth2PasswordBearerWithCookie

from jose import jwt

JWT_SECRET = 'myjwtsecret'
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

api = APIRouter()
templates = Jinja2Templates(directory="apps/templates")



from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

oauth_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="token")

# oauth_scheme = OAuth2PasswordBearer(tokenUrl="token")



from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


from ..authentication.utils import OAuth2PasswordBearerWithCookie
from  ..authentication.authenticate_user import get_current_user

from apps.views.sign_up_views import UserViews
from apps.base_model.user_bm import UserBM, UpdateUserBM



def get_password_hash(password):
    return pwd_context.hash(password)


def authenticate_user(username, password):
    # user = mydb.login.find({"username":username})
    user = UserViews.get_user_for_login(username=username)
    
    # print(user)
    username = user.username
    hashed_password = user.hashed_password

    if user:
        password_check = pwd_context.verify(password,hashed_password)
        return password_check

    elif user == None:
        return{'Not Autherized'}
    else :
        # False
        print("error")

   





def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()

    expire = datetime.utcnow() + expires_delta

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

    data = {"sub": username}
    jwt_token = jwt.encode(data,JWT_SECRET,algorithm=ALGORITHM)
    response.set_cookie(key="access_token", value=f'Bearer {jwt_token}',httponly=True)
    
    return {"access_token": jwt_token, "token_type": "bearer"}
    # return {"access_token": access_token, "token_type": "bearer"}
    # return(access_token)


@api.post('/sign-up')
def sign_up(data: UserBM):
    """API endpoint to insert a new user."""
    try:
        UserViews.insert_user(data,get_password_hash(data.hashed_password))
        return ("New User Has been Saved")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


   
@api.get("/users/", response_model=List[UserBM])
def get_all_users():
    """API endpoint to get a list of all users."""
    try:
        users = UserViews.get_user()
        if not users:
            raise HTTPException(status_code=404, detail="No users found.")
        return users
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



@api.put("/api-update-user-status/{update_username}")
async def api_update_user_status(update_username: str,
                                 item: UpdateUserBM,
                                 username: str = Depends(get_current_user)):
    """API endpoint to update a user's status."""
    try:
        update_success = UserViews.update_user(update_username, item.is_active)
        if update_success:
            return {"detail": "User status updated successfully."}
        else:
            raise HTTPException(status_code=404, detail="User not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
  




