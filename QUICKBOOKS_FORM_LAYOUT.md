# QuickBooks Expense Form - Visual Layout Guide

## Desktop View Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Expense                                                    [Back] [Copy]    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER SECTION                                                             │
│  ┌──────────────────────────────────────────────┬──────────────────────────┐│
│  │ Payee                                        │      AMOUNT              ││
│  │ [Select Payee ▼] [+ Add new EX]            │      ₱0.00               ││
│  │ Supplier                                     │                          ││
│  │                                              │                          ││
│  │ Payment account                              │   (Gradient purple box)  ││
│  │ [Bank Clearing Account ▼]                   │                          ││
│  └──────────────────────────────────────────────┴──────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ Date                                                                         │
│ [2025-11-12]                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ EXPENSE DETAILS                                                             │
│ ┌───┬──────────────┬──────────────┬────────┬──────┬──────────┬───────┬────┐│
│ │ # │  CATEGORY    │ DESCRIPTION  │ AMOUNT │ TAX  │ CUSTOMER │ CLASS │ 🗑 ││
│ ├───┼──────────────┼──────────────┼────────┼──────┼──────────┼───────┼────┤│
│ │ 1 │[Select... ▼] │[            ]│[0.00]  │[0.00]│[        ]│[      ]│ 🗑 ││
│ └───┴──────────────┴──────────────┴────────┴──────┴──────────┴───────┴────┘│
│                                                                             │
│ [+ Add lines] [↻ Clear all lines]                                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ ▶ Item details                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ Memo                                                                        │
│ ┌──────────────────────────────────────────────────────────────────────────┐│
│ │[Add notes or memo                                                        ]│
│ │[                                                                         ]│
│ │[                                                                         ]│
│ └──────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ Attachments                                                                 │
│ ┌──────────────────────────────────────────────────────────────────────────┐│
│ │        [🔗 Add attachment]                                               ││
│ │   Max file size: 20 MB                                                   ││
│ └──────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ TOTALS                                                                      │
│ ┌──────────────────────────────────────────────────────────────────────────┐│
│ │ Subtotal                                              ₱0.00               ││
│ │ ─────────────────────────────────────────────────────────────            ││
│ │ Total                                                 ₱0.00  (bold)      ││
│ └──────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ Amounts are                                                                 │
│ [Exclusive of Tax ▼]                                                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ Status (Edit mode only)                                                     │
│ [Approved ▼]                                                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                                          [Clear] [Save Expense]             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Mobile View Layout (< 768px)

```
┌──────────────────────────────────┐
│  Expense         [Back] [Copy]   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  HEADER SECTION                  │
│  Payee                           │
│  [Select Payee ▼]               │
│  [+ Add new EX]                 │
│  Supplier                        │
│                                  │
│  Payment account                 │
│  [Bank Clearing Account ▼]       │
│                                  │
│  AMOUNT                          │
│  ₱0.00                           │
│  (Gradient purple box)           │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ Date                             │
│ [2025-11-12]                     │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ EXPENSE DETAILS                  │
│ (Horizontal scroll table)         │
│ ┌──────────────────────────────┐ │
│ │ 1: Category   [Select... ▼]  │ │
│ │    Desc       [           ]  │ │
│ │    Amount     [0.00]         │ │
│ │    Tax        [0.00]         │ │
│ │    Customer   [          ]   │ │
│ │    Class      [          ]   │ │
│ │               [   🗑   ]      │ │
│ └──────────────────────────────┘ │
│                                  │
│ [+ Add lines] [↻ Clear all]     │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ Memo                             │
│ ┌──────────────────────────────┐ │
│ │[Add notes or memo          ]│ │
│ │[                            ]│ │
│ │[                            ]│ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ TOTALS                           │
│ Subtotal      ₱0.00              │
│ ─────────────────────────────    │
│ Total         ₱0.00              │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ [Clear]                          │
│ [Save Expense]                   │
└──────────────────────────────────┘
```

## Color Scheme

