# QuickBooks Expense Form - Quick Reference Guide

## 🚀 Quick Start

### Accessing the Forms

**Add New Expense**: http://localhost:1000/add-expense/
**Edit Expense**: http://localhost:1000/edit-expense/{expense_id}/

### Form Walkthrough (Add Mode)

1. **Select Payee** - Choose supplier or create new
2. **Choose Payment Account** - Bank, Cash, or Credit Card
3. **Set Date** - Defaults to today
4. **Add Expense Lines**:
   - Click "+ Add lines" or start with default line
   - Fill Category (required)
   - Add Description
   - Enter Amount (required)
   - Add Tax if needed
   - Add Customer/Class info
5. **Add Memo** - Optional notes
6. **Attach Files** - Optional (max 20 MB each)
7. **Review Totals** - Check subtotal and total
8. **Submit** - Click "Save Expense"

## 📁 File Structure

```
/apps/templates/accounting/
├── add_expense.html                    ← Multi-line form (NEW)
└── edit_expense.html                   ← Edit form (UPDATED)

/apps/static/accounting/
├── quickbooks_expense_form.css         ← Form styling (NEW)
└── quickbooks_expense_form.js          ← Form logic (NEW)
```

## 🎨 Design Features

| Feature | Description |
|---------|-------------|
| **Gradient Header** | Purple (#667eea) to pink (#764ba2) background |
| **Real-time Totals** | Updates instantly as you change amounts |
| **Multi-line Entry** | Add unlimited expense lines to one payment |
| **Dynamic Categories** | 15 predefined categories loaded from API |
| **Responsive Design** | Works on desktop, tablet, and mobile |
| **Form Validation** | Prevents incomplete submissions |
| **Professional Styling** | QuickBooks-inspired interface |
| **Color Coding** | Status badges use green/yellow/red |
| **Print-friendly** | Hides controls for clean printing |

## 🔧 Key Functions

### JavaScript Functions

```javascript
// Initialize form
initializeForm()                    // Set date to today

// Load data
loadCategories()                    // Fetch expense categories
loadPayees()                        // Fetch existing payees

// Line management
addExpenseLine()                    // Add new expense line
deleteExpenseLine()                 // Remove expense line
updateLineNumbers()                 // Keep line #s sequential
clearAllLines()                     // Reset to blank line

// Calculations
calculateTotals()                   // Update subtotal/total display

// File handling
triggerFileInput()                  // Open file picker
removeAttachment()                  // Delete attached file

// Form operations
submitExpenseForm()                 // Send data to API
updateExpense()                     // Update existing expense
deleteExpense()                     // Delete expense record

// Utilities
formatCurrency(value)               // Format as PHP currency
openAddPayeeModal()                 // Create new payee
```

## 🔌 API Integration

### Required Endpoints

```
GET /api-get-expense-categories/
├── Response: { "categories": ["Category 1", "Category 2", ...] }
├── Called: On page load
└── Used for: Category dropdown population

GET /api-get-payees/ (Optional)
├── Response: { "payees": ["Payee 1", "Payee 2", ...] }
├── Called: On page load
└── Used for: Payee dropdown population

POST /api-add-expense/
├── Body: { date, category, vendor, description, amount, ... }
├── Response: { "id": "...", "status": "success" }
└── Used for: Create new expense

PUT /api-update-expense/{id}
├── Body: { date, category, vendor, description, amount, ... }
├── Response: { "status": "success" }
└── Used for: Update existing expense

DELETE /api-delete-expense/{id}
├── Response: { "status": "success" }
└── Used for: Delete expense
```

## ✅ Form Fields

### Header Section
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Payee | Dropdown/Text | Yes | Select or add new supplier |
| Payment Account | Dropdown | Yes | Bank, Cash, or Credit Card |

### Date Section
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Date | Date Input | Yes | Defaults to today |

### Expense Lines (Table)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Category | Dropdown | Yes | 15 predefined categories |
| Description | Text | No | Line item description |
| Amount | Number | Yes | Must be > 0, 2 decimals |
| Tax | Number | No | Tax amount for line |
| Customer | Text | No | Customer name if applicable |
| Class | Text | No | Classification/project code |

### Additional Sections
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Memo | Textarea | No | Multi-line notes |
| Attachments | File | No | Max 20 MB per file |
| Tax Type | Dropdown | No | Exclusive/Inclusive |
| Status | Dropdown | No | Edit mode only |

## 🎯 Form Validation Rules

```
Date
├── Required: Yes
└── Format: YYYY-MM-DD

Payment Account
├── Required: Yes
└── Options: Bank, Cash, Credit Card

Expense Lines
├── Minimum: 1 line required
├── Category: Required per line
├── Amount: Required, must be > 0
└── At least one line with amount > 0

File Attachments
├── Max Size: 20 MB per file
└── Multiple: Allowed

Overall
├── Form cannot submit if: Missing required fields
├── Form cannot submit if: All amounts are 0
└── Form cannot submit if: Payment account not selected
```

## 🎨 CSS Classes

```css
.expense-form-container     /* Main form wrapper */
.form-header               /* Payee and payment account row */
.form-group                /* Individual form group */
.form-label-small          /* Small uppercase labels */
.form-control-sm           /* Small form controls */
.expense-lines-section     /* Expense table wrapper */
.expense-lines-table       /* Main table element */
.expense-line              /* Individual table row */
.amount-display            /* Gradient amount box */
.totals-section            /* Subtotal/total display area */
.form-buttons              /* Submit/reset button row */
.attachment-area           /* File upload area */
.attachment-item           /* Individual attachment row */
```

## 🔄 Data Flow Example

### Adding New Expense

```javascript
// 1. User fills form
Date: 2025-11-12
Payee: ABC Supplies
Payment Account: Bank Clearing Account
Lines:
  - Category: Office Supplies, Amount: 500.00
  - Category: Equipment, Amount: 1500.00, Tax: 150.00

// 2. User clicks "Save Expense"
submitExpenseForm()
  ├─ Validate all fields ✓
  ├─ Collect data:
  │  {
  │    date: "2025-11-12",
  │    category: "Office Supplies",
  │    vendor: "ABC Supplies",
  │    description: "Office Supplies; Equipment",
  │    amount: 2000.00,
  │    payment_method: "Payment Account",
  │    reference_no: "Bank Clearing Account",
  │    remarks: "",
  │    status: "Approved"
  │  }
  ├─ POST /api-add-expense/
  └─ On success: Redirect to /expense-list/

// 3. Success message shows
✅ Expense added successfully!
```

## 🐛 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Categories not loading | API endpoint missing/failing | Check `/api-get-expense-categories/` endpoint |
| Totals not calculating | JavaScript error | Check browser console (F12) |
| Form won't submit | Validation error | Fill all required fields (marked with *) |
| Files not attaching | Size limit exceeded | Keep files under 20 MB |
| Payee dropdown empty | Optional API not implemented | Use manual text entry |
| Delete button missing | In add mode (not edit) | Go to edit page to delete |
| Mobile layout broken | CSS not loading | Check `/static/accounting/quickbooks_expense_form.css` |
| Submit button not working | Form validation failing | Ensure: Date set, Account selected, Amount > 0 |

## 🎹 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Tab | Move to next field |
| Shift+Tab | Move to previous field |
| Enter | Submit form (when in submit button) |
| Alt+Shift+S | Submit form (global) |
| Escape | Cancel/Close (if in modal) |

## 📱 Responsive Behavior

```
Desktop (>1000px)
├── 2-column header (payee + amount)
├── Full width table
└── Side-by-side buttons

Tablet (768-1000px)
├── Stacked header sections
├── Scrollable table
└── Adjusted spacing

Mobile (<768px)
├── Full width single column
├── Stacked form sections
├── Horizontal scroll table
└── Full width buttons
```

## 📊 Category List (15 Options)

1. Office Supplies
2. Utilities
3. Travel
4. Meals & Entertainment
5. Office Equipment
6. Insurance
7. Professional Services
8. Advertising & Marketing
9. Maintenance & Repairs
10. Rent & Lease
11. Supplies
12. Technology & Software
13. Training & Development
14. Vehicle Expenses
15. Other

## 💾 Data Submitted to API

```json
{
  "date": "2025-11-12",
  "category": "Office Supplies",
  "vendor": "ABC Company",
  "description": "Office supplies and materials",
  "amount": 1500.00,
  "payment_method": "Payment Account",
  "reference_no": "Bank Clearing Account",
  "remarks": "Monthly office supplies order",
  "status": "Approved"
}
```

## 🔐 Security Features

- Form validation on client-side
- CSRF token (if configured in FastAPI)
- SQL injection prevention (via Pydantic validation)
- XSS protection (template escaping)
- File size limits (20 MB)
- File type validation (optional)

## 📚 Related Documentation

- [Expense Module README](/EXPENSE_MODULE_README.md)
- [Form Layout Guide](/QUICKBOOKS_FORM_LAYOUT.md)
- [Backend Routes](/apps/routes/accounting/expense.py)
- [Database Model](/apps/base_model/expense_bm.py)

## 🚀 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile (Android 10+)

## 📞 Support

For issues or questions:
1. Check browser console (F12)
2. Review troubleshooting section above
3. Check API endpoint responses
4. Verify network connectivity
5. Clear browser cache and reload

---

**Last Updated**: November 12, 2025
**Version**: 1.0
**Status**: Production Ready
