# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Durawood Project is an Accounting and ERP system for Durawood Construction & Lumber Supply, Inc. It manages sales, payments, expenses, customer/vendor profiles, and financial reporting.

## Technology Stack

- **Backend:** FastAPI (Python 3.x)
- **Database:** MongoDB (NoSQL)
- **Caching:** Redis
- **API:** REST (FastAPI) & GraphQL (Strawberry)
- **Frontend:** Jinja2 Templates, Bootstrap 5, jQuery, Vanilla JS
- **Visualization:** ApexCharts, Chart.js, ECharts

## Build and Run Commands

### Using Docker (Recommended)
```bash
docker-compose up --build
```
Application accessible at `http://localhost:1000`.

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run application (requires Redis on port 6379)
uvicorn apps.main:app --host 0.0.0.0 --port 1000 --reload
```

## Architecture

```
apps/
├── main.py                 # Entry point, router registration, middleware
├── routes/
│   ├── login.py            # Authentication routes
│   ├── admin.py            # Admin routes
│   ├── roles.py            # Role management
│   ├── graphql.py          # GraphQL endpoint
│   ├── payroll.py          # Payroll module
│   └── accounting/         # Accounting module routes
│       ├── sales_routes.py
│       ├── payment.py
│       ├── expense.py
│       ├── ar_aging.py
│       └── customer_profile.py
├── authentication/
│   ├── authenticate_user.py # JWT authentication, get_current_user()
│   └── utils.py
├── database/
│   ├── mongodb.py          # MongoDB connection factory
│   └── databases.py
├── base_model/             # Pydantic models for validation
├── templates/              # Jinja2 HTML templates
│   ├── dashboard.html      # Base layout (all pages extend this)
│   ├── dashboard2.html
│   └── accounting/         # Accounting module templates
└── static/
    ├── accounting/         # Module-specific JS/CSS
    ├── assets/             # Vendor libraries, global CSS
    └── style.css
```

## Key Patterns

### Database Access
All MongoDB operations use the `mydb` instance from `apps.database.mongodb`:
```python
from apps.database.mongodb import create_mongo_client
mydb = create_mongo_client()
# Usage: mydb.collection_name.find_one({...})
```

### Authentication
Protected routes use `get_current_user` dependency:
```python
from apps.authentication.authenticate_user import get_current_user

@router.get("/protected-route")
async def protected(request: Request, username: str = Depends(get_current_user)):
    # username contains authenticated user
```

### Templates
Routes return Jinja2 templates:
```python
templates = Jinja2Templates(directory="apps/templates")
return templates.TemplateResponse("template.html", {"request": request})
```

### Redis Caching
Redis is available via `app.state.redis`:
```python
@app.on_event("startup")
async def startup_event():
    app.state.redis = Redis(host=redis_host, port=6379, db=0)
```

### JavaScript Files
Module-specific JS files in `apps/static/accounting/` follow naming pattern matching their route. Use Vanilla JS for new features; existing code uses jQuery.

## Development Conventions

- **Python:** PEP 8, use Pydantic models for data structures
- **Templates:** Extend `dashboard.html`, use Bootstrap 5 classes
- **Database:** Use MongoDB aggregation pipelines for complex reports
- **Frontend:** Prefer Vanilla JS for new interactive features

## Important Notes

- MongoDB connection string is in `apps/database/mongodb.py`
- JWT secret and auth constants in `apps/authentication/authenticate_user.py` and `apps/routes/login.py`
- Redis caching pattern demonstrated in `apps/routes/accounting/ar_aging.py`