# QuickBooks-Style Expense Form Update

## Overview

The expense form has been completely redesigned to match the QuickBooks interface, featuring a professional multi-line expense entry system with payee management, payment accounts, detailed expense lines, and real-time total calculations.

## Files Updated/Created

### 1. **HTML Templates**

#### `/apps/templates/accounting/add_expense.html` ✅ Updated
- Completely redesigned from simple single-line form to multi-line QuickBooks style
- Features:
  - **Payee Selection**: Dropdown with option to add new payees
  - **Payment Account**: Choose from Bank Clearing Account, Cash, or Credit Card
  - **Amount Display**: Live total showing in gradient header
  - **Dynamic Expense Lines**: Table with multiple line items, each with:
    - Category dropdown (15 expense categories)
    - Description text field
    - Amount input
    - Tax input
    - Customer name
    - Class field
  - **Add/Remove Lines**: Buttons to add more expense lines or clear all
  - **Item Details**: Collapsible section for additional options
  - **Memo**: Multi-line remarks field
  - **Attachments**: File upload with 20 MB limit per file
  - **Tax Information**: Selector for tax type (Exclusive/Inclusive)
  - **Live Totals**: Subtotal and Total display updated in real-time
  - **Form Buttons**: Clear and Save Expense

#### `/apps/templates/accounting/edit_expense.html` ✅ Updated
- Converted to match add_expense form style
- Pre-populated fields from database
- Delete button in header
- Status field for approval workflow
- All same features as add_expense form

### 2. **Stylesheets**

#### `/apps/static/accounting/quickbooks_expense_form.css` ✅ Created
- **500+ lines** of professional styling
- Features:
  - **Form Header**: Payee and payment account selection with amount display
  - **Amount Display**: Gradient purple-to-pink background with large font
  - **Form Labels**: Small uppercase labels (QuickBooks style)
  - **Expense Lines Table**: 
    - Hover effects on rows
    - Bordered cells with proper spacing
    - Color-coded status badges (ready for future use)
  - **Validation Styles**: Red borders for invalid fields, green for valid
  - **Responsive Design**:
    - Mobile breakpoints: 768px and 576px
    - Stacked buttons on mobile
    - Adjusted table sizing for small screens
  - **Print Styles**: Hide buttons and maintain layout
  - **Animations**: Smooth slide-in for new expense lines
  - **Color Scheme**:
    - Primary: #0066cc (blue)
    - Success: #10b981 (green)
    - Danger: #ef4444 (red)
    - Border: #d1d5db (light gray)

### 3. **JavaScript Files**

#### `/apps/static/accounting/quickbooks_expense_form.js` ✅ Created
- **400+ lines** of comprehensive form handling
- Core Functions:
  - `initializeForm()`: Set default date to today
  - `loadCategories()`: Fetch category options from API
  - `loadPayees()`: Load existing payees (optional endpoint)
  - `addExpenseLine()`: Dynamically add new expense line with full functionality
  - `deleteExpenseLine()`: Remove a line with validation
  - `updateLineNumbers()`: Keep line numbers sequential
  - `clearAllLines()`: Reset table with confirmation
  - `calculateTotals()`: Real-time calculation of subtotal and total
  - `triggerFileInput()`: Open file attachment dialog
  - `removeAttachment()`: Delete selected attachment
  - `submitExpenseForm()`: Collect all data and send to API
  - `formatCurrency()`: Format numbers as PHP currency

- Event Handlers:
  - Amount and tax input changes trigger total recalculation
  - Add/delete/clear line buttons with proper validation
  - File attachment handling with size validation
  - Form submission with validation
  - Keyboard shortcuts (Alt+Shift+S to submit)

- Data Collection:
  - Combines all expense lines into single record
  - Extracts primary category from first line
  - Joins descriptions with semicolons
  - Sums all amounts for total

### 4. **API Integration**

The form integrates with existing endpoints:

```
GET /api-get-expense-categories/ 
  → Returns list of 15 expense categories
  → Used to populate category dropdowns

GET /api-get-payees/ (Optional - creates fallback to manual entry)
  → Returns list of existing payees
  → Used to populate payee dropdown

POST /api-add-expense/
  → Submits new expense
  → Body: { date, category, vendor, description, amount, payment_method, reference_no, remarks, status }

PUT /api-update-expense/{id}
  → Updates existing expense
  → Body: Same as POST

DELETE /api-delete-expense/{id}
  → Deletes expense record
```

## Form Structure

