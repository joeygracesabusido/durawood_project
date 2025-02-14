from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional
from pydantic import BaseModel
from bson import ObjectId

from datetime import datetime, timedelta


from  ..database.mongodb import create_mongo_client
mydb = create_mongo_client()


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

#from apps.views.sign_up_views import UserViews
#from apps.base_model.user_bm import UserBM, UpdateUserBM



class SignUpModel(BaseModel):
    fullname: str
    email_add: str
    password: str
    created: datetime = datetime.utcnow()
    status: Optional[str] = None
    role: str



class UpdateUser(BaseModel):
    status: str
    role: Optional[str] = None



def get_password_hash(password):
    return pwd_context.hash(password)


  

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
            
            password_check = pwd_context.verify(password,password1)
            
            return password_check

            
        else :
            False






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





@api.post('/api-sign-up')
def sign_up(data: SignUpModel):
    """This function is for inserting """
    #,token: str = Depends(oauth_scheme)

    login_collection = mydb['login']
    login_collection.create_index("email_add", unique=True)
    login_collection.create_index("fullname", unique=True)


    dataInsert = {
        "fullname": data.fullname,
        "email_add": data.email_add,
        "password": get_password_hash(data.password),
        "status": data.status,
        "role": data.role,
        "created": data.created
    }
    mydb.login.insert_one(dataInsert)
    return {"message": "User has been saved"}

@api.get('/users-list/')
async def get_user_list(token: str = Depends(oauth_scheme)):
    try:
        print(token)
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

        
       
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api.put("/api-update-user/{id}")
async def api_update_employee(id: str,
                               data: UpdateUser,
                               username: str = Depends(oauth_scheme)):
    
    try:
    

            obj_id = ObjectId(id)

            update_data = {

                "status": data.status,
                "role": data.role
                
                
            }

            result = mydb.login.update_one({'_id': obj_id}, {'$set': update_data})

            return ('Data has been Update')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
  

