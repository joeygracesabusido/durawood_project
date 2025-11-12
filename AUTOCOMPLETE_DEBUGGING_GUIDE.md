# Autocomplete Not Showing - Debugging Guide

## 🔍 Step-by-Step Troubleshooting

### Step 1: Open Browser Developer Tools
1. Go to http://localhost:1000/add-expense/
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab

### Step 2: Check Console Logs While Typing
1. Click in the **Payee** field
2. Type something (e.g., "NEW" or "test")
3. **Look at the Console** - you should see:

```
✅ Payee input changed: NEW
✅ Fetching suggestions for: NEW
✅ Raw API response: [...]
✅ Processed suggestions: [...]
✅ Displaying suggestions: [...]
✅ Suggestions count: 5
```

### Step 3: Check Network Tab
1. Open **Network** tab (F12 → Network)
2. Type in Payee field
3. Look for request to `/api-autocomplete-vendor-customer/?term=...`
4. Click it and check:
   - **Status**: Should be `200` (success)
   - **Response**: Should show JSON with customer data

### Step 4: Verify Response Format
The response should look like ONE of these:

**Format A (Array of Objects):**
```json
[
  {
    "value": "NEW MANHATTAN LUMBER & CONSTRUCTION SUPPLY",
    "customer_vendor_id": "0001",
    "category": "Cement-Hardware",
    "tax_type": "Non-Vatable"
  },
  {
    "value": "NEW SAN JOAQUIN LUMBER",
    "customer_vendor_id": "0148",
    "category": "Cement-Hardware",
    "tax_type": "Non-Vatable"
  }
]
```

**Format B (Suggestions Wrapper):**
```json
{
  "suggestions": [
    "Customer A",
    "Customer B",
    "Customer C"
  ]
}
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "No suggestions found" but data exists
**Cause**: API is returning data, but JavaScript can't parse it

**Debug in Console:**
```javascript
// Check if jQuery works
console.log($);  // Should print jQuery object

// Check if payee input exists
console.log($('#payee').length);  // Should be 1

// Check if suggestions list exists
console.log($('#payee-suggestions').length);  // Should be 1

// Manually test API
fetch('/api-autocomplete-vendor-customer/?term=NEW')
  .then(r => r.json())
  .then(d => console.log('API Response:', d))
  .catch(e => console.error('Error:', e));
```

### Issue 2: Suggestions list is hidden
**Check in Console:**
```javascript
// Check if list is visible
console.log($('#payee-suggestions').css('display'));  // Should be "block"

// Check CSS
console.log($('#payee-suggestions').attr('style'));  // Should not have display: none
```

### Issue 3: API returns 404 error
**Means**: Endpoint doesn't exist or wrong URL

**Check URL:**
- Should be: `/api-autocomplete-vendor-customer/`
- NOT: `/api-autocomplete-vendor/` (that's the expense endpoint)
- NOT: `/api-autocomplete-vendor-customer` (missing slash)

### Issue 4: API returns 401 error
**Means**: You're not logged in

**Fix**: 
- Make sure you're logged into the application
- Check that session is valid
- Log out and log back in

### Issue 5: API returns 500 error
**Means**: Server error while querying database

**Check Server Logs:**
```bash
# Look for error messages in terminal
docker compose logs -f api
```

---

## ✅ Expected Console Output

When you type in the payee field, you should see:

```
Payee input changed: N
Fetching suggestions for: N
Raw API response: Array(5)
  0: {value: "NEW MANHATTAN LUMBER & CONSTRUCTION SUPPLY", customer_vendor_id: "0001", ...}
  1: {value: "NEW SAN JOAQUIN LUMBER", customer_vendor_id: "0148", ...}
  2: ...
Processed suggestions: Array(5)
Displaying suggestions: Array(5)
Suggestions count: 5
Item 0: NEW MANHATTAN LUMBER & CONSTRUCTION SUPPLY
Item 1: NEW SAN JOAQUIN LUMBER
Item 2: ...
Showing suggestions list with 5 items
```

---

## 📊 Data Flow Diagram

```
User types "NEW"
        ↓
