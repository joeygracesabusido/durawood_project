import strawberry
from typing import Optional,List, Dict

from datetime import date, datetime

#from apps.views.accounting.journal_entry_views import JournalEntryViews

import re


from  ..database.mongodb import create_mongo_client
mydb = create_mongo_client()




@strawberry.type
class User:
    _id: str
    fullname: str
    email_add: str
    password: str
    created: datetime
    status: str
    role: str

@strawberry.type
class CustomerBalance:
    customer: str
    total_balance: float

   


@strawberry.type
class Query:

    @strawberry.field
    async def get_user(self) -> List[User]:
        userData = mydb.login.find()

        return [User(
                _id = str(i['_id']),
                fullname = i['fullname'],
                email_add = i['email_add'],
                password = i['password'],
                status = i['status'],
                role = i['role'],
                created = i['created']

        ) for i in userData

        ]


    @strawberry.field
    async def autocomplete_user(self, serach_term:str) -> List[User]:

        regex = re.compile(serach_term, re.IGNORECASE)

        userData = mydb.login.find({'fullname': {'$regex': regex}})

        return [User(
                _id = str(i['_id']),
                fullname = i['fullname'],
                email_add = i['email_add'],
                password = i['password'],
                status = i['status'],
                role = i['role'],
                created = i['created']

        ) for i in userData

        ]



	



