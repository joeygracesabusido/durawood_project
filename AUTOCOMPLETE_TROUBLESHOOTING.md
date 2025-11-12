# Payee Autocomplete - Troubleshooting Guide

## 🔍 Issue: Suggestions Not Displaying

### Possible Causes & Solutions

## 1. **No Data in Database**

The autocomplete suggests vendors/customers from your database. If there are no records, no suggestions will appear.

### Check if data exists:
- Go to add-expense page
- Open Developer Console (F12 → Console tab)
- Check the console for debugging output

### Expected Console Output:
```
Payee input changed: test
Fetching suggestions for: test
Payee suggestions response: {suggestions: Array(0)}
```

### If you see empty suggestions:
1. **Add sample expense records first**
   - Go to http://localhost:1000/expense-list/
   - Create a few expenses with vendor names
   - These vendors will then appear in autocomplete

2. **Add customer profiles first**
   - Go to customer profile section
   - Create a few customers
   - These customers will then appear in autocomplete

---

## 2. **API Endpoint Not Working**

The `/api-autocomplete-vendor/` endpoint might not be responding.

### Test the API directly:

**Option A: Using Browser**
```
http://localhost:1000/api-autocomplete-vendor/?term=test
```

You should see JSON response:
```json
{
  "suggestions": ["ABC Corp", "Test Vendor"]
}
```

**Option B: Using Terminal**
```bash
curl "http://localhost:1000/api-autocomplete-vendor/?term=test"
```

### If API returns error 401/403:
- This means you're not authenticated
- Make sure you're logged in first
- The endpoint requires valid session

### If API returns empty array:
- No vendors/customers matching search term
- Add some expense records with vendor names
- Add some customer profiles

---

## 3. **JavaScript Not Loaded**

Check if the JavaScript file is loading correctly.

### Steps:
1. Open F12 → Network tab
2. Refresh page
3. Look for `/static/accounting/quickbooks_expense_form.js`
4. Should be **Status 200** (success)

### If status is 404:
- File doesn't exist or wrong path
- Check file location: `/apps/static/accounting/quickbooks_expense_form.js`

### If you see errors in Console tab:
- Look for red error messages
- Screenshot and share the error

---

## 4. **CSS Not Applied**

Suggestions dropdown might not be visible due to CSS issues.

### Check CSS loading:
1. F12 → Network tab
2. Look for `/static/accounting/quickbooks_expense_form.css`
3. Should be **Status 200**

### If CSS is loaded but styling wrong:
1. F12 → Inspector/Elements tab
2. Click the payee input field
3. Look for suggestions list (`<ul id="payee-suggestions">`)
4. Check if it has proper styling

---

## 5. **Event Listeners Not Attached**

JavaScript might not be attaching event listeners correctly.

### Debug in Console:
```javascript
// Check if jQuery is loaded
console.log($);  // Should show jQuery object

// Check if autocomplete function exists
console.log(typeof initPayeeAutocomplete);  // Should show 'function'

// Check if payee input has listeners
console.log($('#payee').data('events'));  // Should show input, focus, blur events
```

### If functions not loaded:
- Check that JS file is actually running
- Look for any JavaScript errors in console
- Refresh page to reload

---

## 6. **Debouncing Too Long or Too Short**

The 300ms debounce might need adjustment.

### Current settings in JS:
```javascript
// In initPayeeAutocomplete()
autocompleteTimeout = setTimeout(function() {
    fetchPayeeSuggestions(term);
}, 300);  // ← 300ms delay
```

### To adjust:
- Reduce to 100ms for faster response
- Increase to 500ms if too many API calls

---

## 🛠️ Manual Testing Steps

### Test Case 1: Autocomplete with Existing Data
1. Create an expense with vendor "ABC Supplies"
2. Go to /add-expense/
3. Click payee field
4. Type "ABC"
5. Should see "ABC Supplies" in dropdown
6. Click it to select

### Test Case 2: Autocomplete with Customer
1. Create customer profile named "Big Corp"
2. Go to /add-expense/
3. Click payee field
4. Type "Big"
5. Should see "Big Corp" in dropdown

### Test Case 3: No Results
1. Type something that doesn't exist: "XYZ999"
2. Should see "No suggestions found"

### Test Case 4: Manual Entry
1. Type new vendor name: "Brand New Vendor"
2. No suggestions shown
3. Click outside field
4. Name remains in field
5. Submit form
6. New vendor saved

---

## 📋 Debugging Checklist

- [ ] Logged in (not seeing 401 errors)
- [ ] At least 1 expense created with vendor
- [ ] At least 1 customer profile created
- [ ] Browser console shows no errors
- [ ] Network tab shows 200 status for JS/CSS files
- [ ] Network tab shows 200 status for API call
- [ ] Typing in payee field triggers console logs
- [ ] API response contains suggestions array
- [ ] Dropdown `<ul>` element is visible in HTML
- [ ] CSS file has `#payee-suggestions` styles

---

## 🔧 Quick Fix Attempts

### 1. Clear Browser Cache
```
F12 → Settings → Storage → Clear Site Data
```
Then refresh page.

### 2. Restart Application
```bash
# Kill the app
pkill -f "uvicorn.*1000"

# Restart
cd /home/jerome-sabusido/Desktop/Project/durawood_project
python -m uvicorn apps.main:app --host 0.0.0.0 --port 1000 --reload
```

### 3. Check File Permissions
```bash
ls -la /apps/static/accounting/quickbooks_expense_form.js
ls -la /apps/static/accounting/quickbooks_expense_form.css
```
Should show readable files.

### 4. Verify MongoDB Connection
```bash
# Test if MongoDB is running
docker ps | grep mongo
```

---

## 💡 Next Steps

1. **Verify database has data**
   - Create a few expenses first
   - Create a few customer profiles

2. **Check browser console (F12)**
   - Look for "Payee input changed" messages
   - Look for any red error messages

3. **Test API endpoint**
   - Try: http://localhost:1000/api-autocomplete-vendor/?term=test

4. **Check network requests**
   - F12 → Network tab
   - Type in payee field
   - Should see request to `/api-autocomplete-vendor/?term=...`
   - Check response status and body

5. **Share findings**
   - Screenshot of Console tab
   - Screenshot of Network tab showing API call
   - What you typed and what you expected

---

## 📞 Getting Help

When reporting the issue, provide:
1. Screenshot of F12 Console showing any errors
2. Screenshot of F12 Network tab showing API call
3. What vendor/customer names are in your database
4. What you typed in payee field
5. What you expected vs what happened

---

**Last Updated**: November 12, 2025
**Version**: 1.0
