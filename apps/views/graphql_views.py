import strawberry
from typing import Optional,List, Dict

from datetime import date, datetime

#from apps.views.accounting.journal_entry_views import JournalEntryViews

import re


from  ..database.mongodb import create_mongo_client
mydb = create_mongo_client()


from apps.authentication.authenticate_user import get_current_user


class IsLoggedIn(strawberry.BasePermission):
    message = "Not Authorized"

    def has_permission(self, source, info, **kwargs) -> bool:
        ctx = info.context
        request = ctx.get("request") if isinstance(ctx, dict) else getattr(ctx, "request", None)
        if request is None:
            return False
        try:
            get_current_user(request)
            return True
        except Exception:
            return False



@strawberry.type
class User:
    _id: str
    fullname: str
    email_add: str
    created: datetime
    status: str
    role: str

@strawberry.type
class CustomerBalance:
    customer: str
    total_balance: float

   


@strawberry.type
class Query:

    @strawberry.field(permission_classes=[IsLoggedIn])
    async def get_user(self) -> List[User]:
        userData = mydb.login.find()

        return [User(
                _id = str(i['_id']),
                fullname = i['fullname'],
                email_add = i['email_add'],
                status = i['status'],
                role = i['role'],
                created = i['created']

        ) for i in userData

        ]


    @strawberry.field(permission_classes=[IsLoggedIn])
    async def autocomplete_user(self, serach_term:str) -> List[User]:

        regex = re.compile(re.escape(serach_term), re.IGNORECASE)

        userData = mydb.login.find({'fullname': {'$regex': regex}})

        return [User(
                _id = str(i['_id']),
                fullname = i['fullname'],
                email_add = i['email_add'],
                status = i['status'],
                role = i['role'],
                created = i['created']

        ) for i in userData

        ]



	



