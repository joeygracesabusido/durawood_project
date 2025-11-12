# Expense Module - QuickBooks Style

## Overview

The Expense module is a comprehensive business expense tracking system similar to QuickBooks, fully integrated into the Durawood accounting system. It allows users to record, categorize, and manage all business expenses with a professional QuickBooks-like interface.

## Features

### ✅ Core Features
- **Add Expenses** - Record new business expenses with full details
- **Edit Expenses** - Modify existing expense records
- **Delete Expenses** - Remove incorrect or duplicate entries
- **Expense List** - View all expenses with filters and search
- **Status Tracking** - Track expense approval status (Approved, Pending, Rejected)
- **Category Management** - Organize expenses by predefined categories
- **Payment Methods** - Track different payment methods (Cash, Check, Bank Transfer, etc.)

### ✅ Reporting & Analysis
- **Summary Dashboard** - Key metrics at a glance:
  - Total Expenses Amount
  - Approved Expense Count
  - Pending Expense Count
  - Total Records
- **Expense Summary by Category** - View totals grouped by category
- **Expense Summary by Status** - View totals grouped by approval status
- **PDF Export** - Print professional expense reports
- **Excel Export** - Export data for further analysis

### ✅ Filtering & Search
- **Date Range Filtering** - Filter expenses by date period
- **Category Filtering** - Filter by expense category
- **Status Filtering** - Filter by approval status
- **Quick Search** - Real-time search by vendor or description
- **Advanced Filters Panel** - Comprehensive filtering options

## File Structure

```
apps/
├── base_model/
│   └── expense_bm.py                    # Pydantic model for expenses
├── routes/accounting/
│   └── expense.py                        # API endpoints
├── templates/accounting/
│   ├── expense_list.html                 # Expense list page
│   ├── add_expense.html                  # Add expense form
│   └── edit_expense.html                 # Edit expense form
└── static/accounting/
    ├── expense_list.css                  # List page styling
    ├── expense_form.css                  # Form page styling
    ├── expense_list.js                   # List page functionality
    └── expense_form.js                   # Form page functionality
```

## Database Schema

### Expenses Collection
```json
{
  "_id": ObjectId,
  "date": Date,
  "category": String,
  "vendor": String,
  "description": String,
  "amount": Number,
  "payment_method": String,
  "reference_no": String (optional),
  "remarks": String (optional),
  "status": String (Approved|Pending|Rejected),
  "user": String,
  "date_created": DateTime,
  "date_updated": DateTime
}
```

## API Endpoints

### Template Routes
- `GET /expense-list/` - Display expense list page
- `GET /add-expense/` - Display add expense form
- `GET /edit-expense/{expense_id}` - Display edit expense form

### API Endpoints

#### Get Expenses
```
GET /api-get-expenses/?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD&category=CATEGORY
Response: Array of expense objects
```

#### Add Expense
```
POST /api-add-expense/
Body: {
  "date": "2025-11-12T00:00:00",
  "category": "Office Supplies",
  "vendor": "Vendor Name",
  "description": "Description",
  "amount": 250.50,
  "payment_method": "Check",
  "reference_no": "CHK-001",
  "remarks": "Optional remarks",
  "status": "Approved"
}
Response: { "message": "Expense added successfully", "id": "..." }
```

#### Update Expense
```
PUT /api-update-expense/{expense_id}
Body: (same as add expense)
Response: { "message": "Expense updated successfully" }
```

#### Delete Expense
```
DELETE /api-delete-expense/{expense_id}
Response: { "message": "Expense deleted successfully" }
```

#### Get Expense Summary by Category
```
GET /api-get-expense-summary/?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
Response: Array with category totals
```

#### Get Expense Summary by Status
```
GET /api-get-expense-by-status/?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
Response: Array with status totals
```

#### Get Expense Categories
```
GET /api-get-expense-categories/
Response: ["Salaries & Wages", "Office Supplies", ...]
```

#### Upload Expenses from Excel
```
POST /api-upload-expenses/
Form-data: file (Excel/CSV file)
Response: { "inserted_count": 50, "errors": [...] }
```

## Expense Categories

The module includes 15 predefined categories:
1. Salaries & Wages
2. Office Supplies
3. Utilities
4. Rent/Lease
5. Transportation
6. Meals & Entertainment
7. Professional Services
8. Insurance
9. Equipment
10. Maintenance & Repairs
11. Advertising
12. Travel
13. Training & Development
14. Software & Subscriptions
15. Other

## Payment Methods

- Cash
- Check
- Bank Transfer
- Credit Card
- Other

## Status Types

- **Approved** - Expense is approved and recorded
- **Pending** - Expense awaiting approval
- **Rejected** - Expense has been rejected

## How to Use

### Adding an Expense
1. Click "Accounting" → "Expenses" in the sidebar
2. Click the "Add Expense" button
3. Fill in the expense details:
   - Select date
   - Choose category
   - Enter vendor/payee name
   - Add description
   - Enter amount
   - Select payment method
   - Optionally add reference number, status, and remarks
4. Click "Save Expense"

### Viewing Expenses
1. Click "Accounting" → "Expenses" in the sidebar
2. All expenses from the last 30 days are shown by default
3. Use filters to narrow down results:
   - Click "Filters" to show advanced filter panel
   - Set date range, category, or status
   - Click "Search" to apply filters
4. Use "Quick Search" for instant filtering by vendor or description

### Editing an Expense
1. Click "Edit" button next to the expense
2. Modify any fields
3. Click "Update Expense"

### Deleting an Expense
1. Click "Edit" button next to the expense
2. Click "Delete" button
3. Confirm the deletion

### Exporting Reports
1. Click "PDF" button to print/save as PDF
2. Click "Excel" button to export to spreadsheet

## QuickBooks-Style Features

✅ **Dashboard Cards** - Quick overview of key metrics  
✅ **Professional UI** - Modern, clean interface  
✅ **Responsive Design** - Works on desktop, tablet, mobile  
✅ **Advanced Filtering** - Multiple filter options  
✅ **Real-time Search** - Instant client-side filtering  
✅ **Status Badges** - Visual status indicators  
✅ **Expense Summary** - Category and status breakdowns  
✅ **Print/Export** - PDF and Excel export  
✅ **Date Range Selection** - Quick period filtering  

## Keyboard Shortcuts & Tips

- Use Tab to move between form fields
- Press Enter in Quick Search to search
- Click column headers to sort
- Use pagination controls for large datasets

## Integration with Other Modules

The Expense module integrates with:
- **Authentication** - User tracking for all expenses
- **Accounting Dashboard** - Displays in accounting sidebar
- **Reports** - Can be included in financial reports

## Future Enhancements

- Budget tracking and alerts
- Receipt/attachment uploads
- Approval workflow system
- Multi-level approval process
- Recurring expense templates
- Expense categorization rules
- Integration with accounting entries
- Expense forecast and budgeting
- Vendor/supplier management
- Tax category mapping

## Troubleshooting

### Expenses not showing
- Check browser console for errors (F12)
- Verify date range is correct
- Clear browser cache and refresh
- Ensure user has appropriate permissions

### Add/Edit not working
- Check that all required fields are filled
- Verify amount is a valid number
- Check browser console for error messages

### Report export fails
- Try a smaller date range
- Close other applications using the file
- Clear browser cache

## Support

For issues or questions about the Expense module, contact the development team or check the system logs for detailed error information.