### Form Header
- **Background**: White
- **Payee Label**: Uppercase, small gray text
- **Amount Box**: Gradient purple (#667eea) to pink (#764ba2)
- **Amount Text**: White, large bold

### Expense Lines Table
- **Header Background**: Light gray (#f3f4f6)
- **Header Text**: Dark gray, uppercase
- **Row Background**: White
- **Row Hover**: Light gray (#f9fafb)
- **Borders**: Light gray (#d1d5db)

### Buttons
- **Primary (Save)**: Blue (#0066cc)
- **Secondary (Clear)**: Light gray with border
- **Danger (Delete)**: Red (#ef4444)
- **Link (Details)**: Blue, no border

### Input Fields
- **Border**: Light gray (#d1d5db)
- **Focus Border**: Blue (#0066cc)
- **Focus Shadow**: Light blue with 0.1 opacity
- **Invalid Border**: Red (#ef4444)
- **Valid Border**: Green (#10b981)

### Text Labels
- **Form Labels**: Uppercase, small (12px), gray, bold
- **Card Labels**: Medium, dark gray
- **Required Marker**: Red asterisk (*)

## Responsive Breakpoints

```
Desktop (> 768px)
├── Full multi-column layout
├── Side-by-side payee and amount display
├── Full width expense table
└── Inline buttons

Tablet (576px - 768px)
├── Stacked sections
├── Reduced padding
├── Adjusted font sizes
└── Stacked buttons

Mobile (< 576px)
├── Single column layout
├── Full-width inputs
├── Stacked buttons
├── Scrollable table
└── Larger touch targets (44px minimum)
```

## Interactive Elements

### Payee Selection
- Click to open dropdown
- Shows list of existing payees
- "Add new" button to create new payee
- Currently selected payee highlighted

### Add Lines Button
- Adds new row to expense table
- Auto-increments line number
- Pre-populates with empty fields
- Categories loaded dynamically

### Category Dropdown
- Per-line category selection
- 15 expense categories available
- Required field (validation)
- Loads from API on page load

### Amount & Tax Inputs
- Numeric inputs with 2 decimal places
- Update totals in real-time
- Allow negative amounts for returns
- Currency symbol (₱) displayed

### Delete Line Button
- Trash icon in last column
- Removes line from table
- Updates line numbers
- Recalculates totals
- Minimum 1 line required

### Clear All Lines Button
- Resets table to single empty line
- Shows confirmation dialog
- Resets totals to 0

### Attachments
- Click to open file picker
- Supports multiple files
- Shows file size validation
- Displays list of attached files
- Delete option per file

### Form Buttons
- **Clear**: Resets form to defaults
- **Save/Update**: Submits form data
- Keyboard shortcut: Alt+Shift+S

## Validation Indicators

```
✅ Valid field      - Green border
❌ Invalid field    - Red border with error message
⚠️  Warning field   - Yellow border (optional)
```

## Accessibility Features

- Keyboard navigation (Tab, Shift+Tab)
- ARIA labels on form inputs
- Color not sole indicator (also text)
- Sufficient contrast ratios (WCAG AA)
- Focus states visible on all interactive elements
- Error messages associated with fields

## Print Styles

- Hides all buttons and controls
- Maintains table formatting
- Preserves colors and layout
- Shows page breaks appropriately
- Suitable for printing or PDF export

## Loading States

```
Normal: Regular form appearance

Loading: 
├── Submit button shows spinner
├── Form slightly faded
└── Disabled during API call

Error:
├── Alert dialog with error message
├── Form remains editable
└── Error details provided

Success:
├── Alert dialog with checkmark
├── Redirect to expense list
└── Data saved confirmation
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    Expense Form                              │
└──────────────────────────────────────────────────────────────┘
                            │
                            ├─→ Initialize Form
                            │   └─→ Set Date to Today
                            │   └─→ Load Categories
                            │   └─→ Load Payees
                            │
                            ├─→ User Interactions
                            │   ├─→ Add Expense Line
                            │   │   └─→ Calculate Totals
                            │   ├─→ Delete Expense Line
                            │   │   └─→ Update Line Numbers
                            │   │   └─→ Calculate Totals
                            │   ├─→ Change Amount/Tax
                            │   │   └─→ Calculate Totals
                            │   └─→ Attach Files
                            │
                            ├─→ Form Submission
                            │   ├─→ Validate All Fields
                            │   ├─→ Collect All Data
                            │   ├─→ Show Loading Spinner
                            │   └─→ POST /api-add-expense/
                            │
                            └─→ Response Handling
                                ├─→ Success
                                │   ├─→ Show Success Alert
                                │   └─→ Redirect to List
                                └─→ Error
                                    ├─→ Show Error Alert
                                    └─→ Stay on Form
```