```
HEADER SECTION
├── Payee Selection (with "Add new" button)
├── Payment Account Selection
└── Amount Display (gradient box showing total)

DATE SECTION
└── Date Input (required, defaults to today)

EXPENSE LINES SECTION
├── Table with columns:
│   ├── # (line number)
│   ├── CATEGORY (dropdown, required)
│   ├── DESCRIPTION (text input)
│   ├── AMOUNT (number, required)
│   ├── TAX (number)
│   ├── CUSTOMER (text input)
│   ├── CLASS (text input)
│   └── DELETE (button)
├── Add Lines Button
└── Clear All Lines Button

ITEM DETAILS SECTION
└── Collapsible (for future expansion)

MEMO SECTION
└── Textarea for remarks

ATTACHMENTS SECTION
├── File input button
├── File size limit: 20 MB
└── Attachment list display

TOTALS SECTION
├── Subtotal display
└── Total display (bold, emphasized)

TAX INFORMATION SECTION
└── Tax type selector (Exclusive/Inclusive)

STATUS SECTION (Edit mode only)
└── Approval status (Approved/Pending/Rejected)

BUTTONS SECTION
├── Clear Button (resets form)
└── Save/Update Button (submits form)
```

## Key Features

### 1. **Multi-Line Expense Entry**
- Add unlimited expense lines for a single payment
- Each line has independent category, amount, tax
- Line numbers update automatically when lines are deleted

### 2. **Real-Time Calculations**
- Totals update automatically when amount or tax values change
- Subtotal and Total always accurate
- Amount display in header updates immediately

### 3. **Professional Styling**
- QuickBooks-inspired design
- Gradient header with purple/pink colors
- Proper spacing and typography
- Professional color scheme with good contrast

### 4. **Responsive Design**
- Full desktop experience with multi-column layout
- Tablet view with adjusted column sizes
- Mobile view with stacked form and full-width inputs
- Touch-friendly buttons and inputs

### 5. **Form Validation**
- Date is required
- Payment account is required
- At least one expense line with category and amount is required
- Amount must be greater than 0
- File attachments limited to 20 MB each

### 6. **Keyboard Support**
- Alt+Shift+S to submit form
- Tab navigation between fields
- Enter in certain contexts to submit

### 7. **Delete Functionality**
- Delete button visible in edit mode only
- Confirmation dialog before deletion
- Redirects to expense list after deletion

## Usage

### Adding a New Expense

1. Navigate to `/add-expense/`
2. Select or add a payee (supplier)
3. Choose payment account (Bank, Cash, Credit Card)
4. Set the date (defaults to today)
5. Add expense lines:
   - Select category for each line
   - Enter description
   - Enter amount (and optional tax)
   - Add customer and class if needed
   - Click "+ Add lines" to add more
6. Add optional memo/notes
7. Add file attachments if needed
8. Review totals
9. Click "Save Expense" to submit

### Editing an Expense

1. Navigate to `/edit-expense/{id}/`
2. All fields pre-populated with existing data
3. Modify any fields as needed
4. Review changes
5. Click "Update Expense" to save changes
6. Or click "Delete" to remove the expense

## Technical Details

### Category Dropdown Population
- Categories are loaded from backend API
- 15 predefined categories available:
  - Office Supplies
  - Utilities
  - Travel
  - Meals & Entertainment
  - etc. (from expense_routes.py)

### Payment Account Options
- Bank Clearing Account (default)
- Cash
- Credit Card
- Extensible for additional accounts

### Tax Handling
- Can be marked as Exclusive or Inclusive
- Tax amounts tracked per line
- Can add tax for specific expense lines only

### Status Options (Edit Mode)
- Approved (green)
- Pending (yellow)
- Rejected (red)

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- Categories loaded once on page load
- DOM updates optimized for multi-line operations
- Real-time calculations use simple math (no heavy processing)
- Form data serialized efficiently for API submission

## Future Enhancement Ideas

1. **Receipt/Attachment Upload**: Store and display receipt images
2. **Approval Workflow**: Multi-level approval process
3. **Recurring Expenses**: Templates for regular expenses
4. **Budget Alerts**: Warn if expense exceeds category budget
5. **Expense Forecasting**: Predict future category spending
6. **Split Transactions**: Allocate single payment across multiple projects
7. **Multi-currency**: Support for different currencies
8. **Invoice Matching**: Link expenses to vendor invoices
9. **Bank Integration**: Auto-import expense transactions
10. **OCR Support**: Extract data from receipt images

## Troubleshooting

### Categories not loading
- Check that `/api-get-expense-categories/` endpoint exists and returns data
- Check browser console for JavaScript errors
- Verify network connectivity

### Totals not calculating
- Ensure amount inputs are valid numbers
- Check browser console for JavaScript errors
- Try refreshing the page

### File attachments not working
- Verify file size is under 20 MB
- Check supported file types
- Verify file upload endpoint exists

### Form not submitting
- Check all required fields are filled (date, payment account, at least one line)
- Verify amount is greater than 0
- Check browser console for API errors
- Verify `/api-add-expense/` endpoint is working

## Related Files

- Backend Routes: `/apps/routes/accounting/expense.py`
- Database Model: `/apps/base_model/expense_bm.py`
- List Page: `/apps/templates/accounting/expense_list.html`
- List Styling: `/apps/static/accounting/expense_list.css`
- List JavaScript: `/apps/static/accounting/expense_list.js`

## Version History

**v1.0** (November 12, 2025)
- Initial QuickBooks-style form creation
- Multi-line expense entry support
- Real-time calculations
- Professional styling
- Responsive design
- Form validation
- Delete functionality
