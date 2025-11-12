# Customer Autocomplete Dropdown Fix

## 🔧 Issue Fixed

The customer autocomplete dropdown was being hidden/clipped by the table's overflow settings.

## ✅ Changes Made

### **CSS Updates** (`/apps/static/accounting/quickbooks_expense_form.css`)

#### 1. **Table Overflow Fix**
```css
/* Changed from */
overflow: hidden;

/* To */
overflow: visible;
```
**Location**: `.expense-lines-table` class (line 146)

#### 2. **Section Overflow Fix**
```css
.expense-lines-section {
    /* Added */
    overflow: visible;
}
```
**Location**: `.expense-lines-section` class

#### 3. **Table Cell Overflow Fix**
```css
.expense-lines-table td {
    /* Added */
    overflow: visible !important;
}
```
**Location**: `.expense-lines-table td` class

#### 4. **Customer Suggestions Z-Index & Positioning**
```css
.customer-suggestions {
    position: absolute !important;
    top: 100% !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 10000 !important;
    visibility: visible !important;
    overflow: visible !important;
}
```
**Location**: `.customer-suggestions` class

---

## 🎯 Why These Changes Work

| Issue | Solution | Effect |
|-------|----------|--------|
| Dropdown clipped by table | Changed `overflow: hidden` to `visible` | Dropdown now visible above table |
| Dropdown hidden behind other elements | Increased z-index to 10000 | Dropdown appears on top |
| Dropdown position incorrect | Added absolute positioning rules | Dropdown positioned correctly below input |
| Dropdown still clipping in table cells | Added `overflow: visible !important` to td | Cell no longer clips dropdown |

---

## 🧪 Testing

1. Go to http://localhost:1000/add-expense/
2. Click in any **Customer** field
3. Start typing (e.g., "NEW" or "test")
4. **Dropdown should appear** ✅
5. Click on a suggestion → field populates ✅

---

## 📊 CSS Priority

Used `!important` for:
- `position: absolute` - Ensures absolute positioning
- `z-index: 10000` - Ensures dropdown is on top
- `visibility: visible` - Ensures dropdown is visible
- `overflow: visible` - Prevents clipping

---

## 🔗 Related Files

- Template: `/apps/templates/accounting/add_expense.html`
- JavaScript: `/apps/static/accounting/quickbooks_expense_form.js`
- CSS: `/apps/static/accounting/quickbooks_expense_form.css`

---

## ✨ Result

✅ Customer autocomplete dropdown now displays properly
✅ No overlapping or clipping issues
✅ Works on all dynamically added rows
✅ Consistent with payee autocomplete behavior

---

**Fixed**: November 12, 2025
**Status**: ✅ Ready
