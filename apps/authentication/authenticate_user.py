from fastapi.responses import HTMLResponse
from typing import Union, List, Optional
from datetime import datetime, date , timedelta

from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from jose import jwt

#from  ..database.mongodb import create_mongo_client
#mydb = create_mongo_client()


from apps.views.sign_up_views import UserViews


JWT_SECRET = 'myjwtsecret'
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def get_current_user(request:Request):

    try :
        token = request.cookies.get('access_token')
        # print(token)
        if token is None:
            raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail= "Not Authorized",
            # headers={"WWW-Authenticate": "Basic"},
            )
        else:
            scheme, _, param = token.partition(" ")
            payload = jwt.decode(param, JWT_SECRET, algorithms=ALGORITHM)
        
            username = payload.get("sub")    
            
            expiration_time = datetime.fromtimestamp(payload.get("exp"))

            if expiration_time < datetime.now():
                  raise HTTPException(
                status_code=401,
                detail="Session Expired",
                headers={"WWW-Authenticate": "Bearer"},
            )

            else:

                # user = mydb.login.find_one({"username": username})
                user = UserViews.get_user_for_login(username=username)

                if user == [] :
                    raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail= "Not Authorized",
                
                    )
                else:
                    
                    return username

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail= "Not Authorized Please login",
            # headers={"WWW-Authenticate": "Basic"},
        )

   

def get_current_user_details(request:Request):

    try :
        token = request.cookies.get('user')
        # print(token)
        if token is None:
            raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail= "Not Authorized",
            # headers={"WWW-Authenticate": "Basic"},
            )
        else:
            scheme, _, param = token.partition(" ")
            payload = jwt.decode(param, JWT_SECRET, algorithms=ALGORITHM)
        
            username = payload.get("sub")    
            
            expiration_time = datetime.fromtimestamp(payload.get("exp"))

            if expiration_time < datetime.now():
                  raise HTTPException(
                status_code=401,
                detail="Session Expired",
                headers={"WWW-Authenticate": "Bearer"},
            )

            else:

                # user = mydb.login.find_one({"username": username})
                user = UserViews.get_user_for_login(username=username)

                if user == [] :
                    raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail= "Not Authorized",
                
                    )
                else:
                    
                    return username

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail= "Not Authorized Please login",
            # headers={"WWW-Authenticate": "Basic"},
        )
       
