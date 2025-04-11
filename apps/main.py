from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import PlainTextResponse

# from .routes.login import api
# from .routes.admin import api
# from .routes.login import login_router
#from apps.routes.admin import api


from apps.routes.graphql import graphql_app
from apps.routes.login import login_router
from apps.routes.admin import api
from apps.routes.accounting.customer_profile_temp import api_customer_profile_temp



from apps.routes.accounting.sales_routes import api_sales
from apps.routes.accounting.sales_report import api_sales_report


from apps.routes.accounting.payment import api_payment


from apps.routes.accounting.ar_aging import api_ar_aging_report


from apps.routes.accounting.category import api_category

from apps.routes.accounting.customer_profile import api_customer_profile


from apps.routes.accounting.cash_transaction import api_cash

from apps.routes.roles import api_roles

from fastapi.staticfiles import StaticFiles

app = FastAPI()
# app.mount("/static", StaticFiles(directory="apps/static"), name="static")
app.mount("/static", StaticFiles(directory="apps/static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)


app.include_router(login_router,tags=['Login'])

app.include_router(api, tags=['Admin'])
app.include_router(api_customer_profile_temp, tags=['Customer Profile'])

app.include_router(api_customer_profile, tags=['Customer/Vendor'])

app.include_router(api_sales, tags=['Sales'])

app.include_router(api_sales_report, tags=['Sales Report'])


app.include_router(api_payment, tags=['Payment'])


app.include_router(api_ar_aging_report, tags=['Aging Report'])

app.include_router(api_roles, tags=['Roles'])


app.include_router(api_category, tags=['Category'])

app.include_router(api_cash, tags=['Cash Transaction'])

# Mount Strawberry's GraphQL app onto FastAPI
app.mount("/graphql", graphql_app)


