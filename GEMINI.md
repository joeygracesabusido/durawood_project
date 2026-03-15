# GEMINI.md - Project Context & Instructions

## 📌 Project Overview
The **Durawood Project** is a specialized Accounting and Enterprise Resource Planning (ERP) system designed for Durawood Construction & Lumber Supply, Inc. It facilitates the management of sales, payments, expenses, customer/vendor profiles, and financial reporting.

### 🚀 Core Technologies
- **Backend:** FastAPI (Python 3.x)
- **Database:** MongoDB (NoSQL)
- **Caching:** Redis
- **API:** REST (FastAPI) & GraphQL (Strawberry)
- **Frontend:** Jinja2 Templates, Bootstrap 5, jQuery, Vanilla JS
- **Visualization:** ApexCharts, Chart.js, ECharts
- **Containerization:** Docker & Docker Compose

---

## 🏗️ Architecture & Structure
The project follows a modular structure within the `apps/` directory:

- `apps/main.py`: Application entry point, middleware configuration, and router inclusions.
- `apps/routes/`: Contains API and template routes, further categorized into:
    - `accounting/`: Sales, payments, expenses, AR aging, etc.
    - `payroll/`: Employee management and payroll computation.
- `apps/base_model/`: Pydantic models for request/response validation.
- `apps/database/`: Database connection logic (MongoDB & Redis).
- `apps/templates/`: Jinja2 HTML templates, extending `dashboard.html` or `dashboard2.html`.
- `apps/static/`: CSS, JS, and vendor assets.
- `apps/authentication/`: JWT-based user authentication and role-based access control.

---

## 🛠️ Building and Running

### Using Docker (Recommended)
```bash
docker-compose up --build
```
The application will be accessible at `http://localhost:1000`.

### Local Development
1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
2. **Run Redis:** Ensure a Redis server is running locally on port 6379.
3. **Run the Application:**
   ```bash
   uvicorn apps.main:app --host 0.0.0.0 --port 1000 --reload
   ```

---

## 📏 Development Conventions

### Coding Style
- **Python:** Adhere to PEP 8. Use Pydantic models for all data structures and API payloads.
- **Frontend:** Prefer Vanilla JS for new interactive features, while maintaining existing jQuery implementations. Use Bootstrap 5 utility classes for layout.

### Database Interaction
- All database operations should go through the `mydb` instance created by `create_mongo_client()`.
- Use MongoDB aggregation pipelines for complex reporting (e.g., AR Aging, Sales Summaries).

### State & Caching
- Use `app.state.redis` for caching frequent or expensive queries (like top customer balances).
- Use `app.state.http_client` for asynchronous external API calls.

### Documentation
- The project includes extensive Markdown documentation in the root directory (e.g., `DOCUMENTATION_INDEX.md`, `QUICKBOOKS_COMPLETE_GUIDE.md`). Always refer to these for module-specific logic and UI/UX standards.

---

## 🔍 Key Files & Entry Points
- `apps/main.py`: Main app configuration.
- `apps/routes/login.py`: Authentication and Dashboard entry.
- `apps/routes/accounting/ar_aging.py`: Core reporting logic.
- `apps/templates/dashboard.html`: Base layout for all authenticated pages.
- `apps/static/assets/css/style.css`: Main stylesheet.

---

## 📝 Usage for Gemini
When assisting with this project:
1. **Context First:** Always check the `apps/routes/` and `apps/templates/` folders to understand the feature's full lifecycle.
2. **UI Consistency:** Ensure all new pages or UI updates extend `dashboard.html` and use established Bootstrap patterns.
3. **Data Integrity:** Verify MongoDB queries, especially aggregations, to ensure they match the established schemas in `base_model/`.
4. **Caching:** If adding a high-traffic endpoint, implement Redis caching as demonstrated in `apps/routes/accounting/ar_aging.py`.
