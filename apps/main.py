from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import PlainTextResponse

# from .routes.login import api
# from .routes.admin import api
# from .routes.login import login_router
from apps.routes.admin import api
from apps.routes.login import login_router

from apps.routes.payroll_template import api_payroll_temp
from apps.routes.payroll import api_payroll

from apps.routes.graphql import graphql_app




from apps.routes.accounting.chart_of_account_temp import api_chart_of_account_temp

from apps.routes.accounting.chart_of_account import api_chart_of_account
from apps.routes.accounting.insert_account_type import api_account_type


from apps.routes.accounting.accounting_templ import api_accounting_temp


from apps.routes.accounting.journal_entry import api_journale_entry
from apps.routes.accounting.company_profile_temp import api_company_profile_temp


from apps.routes.accounting.trial_balance_temp import api_trial_balance_temp


from apps.routes.accounting.company_profile import api_company_profile
from apps.routes.accounting.company_profile_temp import api_company_profile_temp


from apps.routes.accounting.branch_temp import api_branch_temp
from apps.routes.accounting.branch import api_branch


from apps.routes.accounting.customer_profile import api_customer_profile
from apps.routes.accounting.customer_profile_temp import api_customer_profile_temp


from apps.routes.accounting.sales_routes import api_sales


from apps.routes.accounting.sales_report import api_sales_report


from apps.routes.accounting.purchase_routes import api_purchases
from apps.routes.accounting.purchase_report import api_purchase_report


from apps.routes.accounting.balance_sheet import api_balance_sheet

from apps.routes.accounting.income_statement import api_income_statement


from apps.routes.accounting.beg_balance import api_beg_bal_temp


from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/static", StaticFiles(directory="apps/static"), name="static")


app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)



app.include_router(api, tags=["admin"])

app.include_router(api_chart_of_account_temp)


app.include_router(login_router)

app.include_router(api_payroll_temp)
app.include_router(api_payroll, tags=['Paryoll'])




app.include_router(api_accounting_temp)

app.include_router(api_account_type, tags=['Type of Account'])
app.include_router(api_chart_of_account, tags=['Chart of Account'])


app.include_router(api_journale_entry, tags=['Journal Entry'])
app.include_router(api_company_profile_temp)

app.include_router(api_trial_balance_temp)


app.include_router(api_company_profile, tags=['Company Profile'])
app.include_router(api_company_profile_temp)

app.include_router(api_branch, tags=['Branch'])
app.include_router(api_branch_temp)


app.include_router(api_customer_profile, tags=['Customer-Vendor'])
app.include_router(api_customer_profile_temp)


app.include_router(api_sales, tags=['Sales'])
app.include_router(api_sales_report, tags=['Sales Report'])

app.include_router(api_purchases, tags=['Purchases'])
app.include_router(api_purchase_report)


app.include_router(api_balance_sheet)

app.include_router(api_income_statement)

app.include_router(api_beg_bal_temp)


# Mount Strawberry's GraphQL app onto FastAPI
app.mount("/graphql", graphql_app)