JavaScript detects input event
        ↓
After 300ms debounce, calls fetchPayeeSuggestions('NEW')
        ↓
AJAX GET request to /api-autocomplete-vendor-customer/?term=NEW
        ↓
Backend searches customer_vendor_profile collection
        ↓
Returns array of matching customers:
  [
    { value: "NEW MANHATTAN...", customer_vendor_id: "0001", ... },
    { value: "NEW SAN JOAQUIN...", customer_vendor_id: "0148", ... }
  ]
        ↓
JavaScript receives response in success callback
        ↓
displayPayeeSuggestions() processes the array
        ↓
For each item with 'value' field, extracts and displays
        ↓
Creates <li> for each suggestion
        ↓
Dropdown appears with items
        ↓
User clicks one
        ↓
Field populated with value
```

---

## 🔧 Quick Fixes to Try

### 1. Clear Browser Cache
```
F12 → Settings → Storage → Clear Site Data → Clear All
```
Then refresh the page.

### 2. Restart Docker
```bash
docker compose down
docker compose up
```

### 3. Check Database Has Data
Run in MongoDB:
```javascript
db.customer_vendor_profile.findOne();
```

Should return a document with `bussiness_name` field.

### 4. Test API Directly
Open in browser:
```
http://localhost:1000/api-autocomplete-vendor-customer/?term=NEW
```

Should return JSON with customer data.

---

## 📋 Debugging Checklist

- [ ] Opened F12 Console
- [ ] Typed in Payee field
- [ ] Saw "Payee input changed:" message
- [ ] Saw "Fetching suggestions for:" message
- [ ] Saw "Raw API response:" message
- [ ] Response is not empty array
- [ ] Network tab shows Status 200
- [ ] Response in Network tab is valid JSON
- [ ] Database has customer_vendor_profile records
- [ ] Typed matching customer names
- [ ] Suggestions count > 0 in console

---

## 🆘 Advanced Debugging

### Check API Endpoint Code
File: `/apps/routes/accounting/customer_profile.py` line 125

Should return:
```python
customerData = [{
    "value": data['bussiness_name'],
    "customer_vendor_id": data['customer_vendor_id'],
    "category": data['category'],
    "tax_type": data['tax_type']
} for data in result]
```

### Check JavaScript Code
File: `/apps/static/accounting/quickbooks_expense_form.js`

Function `fetchPayeeSuggestions()` should:
1. Make AJAX request to `/api-autocomplete-vendor-customer/`
2. Handle response with or without `suggestions` wrapper
3. Call `displayPayeeSuggestions()`

Function `displayPayeeSuggestions()` should:
1. Extract `value` from each object
2. Create `<li>` elements
3. Attach click handlers
4. Show dropdown

---

## 🎯 Test Scenarios

### Scenario 1: Fresh Start
1. Clear browser cache (Step 1)
2. Restart Docker (Step 2)
3. Login fresh
4. Try typing in Payee field
5. Check Console logs

### Scenario 2: Verify Database
1. Go to Customer Profile page
2. Create test customer named "TEST123"
3. Go back to Add Expense
4. Type "TEST" in Payee field
5. Should see "TEST123" in suggestions

### Scenario 3: Check Endpoint
1. Open browser console
2. Run:
```javascript
fetch('/api-autocomplete-vendor-customer/?term=test')
  .then(r => r.json())
  .then(d => { 
    console.log('API Response:', d); 
    console.log('Is Array:', Array.isArray(d));
    console.log('Length:', d.length);
  })
  .catch(e => console.error('Error:', e));
```

---

## 📞 If Still Not Working

Provide:
1. Screenshot of Console showing "Fetching suggestions for: [what you typed]"
2. Screenshot of Network tab showing the API request response
3. Screenshot of Console showing error messages (if any)
4. What you typed
5. What customers/vendors are in your database

---

**Last Updated**: November 12, 2025
**Version**: 2.0
